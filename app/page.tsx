import SurahBrowser from "@/components/SurahBrowser";
import { groupByLanguage, listTranslations, type LanguageGroup } from "@/lib/quran-api";
import { coverage } from "@/lib/videos";
import { TOTAL_AYAHS } from "@/data/surahs";

export default async function HomePage() {
  let groups: LanguageGroup[] = [];
  try {
    groups = groupByLanguage(await listTranslations());
  } catch {
    // The catalogue is decoration on this page — the surah index below is bundled
    // locally and stays usable when the upstream API is unreachable.
  }

  const videoCoverage = coverage();

  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Read, hear and understand the Quran
        </h1>
        <p className="muted max-w-2xl text-sm leading-relaxed">
          All {TOTAL_AYAHS.toLocaleString()} ayahs with the Uthmani script, word-by-word meaning,
          recitation, and translations in {groups.length || "dozens of"} languages — plus a
          verse-by-verse video explanation wherever one has been contributed.
        </p>
        <dl className="mt-1 grid grid-cols-3 gap-3 text-sm">
          <Stat label="Surahs" value="114" />
          <Stat label="Translation languages" value={groups.length ? String(groups.length) : "—"} />
          <Stat label="Ayahs explained on video" value={`${videoCoverage.percent.toFixed(1)}%`} />
        </dl>
      </section>

      <SurahBrowser groups={groups} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel rounded-lg px-4 py-3">
      <dt className="muted text-xs">{label}</dt>
      <dd className="text-xl font-semibold">{value}</dd>
    </div>
  );
}
