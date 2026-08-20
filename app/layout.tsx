import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Preach More — Learn the Quran",
  description:
    "Read the Quran in your own language, listen to the recitation word by word, and watch a verse-by-verse explanation.",
};

const NAV = [
  { href: "/", label: "Read" },
  { href: "/videos", label: "Explanations" },
  { href: "/about", label: "About" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="panel border-x-0 border-t-0 sticky top-0 z-20 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
            <Link href="/" className="flex items-baseline gap-2 font-semibold">
              <span className="text-lg">Preach More</span>
              <span className="arabic accent text-base leading-none">ٱقْرَأْ</span>
            </Link>
            <nav className="ml-auto flex gap-5 text-sm">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="muted hover:opacity-70">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>

        <footer className="muted mx-auto w-full max-w-5xl px-4 py-8 text-xs">
          Quran text, translations and recitations are served by the{" "}
          <a className="accent underline" href="https://quran.api-docs.io/">
            Quran.com API
          </a>
          . Explanation videos are contributed and remain the property of their creators.
        </footer>
      </body>
    </html>
  );
}
