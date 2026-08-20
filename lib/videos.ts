import manifest from "@/data/video-manifest.json";
import { SURAHS, TOTAL_AYAHS } from "@/data/surahs";

export type VideoProvider = "youtube" | "vimeo" | "mp4";

export type VideoSeries = {
  id: string;
  title: string;
  scholar: string;
  /** ISO 639-1 code of the language spoken in the videos. */
  language: string;
  provider: VideoProvider;
  homepage?: string;
};

/**
 * One video segment covering a verse range. Explanation series almost never
 * align to a single ayah, so a segment covers `from`..`to` inclusive and the
 * reader resolves any ayah inside that range to this segment.
 */
export type VideoEntry = {
  seriesId: string;
  /** Inclusive verse range, e.g. "2:1-2:5". A single ayah is "2:255". */
  range: string;
  /** Provider-specific id: YouTube video id, Vimeo id, or an absolute mp4 URL. */
  videoId: string;
  /** Playback offset in seconds. */
  start?: number;
  end?: number;
  title?: string;
};

type Manifest = { series: VideoSeries[]; entries: VideoEntry[] };

export type ResolvedVideo = VideoEntry & {
  series: VideoSeries;
  embedUrl: string;
  watchUrl: string;
};

export class ManifestError extends Error {}

const VERSE_KEY = /^(\d{1,3}):(\d{1,3})$/;

export function parseVerseKey(key: string): { surah: number; ayah: number } {
  const match = VERSE_KEY.exec(key.trim());
  if (!match) throw new ManifestError(`Malformed verse key "${key}" (expected "surah:ayah")`);
  const surah = Number(match[1]);
  const ayah = Number(match[2]);
  const meta = SURAHS.find((s) => s.id === surah);
  if (!meta) throw new ManifestError(`Surah ${surah} does not exist (verse key "${key}")`);
  if (ayah < 1 || ayah > meta.ayahCount) {
    throw new ManifestError(`Surah ${surah} has ${meta.ayahCount} ayahs, got "${key}"`);
  }
  return { surah, ayah };
}

/** Absolute 1-based index of an ayah across the whole Quran (1..6236). */
export function absoluteIndex(surah: number, ayah: number): number {
  let index = 0;
  for (const s of SURAHS) {
    if (s.id === surah) return index + ayah;
    index += s.ayahCount;
  }
  throw new ManifestError(`Surah ${surah} does not exist`);
}

export function parseRange(range: string): { start: number; end: number } {
  const [rawStart, rawEnd] = range.split("-");
  const from = parseVerseKey(rawStart);
  const to = rawEnd ? parseVerseKey(rawEnd) : from;
  const start = absoluteIndex(from.surah, from.ayah);
  const end = absoluteIndex(to.surah, to.ayah);
  if (end < start) throw new ManifestError(`Range "${range}" ends before it starts`);
  return { start, end };
}

function buildEmbedUrl(entry: VideoEntry, series: VideoSeries): string {
  switch (series.provider) {
    case "youtube": {
      const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
      if (entry.start) params.set("start", String(entry.start));
      if (entry.end) params.set("end", String(entry.end));
      return `https://www.youtube-nocookie.com/embed/${entry.videoId}?${params}`;
    }
    case "vimeo": {
      const fragment = entry.start ? `#t=${entry.start}s` : "";
      return `https://player.vimeo.com/video/${entry.videoId}${fragment}`;
    }
    case "mp4":
      return entry.start ? `${entry.videoId}#t=${entry.start}` : entry.videoId;
  }
}

function buildWatchUrl(entry: VideoEntry, series: VideoSeries): string {
  switch (series.provider) {
    case "youtube":
      return `https://www.youtube.com/watch?v=${entry.videoId}${entry.start ? `&t=${entry.start}` : ""}`;
    case "vimeo":
      return `https://vimeo.com/${entry.videoId}`;
    case "mp4":
      return entry.videoId;
  }
}

const data = manifest as Manifest;
const seriesById = new Map(data.series.map((s) => [s.id, s]));

function resolve(entry: VideoEntry): ResolvedVideo | null {
  const series = seriesById.get(entry.seriesId);
  if (!series) return null;
  return {
    ...entry,
    series,
    embedUrl: buildEmbedUrl(entry, series),
    watchUrl: buildWatchUrl(entry, series),
  };
}

/** Every video segment that covers the given ayah, one per series at most. */
export function videosForAyah(surah: number, ayah: number): ResolvedVideo[] {
  const index = absoluteIndex(surah, ayah);
  const matches: ResolvedVideo[] = [];
  for (const entry of data.entries) {
    let range;
    try {
      range = parseRange(entry.range);
    } catch {
      continue; // A malformed entry is reported by `npm run verify:videos`, not here.
    }
    if (index < range.start || index > range.end) continue;
    const resolved = resolve(entry);
    if (resolved) matches.push(resolved);
  }
  return matches;
}

/** Video coverage for a whole surah, keyed by ayah number. */
export function videosForSurah(surahId: number): Map<number, ResolvedVideo[]> {
  const meta = SURAHS.find((s) => s.id === surahId);
  if (!meta) throw new ManifestError(`Surah ${surahId} does not exist`);
  const byAyah = new Map<number, ResolvedVideo[]>();
  for (let ayah = 1; ayah <= meta.ayahCount; ayah++) {
    const videos = videosForAyah(surahId, ayah);
    if (videos.length > 0) byAyah.set(ayah, videos);
  }
  return byAyah;
}

export type Coverage = {
  covered: number;
  total: number;
  percent: number;
  bySurah: { surahId: number; covered: number; total: number }[];
  languages: string[];
};

export function coverage(): Coverage {
  const coveredIndices = new Set<number>();
  for (const entry of data.entries) {
    let range;
    try {
      range = parseRange(entry.range);
    } catch {
      continue;
    }
    for (let i = range.start; i <= range.end; i++) coveredIndices.add(i);
  }

  let offset = 0;
  const bySurah = SURAHS.map((s) => {
    let covered = 0;
    for (let i = 1; i <= s.ayahCount; i++) {
      if (coveredIndices.has(offset + i)) covered++;
    }
    offset += s.ayahCount;
    return { surahId: s.id, covered, total: s.ayahCount };
  });

  return {
    covered: coveredIndices.size,
    total: TOTAL_AYAHS,
    percent: (coveredIndices.size / TOTAL_AYAHS) * 100,
    bySurah,
    languages: [...new Set(data.series.map((s) => s.language))].sort(),
  };
}

export function allSeries(): VideoSeries[] {
  return data.series;
}

export function allEntries(): VideoEntry[] {
  return data.entries;
}
