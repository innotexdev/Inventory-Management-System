import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inventory",
  description: "Company equipment inventory",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Suspense
          fallback={
            <header className="border-b border-zinc-200 dark:border-zinc-800">
              <nav
                aria-label="Main"
                className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
              >
                <Link
                  href="/"
                  className="flex items-center gap-2 w-full font-semibold text-zinc-950 dark:text-zinc-50"
                >
                  <Image
                    src="/logo-2.png"
                    width={80}
                    height={80}
                    alt="site logo"
                    loading="eager"
                    className="h-8 w-auto"
                  />
                  <span>Inventory</span>
                </Link>
              </nav>
            </header>
          }
        >
          <SiteNav />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
