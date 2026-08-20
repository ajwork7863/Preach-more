import { SURAHS, type Surah } from "@/data/surahs";

const API_BASE = process.env.QURAN_API_BASE ?? "https://api.quran.com/api/v4";
const VERSE_AUDIO_BASE = "https://verses.quran.com";

/** Verses per request. The upstream API caps `per_page` at 50. */
const PAGE_SIZE = 50;

export type TranslationResource = {
  id: number;
  name: string;
  authorName: string;
  languageName: string;
  isoCode: string;
};

export type Word = {
  position: number;
  arabic: string;
  transliteration: string | null;
  translation: string | null;
};

export type Verse = {
  key: string;
  surahId: number;
  ayahNumber: number;
  arabic: string;
  translation: string | null;
  translationSource: string | null;
  words: Word[];
  audioUrl: string | null;
};

export class QuranApiError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "QuranApiError";
  }
}

async function apiGet<T>(path: string, revalidate: number): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate },
    });
  } catch (error) {
    throw new QuranApiError(`Could not reach the Quran API (${path})`, error);
  }
  if (!response.ok) {
    throw new QuranApiError(`Quran API returned ${response.status} for ${path}`);
  }
  return (await response.json()) as T;
}

/** Strips the HTML footnote markup the API embeds in some translations. */
function stripFootnotes(html: string): string {
  return html
    .replace(/<sup[^>]*>.*?<\/sup>/gs, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

type RawTranslationResource = {
  id?: number;
  name?: string;
  author_name?: string;
  language_name?: string;
  iso_code?: string;
  translated_name?: { name?: string };
};

export async function listTranslations(): Promise<TranslationResource[]> {
  const data = await apiGet<{ translations?: RawTranslationResource[] }>(
    "/resources/translations",
    60 * 60 * 24,
  );
  return (data.translations ?? [])
    .filter((t): t is RawTranslationResource & { id: number } => typeof t.id === "number")
    .map((t) => ({
      id: t.id,
      name: t.translated_name?.name?.trim() || t.name?.trim() || `Translation ${t.id}`,
      authorName: t.author_name?.trim() || "Unknown",
      languageName: (t.language_name ?? "unknown").toLowerCase(),
      isoCode: t.iso_code ?? "",
    }))
    .sort((a, b) => a.languageName.localeCompare(b.languageName) || a.name.localeCompare(b.name));
}

export type LanguageGroup = {
  languageName: string;
  isoCode: string;
  translations: TranslationResource[];
};

export function groupByLanguage(translations: TranslationResource[]): LanguageGroup[] {
  const groups = new Map<string, LanguageGroup>();
  for (const t of translations) {
    const existing = groups.get(t.languageName);
    if (existing) {
      existing.translations.push(t);
      if (!existing.isoCode && t.isoCode) existing.isoCode = t.isoCode;
    } else {
      groups.set(t.languageName, {
        languageName: t.languageName,
        isoCode: t.isoCode,
        translations: [t],
      });
    }
  }
  return [...groups.values()].sort((a, b) => a.languageName.localeCompare(b.languageName));
}

type RawWord = {
  position?: number;
  char_type_name?: string;
  text_uthmani?: string;
  text?: string;
  transliteration?: { text?: string | null };
  translation?: { text?: string | null };
};

type RawVerse = {
  verse_key?: string;
  verse_number?: number;
  text_uthmani?: string;
  audio?: { url?: string | null } | null;
  words?: RawWord[];
  translations?: { text?: string; resource_name?: string }[];
};

function normalizeVerse(raw: RawVerse, surahId: number, index: number): Verse {
  const ayahNumber = raw.verse_number ?? index + 1;
  const audioPath = raw.audio?.url ?? null;
  const words = (raw.words ?? [])
    .filter((w) => w.char_type_name !== "end")
    .map((w, i) => ({
      position: w.position ?? i + 1,
      arabic: w.text_uthmani ?? w.text ?? "",
      transliteration: w.transliteration?.text ?? null,
      translation: w.translation?.text ?? null,
    }));

  const rawTranslation = raw.translations?.[0];
  return {
    key: raw.verse_key ?? `${surahId}:${ayahNumber}`,
    surahId,
    ayahNumber,
    arabic: raw.text_uthmani ?? words.map((w) => w.arabic).join(" "),
    translation: rawTranslation?.text ? stripFootnotes(rawTranslation.text) : null,
    translationSource: rawTranslation?.resource_name ?? null,
    words,
    audioUrl: audioPath ? `${VERSE_AUDIO_BASE}/${audioPath.replace(/^\//, "")}` : null,
  };
}

export async function getSurahVerses(
  surahId: number,
  options: { translationId?: number; recitationId?: number } = {},
): Promise<Verse[]> {
  const { translationId, recitationId = 7 } = options;
  const params = new URLSearchParams({
    words: "true",
    fields: "text_uthmani",
    word_fields: "text_uthmani",
    translation_fields: "resource_name",
    audio: String(recitationId),
    per_page: String(PAGE_SIZE),
  });
  if (translationId) params.set("translations", String(translationId));

  const verses: Verse[] = [];
  let page = 1;
  // The API paginates at 50 verses; Al-Baqarah alone needs 6 round trips.
  for (;;) {
    params.set("page", String(page));
    const data = await apiGet<{
      verses?: RawVerse[];
      pagination?: { next_page?: number | null };
    }>(`/verses/by_chapter/${surahId}?${params}`, 60 * 60 * 24 * 7);

    const batch = data.verses ?? [];
    batch.forEach((raw, i) => verses.push(normalizeVerse(raw, surahId, verses.length + i)));

    const nextPage = data.pagination?.next_page;
    if (!nextPage || batch.length === 0) break;
    page = nextPage;
  }
  return verses;
}

export function surahMeta(surahId: number): Surah {
  const surah = SURAHS.find((s) => s.id === surahId);
  if (!surah) throw new QuranApiError(`Surah ${surahId} does not exist`);
  return surah;
}
