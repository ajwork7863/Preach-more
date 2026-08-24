import { SURAHS, type Surah } from "@/data/surahs";

const API_BASE = process.env.QURAN_API_BASE ?? "https://api.quran.com/api/v4";
const VERSE_AUDIO_BASE = "https://verses.quran.com";

/** Verses per request. The upstream API caps `per_page` at 50. */
const PAGE_SIZE = 50;

/**
 * "Dr. Mustafa Khattab, the Clear Quran" — a published translation deliberately
 * written in contemporary, plain English. It is shown as a second paragraph
 * under the reader's chosen translation so that someone who struggles with the
 * classical phrasing of older translations still gets the meaning.
 *
 * This is a real published translation, not generated text. `resolvePlainEnglishId`
 * re-checks the catalogue at runtime in case the id ever moves.
 */
export const PLAIN_ENGLISH_TRANSLATION_ID = 131;

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
  /** The same ayah in plain English, from a second published translation. */
  plainEnglish: string | null;
  plainEnglishSource: string | null;
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

type RawTranslation = { text?: string; resource_id?: number; resource_name?: string };

type RawVerse = {
  verse_key?: string;
  verse_number?: number;
  text_uthmani?: string;
  audio?: { url?: string | null } | null;
  words?: RawWord[];
  translations?: RawTranslation[];
};

/**
 * Picks one requested translation out of a verse's `translations` array.
 *
 * The API echoes `resource_id`, so match on that first. Some editions have been
 * seen to omit it, in which case fall back to the position the id was requested
 * in — the API preserves request order.
 */
function selectTranslation(
  list: RawTranslation[],
  id: number | undefined,
  requested: number[],
): RawTranslation | undefined {
  if (id === undefined) return undefined;
  const byId = list.find((t) => t.resource_id === id);
  if (byId) return byId;
  const position = requested.indexOf(id);
  return position >= 0 ? list[position] : undefined;
}

function normalizeVerse(
  raw: RawVerse,
  surahId: number,
  index: number,
  ids: { translationId?: number; plainEnglishId?: number },
  requested: number[],
): Verse {
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

  const list = raw.translations ?? [];
  const primary = selectTranslation(list, ids.translationId, requested) ?? list[0];
  // When the reader has already chosen the plain-English edition, showing it
  // again underneath itself would just be the same paragraph twice.
  const duplicate = ids.plainEnglishId !== undefined && ids.plainEnglishId === ids.translationId;
  const plain = duplicate
    ? undefined
    : selectTranslation(list, ids.plainEnglishId, requested);

  return {
    key: raw.verse_key ?? `${surahId}:${ayahNumber}`,
    surahId,
    ayahNumber,
    arabic: raw.text_uthmani ?? words.map((w) => w.arabic).join(" "),
    translation: primary?.text ? stripFootnotes(primary.text) : null,
    translationSource: primary?.resource_name ?? null,
    plainEnglish: plain?.text ? stripFootnotes(plain.text) : null,
    plainEnglishSource: plain?.resource_name ?? null,
    words,
    audioUrl: audioPath ? `${VERSE_AUDIO_BASE}/${audioPath.replace(/^\//, "")}` : null,
  };
}

export async function getSurahVerses(
  surahId: number,
  options: {
    translationId?: number;
    /** Pass null to skip the plain-English paragraph entirely. */
    plainEnglishId?: number | null;
    recitationId?: number;
  } = {},
): Promise<Verse[]> {
  const { translationId, plainEnglishId, recitationId = 7 } = options;

  // Both translations come back in one request, so the second paragraph costs
  // no extra round trips.
  const requested = [...new Set([translationId, plainEnglishId ?? undefined].filter(
    (id): id is number => typeof id === "number",
  ))];

  const params = new URLSearchParams({
    words: "true",
    fields: "text_uthmani",
    word_fields: "text_uthmani",
    translation_fields: "resource_name",
    audio: String(recitationId),
    per_page: String(PAGE_SIZE),
  });
  if (requested.length > 0) params.set("translations", requested.join(","));

  const ids = { translationId, plainEnglishId: plainEnglishId ?? undefined };

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
    batch.forEach((raw, i) =>
      verses.push(normalizeVerse(raw, surahId, verses.length + i, ids, requested)),
    );

    const nextPage = data.pagination?.next_page;
    if (!nextPage || batch.length === 0) break;
    page = nextPage;
  }
  return verses;
}

/**
 * Finds the plain-English edition in the live catalogue, so the feature survives
 * the hardcoded id changing upstream. Falls back to the constant when the
 * catalogue cannot be reached.
 */
export async function resolvePlainEnglishId(): Promise<number> {
  try {
    const translations = await listTranslations();
    const match =
      translations.find((t) => t.id === PLAIN_ENGLISH_TRANSLATION_ID) ??
      translations.find(
        (t) => t.languageName === "english" && /clear quran/i.test(t.name),
      );
    return match?.id ?? PLAIN_ENGLISH_TRANSLATION_ID;
  } catch {
    return PLAIN_ENGLISH_TRANSLATION_ID;
  }
}

export function surahMeta(surahId: number): Surah {
  const surah = SURAHS.find((s) => s.id === surahId);
  if (!surah) throw new QuranApiError(`Surah ${surahId} does not exist`);
  return surah;
}
