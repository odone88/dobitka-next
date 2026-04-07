import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Editorial display — nagłówki, tytuły sekcji
const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
});

// Czytelny body — cały tekst
const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
});

// Precyzyjny mono — wyniki, minuty, dane liczbowe
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: "DOBITKA — codzienny przegląd piłki",
  description: "Wyniki live, tabele, strzelcy, newsy z BBC/Guardian/Weszło/Reddit — codziennie, bezkompromisowo.",
  manifest: "/manifest.json",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚽</text></svg>",
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
  openGraph: {
    title: "DOBITKA — codzienny przegląd piłki",
    description: "Wyniki live, tabele, strzelcy, newsy z BBC/Guardian/Weszło/Reddit — codziennie, bezkompromisowo.",
    siteName: "DOBITKA",
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DOBITKA — codzienny przegląd piłki",
    description: "Wyniki live, tabele, strzelcy, newsy — codziennie, bezkompromisowo.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className="dark">
      <body className={`${dmSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased bg-background min-h-screen`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
