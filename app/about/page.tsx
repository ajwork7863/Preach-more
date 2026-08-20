import { LANGUAGES } from "@/lib/languages";
import { TOTAL_AYAHS } from "@/data/surahs";

export const metadata = { title: "About — Preach More" };

export default function AboutPage() {
  return (
    <div className="grid max-w-2xl gap-6 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold">About Preach More</h1>

      <p className="muted">
        One place to read the Quran, hear it recited, follow the meaning word by word, and watch a
        teacher explain each passage — in whatever language you think in.
      </p>

      <section className="grid gap-2">
        <h2 className="text-base font-semibold">Where the text comes from</h2>
        <p className="muted">
          The Arabic text, the word-by-word data, the recitations and every translation are served
          by the Quran.com API, which publishes established scholarly translations. Nothing in this
          app rewrites, paraphrases or machine-generates the Quran or its translations.
        </p>
      </section>

      <section className="grid gap-2">
        <h2 className="text-base font-semibold">Languages</h2>
        <p className="muted">
          The reader lists every published translation the API exposes, grouped by language, and
          knows how to render {LANGUAGES.length} languages with the correct script direction. Where
          a language has no published translation yet, the honest answer is that it is missing — the
          app says so rather than substituting an automatic translation of scripture.
        </p>
      </section>

      <section className="grid gap-2">
        <h2 className="text-base font-semibold">Video explanations</h2>
        <p className="muted">
          Explanations are contributed as a manifest of video segments, each mapped to a verse
          range. That means an existing tafsir series can be indexed once and instantly become
          searchable at ayah level, without re-uploading anyone&rsquo;s work. Covering all{" "}
          {TOTAL_AYAHS.toLocaleString()} ayahs is a long project; the coverage page shows exactly
          how far along it is.
        </p>
      </section>

      <section className="grid gap-2">
        <h2 className="text-base font-semibold">Your data</h2>
        <p className="muted">
          Bookmarks, reading position and display preferences live in this browser&rsquo;s local
          storage. There is no account and nothing is sent to a server.
        </p>
      </section>
    </div>
  );
}
