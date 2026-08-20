"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SURAHS } from "@/data/surahs";
import type { LanguageGroup } from "@/lib/quran-api";
import { usePreferences, useProgress } from "@/lib/preferences";
import LanguagePicker from "./LanguagePicker";

export default function SurahBrowser({ groups }: { groups: LanguageGroup[] }) {
  const [query, setQuery] = useState("");
  const { preferences, update, loaded } = usePreferences();
  const progress = useProgress();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SURAHS;
    return SURAHS.filter(
      (s) =>
        String(s.id) === q ||
        s.transliteration.toLowerCase().includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        s.arabicName.includes(query.trim()),
    );
  }, [query]);

  const href = (surahId: number, ayah?: number) =>
    `/surah/${surahId}?t=${preferences.translationId}${ayah ? `#ayah-${ayah}` : ""}`;

  return (
    <div className="grid gap-6">
      <section className="panel grid gap-4 rounded-xl p-5">
        <LanguagePicker
          groups={groups}
          translationId={preferences.translationId}
          onChange={(translationId) => update({ translationId })}
        />
        {loaded && progress ? (
          <Link
            href={href(progress.surahId, progress.ayahNumber)}
            className="accent text-sm underline underline-offset-4"
          >
            Continue where you left off — {progress.surahId}:{progress.ayahNumber}
          </Link>
        ) : null}
      </section>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a surah by name, meaning or number"
        className="panel w-full rounded-lg px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
      />

      <ul className="grid gap-2 sm:grid-cols-2">
        {results.map((surah) => (
          <li key={surah.id}>
            <Link
              href={href(surah.id)}
              className="panel flex items-center gap-3 rounded-lg px-4 py-3 transition hover:border-[var(--accent)]"
            >
              <span
                className="accent grid h-8 w-8 shrink-0 place-items-center rounded-md text-xs font-semibold"
                style={{ background: "var(--accent-soft)" }}
              >
                {surah.id}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{surah.transliteration}</span>
                <span className="muted block truncate text-xs">
                  {surah.englishName} · {surah.ayahCount} ayahs · {surah.revelation}
                </span>
              </span>
              <span className="arabic shrink-0 text-xl leading-none">{surah.arabicName}</span>
            </Link>
          </li>
        ))}
      </ul>

      {results.length === 0 ? <p className="muted text-sm">No surah matches “{query}”.</p> : null}
    </div>
  );
}
