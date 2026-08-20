"use client";

import { useCallback, useEffect, useState } from "react";

export type Preferences = {
  translationId: number;
  showTransliteration: boolean;
  showWordByWord: boolean;
  hideTranslation: boolean;
};

/** Sahih International — the default until the reader picks their language. */
export const DEFAULT_TRANSLATION_ID = 20;

const DEFAULTS: Preferences = {
  translationId: DEFAULT_TRANSLATION_ID,
  showTransliteration: false,
  showWordByWord: false,
  hideTranslation: false,
};

const KEY = "preach-more:preferences";

function read(): Preferences {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const stored = window.localStorage.getItem(KEY);
    return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPreferences(read());
    setLoaded(true);
  }, []);

  const update = useCallback((patch: Partial<Preferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // Private browsing with storage disabled: keep the in-memory value.
      }
      return next;
    });
  }, []);

  return { preferences, update, loaded };
}

const PROGRESS_KEY = "preach-more:progress";

export type Progress = { surahId: number; ayahNumber: number; at: number };

export function saveProgress(surahId: number, ayahNumber: number) {
  try {
    const entry: Progress = { surahId, ayahNumber, at: Date.now() };
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(entry));
  } catch {
    // Ignored — progress tracking is a convenience, not a requirement.
  }
}

export function useProgress(): Progress | null {
  const [progress, setProgress] = useState<Progress | null>(null);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PROGRESS_KEY);
      if (stored) setProgress(JSON.parse(stored));
    } catch {
      setProgress(null);
    }
  }, []);
  return progress;
}

const BOOKMARKS_KEY = "preach-more:bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(BOOKMARKS_KEY);
      if (stored) setBookmarks(JSON.parse(stored));
    } catch {
      setBookmarks([]);
    }
  }, []);

  const toggle = useCallback((verseKey: string) => {
    setBookmarks((current) => {
      const next = current.includes(verseKey)
        ? current.filter((k) => k !== verseKey)
        : [...current, verseKey];
      try {
        window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
      } catch {
        // Ignored.
      }
      return next;
    });
  }, []);

  return { bookmarks, toggle };
}
