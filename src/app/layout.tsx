import type { Metadata } from "next";
import { Itim, Jacques_Francois } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const jacques = Jacques_Francois({ weight: "400", subsets: ["latin"], variable: "--font-jacques" });
const itim = Itim({ weight: "400", subsets: ["latin"], variable: "--font-itim" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
  ),
  title: { default: "Commonplace", template: "%s · Commonplace" },
  description:
    "A commonplace book, kept in public. Share the lines that stay with you — no accounts, no noise.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jacques.variable} ${itim.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <header className="w-full px-6 md:px-[41px]">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b-2 border-burgundy pt-8 pb-4">
            <Link href="/" className="shrink-0">
              <Image
                src="/logo.svg"
                alt="Commonplace"
                width={170}
                height={39}
                priority
                unoptimized
                className="h-auto w-[140px] md:w-[170px]"
              />
            </Link>
            <nav aria-label="Main" className="flex gap-6 text-base text-slate md:gap-[42px] md:text-[17px]">
              <Link href="/browse" className="hover:text-burgundy">
                Browse
              </Link>
              <Link href="/submit" className="hover:text-burgundy">
                Submit a line
              </Link>
              <Link href="/about" className="hover:text-burgundy">
                About
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
