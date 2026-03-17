import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DOBITKA — codzienny przegląd piłki",
  description: "Twój poranny dashboard piłkarski. Live wyniki, tabele, transfery, newsy — wszystko co ważne w 3 minuty.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚽</text></svg>",
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
