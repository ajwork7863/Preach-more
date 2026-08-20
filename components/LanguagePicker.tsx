"use client";

import { useMemo, useState } from "react";
import type { LanguageGroup } from "@/lib/quran-api";
import { displayName } from "@/lib/languages";

type Props = {
  groups: LanguageGroup[];
  translationId: number;
  onChange: (translationId: number) => void;
};

export default function LanguagePicker({ groups, translationId, onChange }: Props) {
  const [query, setQuery] = useState("");

  const selectedLanguage = useMemo(() => {
    const group = groups.find((g) => g.translations.some((t) => t.id === translationId));
    return group?.languageName ?? "";
  }, [groups, translationId]);

  const [language, setLanguage] = useState(selectedLanguage);
  const activeLanguage = language || selectedLanguage;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) => g.languageName.includes(q) || displayName(g.languageName).toLowerCase().includes(q),
    );
  }, [groups, query]);

  const editions = groups.find((g) => g.languageName === activeLanguage)?.translations ?? [];

  if (groups.length === 0) {
    return (
      <p className="muted text-sm">
        The translation catalogue could not be loaded. The reader falls back to its default
        translation.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm">
        <span className="muted">Language ({groups.length} available)</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search e.g. Bengali, français, 中文"
          className="panel rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
        <select
          size={1}
          value={activeLanguage}
          onChange={(e) => {
            const next = e.target.value;
            setLanguage(next);
            const first = groups.find((g) => g.languageName === next)?.translations[0];
            if (first) onChange(first.id);
          }}
          className="panel rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        >
          {filtered.map((group) => (
            <option key={group.languageName} value={group.languageName}>
              {displayName(group.languageName)} ({group.translations.length})
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm">
        <span className="muted">Translation</span>
        <select
          value={translationId}
          onChange={(e) => onChange(Number(e.target.value))}
          className="panel mt-[1.85rem] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        >
          {editions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} — {t.authorName}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
