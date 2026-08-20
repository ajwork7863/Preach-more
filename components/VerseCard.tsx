"use client";

import { useState } from "react";
import type { Verse } from "@/lib/quran-api";
import type { ResolvedVideo } from "@/lib/videos";
import { displayName, isRtl } from "@/lib/languages";

type Props = {
  verse: Verse;
  videos: ResolvedVideo[];
  showTransliteration: boolean;
  showWordByWord: boolean;
  hideTranslation: boolean;
  bookmarked: boolean;
  playing: boolean;
  translationLanguage: string;
  onPlay: () => void;
  onBookmark: () => void;
  onFocus: () => void;
};

export default function VerseCard({
  verse,
  videos,
  showTransliteration,
  showWordByWord,
  hideTranslation,
  bookmarked,
  playing,
  translationLanguage,
  onPlay,
  onBookmark,
  onFocus,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const [openVideo, setOpenVideo] = useState<ResolvedVideo | null>(null);

  const transliteration = verse.words
    .map((w) => w.transliteration)
    .filter(Boolean)
    .join(" ");

  const translationHidden = hideTranslation && !revealed;
  const rtlTranslation = isRtl(translationLanguage);

  return (
    <article
      id={`ayah-${verse.ayahNumber}`}
      onMouseEnter={onFocus}
      className="panel scroll-mt-20 rounded-xl p-5"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="muted text-xs font-medium tabular-nums">{verse.key}</span>
        <div className="ml-auto flex items-center gap-1">
          {verse.audioUrl ? (
            <button
              type="button"
              onClick={onPlay}
              aria-label={playing ? `Pause ayah ${verse.key}` : `Play ayah ${verse.key}`}
              className="muted rounded-md px-2 py-1 text-xs hover:opacity-70"
            >
              {playing ? "❚❚ Playing" : "▶ Listen"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onBookmark}
            aria-pressed={bookmarked}
            aria-label={`Bookmark ayah ${verse.key}`}
            className="rounded-md px-2 py-1 text-xs hover:opacity-70"
            style={{ color: bookmarked ? "var(--gold)" : "var(--muted)" }}
          >
            {bookmarked ? "★ Saved" : "☆ Save"}
          </button>
          {videos.length > 0 ? (
            <button
              type="button"
              onClick={() => setOpenVideo(openVideo ? null : videos[0])}
              className="accent rounded-md px-2 py-1 text-xs hover:opacity-70"
            >
              {openVideo ? "Hide explanation" : `Explanation (${videos.length})`}
            </button>
          ) : null}
        </div>
      </div>

      <p className="arabic mb-4">{verse.arabic}</p>

      {showWordByWord && verse.words.length > 0 ? (
        <ul className="mb-4 flex flex-row-reverse flex-wrap gap-x-4 gap-y-3">
          {verse.words.map((word) => (
            <li key={word.position} className="text-center">
              <span className="arabic block text-2xl leading-snug">{word.arabic}</span>
              {word.transliteration ? (
                <span className="muted block text-[0.7rem] italic">{word.transliteration}</span>
              ) : null}
              {word.translation ? (
                <span className="block text-xs">{word.translation}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {showTransliteration && transliteration ? (
        <p className="muted mb-3 text-sm italic">{transliteration}</p>
      ) : null}

      {verse.translation ? (
        translationHidden ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="muted w-full rounded-md border border-dashed py-3 text-xs"
            style={{ borderColor: "var(--border)" }}
          >
            Translation hidden for memorisation — tap to reveal
          </button>
        ) : (
          <p
            className="text-[0.95rem] leading-relaxed"
            dir={rtlTranslation ? "rtl" : "ltr"}
            lang={translationLanguage}
          >
            {verse.translation}
          </p>
        )
      ) : (
        <p className="muted text-sm">No translation available in this edition for this ayah.</p>
      )}

      {openVideo ? (
        <div className="mt-4 grid gap-2">
          <div className="aspect-video overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
            {openVideo.series.provider === "mp4" ? (
              <video src={openVideo.embedUrl} controls className="h-full w-full" />
            ) : (
              <iframe
                src={openVideo.embedUrl}
                title={openVideo.title ?? `Explanation of ${verse.key}`}
                allow="accelerometer; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            )}
          </div>
          <p className="muted text-xs">
            {openVideo.title ?? openVideo.series.title} — {openVideo.series.scholar} ·{" "}
            {displayName(openVideo.series.language)} · covers {openVideo.range} ·{" "}
            <a className="accent underline" href={openVideo.watchUrl} target="_blank" rel="noreferrer">
              open on source
            </a>
          </p>
          {videos.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {videos.map((video) => (
                <button
                  key={`${video.seriesId}-${video.range}`}
                  type="button"
                  onClick={() => setOpenVideo(video)}
                  className="panel rounded-md px-2 py-1 text-xs"
                  style={{
                    borderColor: video === openVideo ? "var(--accent)" : "var(--border)",
                  }}
                >
                  {displayName(video.series.language)} · {video.series.scholar}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
