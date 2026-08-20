# Preach More

A one-stop place to learn the Quran: the Uthmani text with word-by-word meaning,
recitation audio, translations in every published language, and a verse-by-verse
video explanation wherever one has been contributed.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript, no emit |
| `npm run verify:videos` | Validates the video manifest and prints coverage |

### Network requirements

The Arabic text, translations, word-by-word data and audio are fetched from the
[Quran.com API](https://quran.api-docs.io/) at `api.quran.com`. That host must be
reachable from wherever the Next.js server runs. If it is not, every page still
renders — the surah index is bundled locally — and the reader shows an explicit
"could not load" panel rather than a blank screen.

Point `QURAN_API_BASE` at a different base URL to use a mirror or a local fixture
server.

## How it fits together

```
app/            Next.js App Router pages (index, reader, coverage, about)
components/     Reader UI: surah browser, language picker, verse card
lib/quran-api.ts   Quran.com v4 adapter — pagination, footnote stripping, audio URLs
lib/languages.ts   ISO 639-1 registry with native names and script direction
lib/videos.ts      Video manifest: range resolution and coverage maths
lib/preferences.ts localStorage for bookmarks, reading position, display settings
data/surahs.ts     All 114 surahs (6,236 ayahs) — works offline
data/video-manifest.json  Contributed explanation videos
```

Verses are fetched on the server and cached for a day. Bookmarks, reading
position and display preferences live in the browser's local storage; there are
no accounts and no server-side user data.

## Translations

The language picker lists every translation the Quran.com API publishes, grouped
by language, with the native language name and correct script direction for the
123 languages in `lib/languages.ts`.

Where a language has no published translation, the app says so. It does not
machine-translate scripture — an automatic translation of the Quran is not a
translation of the Quran, and presenting one as such would be worse than the gap
it fills. Filling those gaps means commissioning or indexing a real translation.

## Contributing a video explanation

Explanations are indexed, not re-hosted. An existing tafsir series is described
once in `data/video-manifest.json` and becomes searchable at ayah level:

```json
{
  "series": [
    {
      "id": "my-series",
      "title": "Verse-by-Verse Tafsir",
      "scholar": "Name of the teacher",
      "language": "en",
      "provider": "youtube",
      "homepage": "https://example.org/series"
    }
  ],
  "entries": [
    {
      "seriesId": "my-series",
      "range": "2:1-2:5",
      "videoId": "YOUTUBE_VIDEO_ID",
      "start": 0,
      "end": 640,
      "title": "Al-Baqarah, opening"
    }
  ]
}
```

- `range` is an inclusive verse range (`"2:255"` for a single ayah). Any ayah
  inside the range resolves to this segment, so a one-hour lecture covering a
  passage only needs one entry.
- `start` and `end` are playback offsets in seconds, letting several ayah ranges
  share one long video.
- `provider` is `youtube`, `vimeo`, or `mp4` (in which case `videoId` is an
  absolute URL).
- Multiple series may cover the same ayah — the reader offers them side by side,
  labelled by language and teacher, which is how the same passage ends up
  explained in many languages.

Run `npm run verify:videos` before opening a pull request. It rejects unknown
series ids, malformed or out-of-bounds verse ranges, placeholder video ids and
backwards timestamps, then prints total coverage.

`data/video-manifest.example.json` is a filled-in reference.

## Attribution

Quran text, translations and recitations are served by the Quran.com API and
belong to their respective publishers. Explanation videos remain the property of
their creators and are embedded from their original platform, never re-uploaded.
