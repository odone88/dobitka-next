import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DOBITKA — codzienny przegląd piłki",
  description: "Wyniki live, tabele, strzelcy, newsy z BBC/Guardian/Weszło/Reddit — codziennie, bezkompromisowo.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚽</text></svg>",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
