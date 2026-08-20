import { notFound } from "next/navigation";
import Reader from "@/components/Reader";
import { SURAHS } from "@/data/surahs";
import { getSurahVerses, listTranslations, type Verse } from "@/lib/quran-api";
import { videosForSurah, type ResolvedVideo } from "@/lib/videos";

// Rendered per request because the translation is chosen with `?t=`, but the
// upstream fetches are cached for a day.
export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const surah = SURAHS.find((s) => s.id === Number(id));
  return surah
    ? { title: `${surah.transliteration} — Preach More`, description: surah.englishName }
    : { title: "Surah not found" };
}

export default async function SurahPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const surah = SURAHS.find((s) => s.id === Number(id));
  if (!surah) notFound();

  const translationId = Number((await searchParams).t) || undefined;

  let verses: Verse[] = [];
  let failure: string | null = null;
  try {
    verses = await getSurahVerses(surah.id, { translationId });
  } catch (error) {
    failure = error instanceof Error ? error.message : "Unknown error";
  }

  let translationLanguage = "en";
  let translationName: string | null = null;
  if (translationId) {
    try {
      const match = (await listTranslations()).find((t) => t.id === translationId);
      if (match) {
        translationLanguage = match.isoCode || match.languageName;
        translationName = `${match.name} (${match.authorName})`;
      }
    } catch {
      // Falls back to the defaults above.
    }
  }

  const videosByAyah: Record<number, ResolvedVideo[]> = Object.fromEntries(
    videosForSurah(surah.id),
  );

  if (failure) {
    return (
      <div className="panel grid gap-2 rounded-xl p-6">
        <h1 className="text-xl font-semibold">
          {surah.id}. {surah.transliteration}
        </h1>
        <p className="muted text-sm">
          The Quran text could not be loaded right now: {failure}. Check the network connection and
          reload — nothing has been lost, your bookmarks and progress are stored on this device.
        </p>
      </div>
    );
  }

  return (
    <Reader
      surah={surah}
      verses={verses}
      videosByAyah={videosByAyah}
      translationLanguage={translationLanguage}
      translationName={translationName}
    />
  );
}
