import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const sans = Geist({ variable: "--font-sans-face", subsets: ["latin"] });

const serif = Newsreader({
  variable: "--font-serif-face",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
  ),
  title: { default: "Commonplace", template: "%s · Commonplace" },
  description: "A public commonplace book. Leave a line worth keeping — no account needed.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <header className="border-b border-rule">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link href="/" className="font-serif text-2xl font-medium italic tracking-tight">
              Commonplace
            </Link>
            <nav className="flex gap-5 text-sm text-muted">
              <Link href="/lines" className="hover:text-ink">
                All lines
              </Link>
              <Link href="/categories" className="hover:text-ink">
                Categories
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-4 py-10 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-rule">
          <p className="mx-auto w-full max-w-3xl px-4 py-6 text-sm text-muted sm:px-6">
            Commonplace is public. Anyone can read and add a line.
          </p>
        </footer>
      </body>
    </html>
  );
}
