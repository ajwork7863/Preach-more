import Link from "next/link";
import { SURAHS } from "@/data/surahs";
import { allSeries, coverage } from "@/lib/videos";
import { displayName } from "@/lib/languages";

export const metadata = {
  title: "Verse-by-verse explanations — Preach More",
  description: "Which ayahs have a video explanation, in which language, and by whom.",
};

export default function VideosPage() {
  const stats = coverage();
  const series = allSeries();

  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <h1 className="text-2xl font-semibold">Verse-by-verse explanations</h1>
        <p className="muted max-w-2xl text-sm leading-relaxed">
          The goal is a video explanation for every one of the {stats.total.toLocaleString()} ayahs,
          in as many languages as there are teachers willing to record them. Coverage is tracked
          here and grows as segments are added to the manifest.
        </p>
        <div className="panel rounded-lg p-4">
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span className="font-medium">
              {stats.covered.toLocaleString()} of {stats.total.toLocaleString()} ayahs
            </span>
            <span className="muted">{stats.percent.toFixed(2)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max(stats.percent, 0.4)}%`, background: "var(--accent)" }}
            />
          </div>
          <p className="muted mt-2 text-xs">
            Languages covered: {stats.languages.map(displayName).join(", ") || "none yet"}
          </p>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Contributed series</h2>
        {series.length === 0 ? (
          <p className="muted text-sm">
            No series has been contributed yet. Add one to{" "}
            <code className="text-xs">data/video-manifest.json</code> following{" "}
            <code className="text-xs">data/video-manifest.example.json</code>, then run{" "}
            <code className="text-xs">npm run verify:videos</code> to validate the ranges before
            opening a pull request.
          </p>
        ) : (
          <ul className="grid gap-2">
            {series.map((s) => (
              <li key={s.id} className="panel rounded-lg px-4 py-3 text-sm">
                <span className="font-medium">{s.title}</span>
                <span className="muted block text-xs">
                  {s.scholar} · {displayName(s.language)} · {s.provider}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Coverage by surah</h2>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {stats.bySurah.map((row) => {
            const surah = SURAHS[row.surahId - 1];
            const percent = (row.covered / row.total) * 100;
            return (
              <li key={row.surahId}>
                <Link
                  href={`/surah/${row.surahId}`}
                  className="panel flex items-center gap-3 rounded-md px-3 py-2 text-xs hover:border-[var(--accent)]"
                >
                  <span className="muted w-8 tabular-nums">{row.surahId}</span>
                  <span className="min-w-0 flex-1 truncate">{surah.transliteration}</span>
                  <span
                    className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full"
                    style={{ background: "var(--border)" }}
                  >
                    <span
                      className="block h-full"
                      style={{ width: `${percent}%`, background: "var(--accent)" }}
                    />
                  </span>
                  <span className="muted w-14 shrink-0 text-right tabular-nums">
                    {row.covered}/{row.total}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
