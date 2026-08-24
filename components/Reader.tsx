"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Verse } from "@/lib/quran-api";
import type { ResolvedVideo } from "@/lib/videos";
import type { Surah } from "@/data/surahs";
import { saveProgress, useBookmarks, usePreferences } from "@/lib/preferences";
import VerseCard from "./VerseCard";

type Props = {
  surah: Surah;
  verses: Verse[];
  videosByAyah: Record<number, ResolvedVideo[]>;
  translationLanguage: string;
  translationName: string | null;
};

export default function Reader({
  surah,
  verses,
  videosByAyah,
  translationLanguage,
  translationName,
}: Props) {
  const { preferences, update } = usePreferences();
  const { bookmarks, toggle } = useBookmarks();
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [repeat, setRepeat] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playsLeft = useRef(1);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    const onEnded = () => {
      playsLeft.current -= 1;
      if (playsLeft.current > 0) {
        audio.currentTime = 0;
        void audio.play();
      } else {
        setPlayingKey(null);
      }
    };
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, []);

  const play = (verse: Verse) => {
    const audio = audioRef.current;
    if (!audio || !verse.audioUrl) return;
    if (playingKey === verse.key) {
      audio.pause();
      setPlayingKey(null);
      return;
    }
    playsLeft.current = repeat;
    audio.src = verse.audioUrl;
    void audio.play();
    setPlayingKey(verse.key);
    saveProgress(surah.id, verse.ayahNumber);
  };

  const plainEnglishSource = verses.find((v) => v.plainEnglishSource)?.plainEnglishSource ?? null;
  const previous = surah.id > 1 ? surah.id - 1 : null;
  const next = surah.id < 114 ? surah.id + 1 : null;
  const linkTo = (id: number) => `/surah/${id}?t=${preferences.translationId}`;

  return (
    <div className="grid gap-6">
      <header className="grid gap-1">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold">
            {surah.id}. {surah.transliteration}
          </h1>
          <span className="arabic text-2xl leading-none">{surah.arabicName}</span>
        </div>
        <p className="muted text-sm">
          {surah.englishName} · {surah.ayahCount} ayahs · {surah.revelation} revelation
          {translationName ? ` · ${translationName}` : ""}
        </p>
        {preferences.showPlainEnglish && plainEnglishSource ? (
          <p className="muted text-xs">
            Simple English paragraphs are from {plainEnglishSource}, a published plain-English
            translation.
          </p>
        ) : null}
      </header>

      <div
        className="panel sticky top-[3.25rem] z-10 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg px-4 py-2 text-xs"
        style={{ backdropFilter: "blur(6px)" }}
      >
        <Toggle
          label="Transliteration"
          checked={preferences.showTransliteration}
          onChange={(showTransliteration) => update({ showTransliteration })}
        />
        <Toggle
          label="Word by word"
          checked={preferences.showWordByWord}
          onChange={(showWordByWord) => update({ showWordByWord })}
        />
        <Toggle
          label="Simple English"
          checked={preferences.showPlainEnglish}
          onChange={(showPlainEnglish) => update({ showPlainEnglish })}
        />
        <Toggle
          label="Memorisation mode"
          checked={preferences.hideTranslation}
          onChange={(hideTranslation) => update({ hideTranslation })}
        />
        <label className="muted ml-auto flex items-center gap-2">
          Repeat
          <select
            value={repeat}
            onChange={(e) => setRepeat(Number(e.target.value))}
            className="panel rounded px-2 py-1"
          >
            {[1, 3, 5, 10].map((n) => (
              <option key={n} value={n}>
                {n}×
              </option>
            ))}
          </select>
        </label>
      </div>

      {surah.id !== 1 && surah.id !== 9 ? (
        <p className="arabic text-center text-2xl">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
      ) : null}

      <div className="grid gap-4">
        {verses.map((verse) => (
          <VerseCard
            key={verse.key}
            verse={verse}
            videos={videosByAyah[verse.ayahNumber] ?? []}
            showTransliteration={preferences.showTransliteration}
            showWordByWord={preferences.showWordByWord}
            hideTranslation={preferences.hideTranslation}
            showPlainEnglish={preferences.showPlainEnglish}
            bookmarked={bookmarks.includes(verse.key)}
            playing={playingKey === verse.key}
            translationLanguage={translationLanguage}
            onPlay={() => play(verse)}
            onBookmark={() => toggle(verse.key)}
            onFocus={() => saveProgress(surah.id, verse.ayahNumber)}
          />
        ))}
      </div>

      <nav className="flex justify-between text-sm">
        {previous ? (
          <Link className="accent underline underline-offset-4" href={linkTo(previous)}>
            ← Surah {previous}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="accent underline underline-offset-4" href={linkTo(next)}>
            Surah {next} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="muted flex cursor-pointer items-center gap-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[var(--accent)]"
      />
      {label}
    </label>
  );
}
