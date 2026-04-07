import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { LiveResults } from '@/components/LiveResults';

export const metadata: Metadata = {
  title: 'Wyniki na zywo - mecze pilkarskie live | DOBITKA',
  description: 'Sledz wyniki meczow pilkarskich na zywo. Aktualizacja co 15 sekund.',
  openGraph: {
    title: 'Wyniki na zywo - mecze pilkarskie live | DOBITKA',
    description: 'Sledz wyniki meczow pilkarskich na zywo. Aktualizacja co 15 sekund.',
    siteName: 'DOBITKA',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function WynikiNaZywoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-widest">
              Wstecz
            </span>
          </Link>

          <Badge
            variant="destructive"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/20 text-red-400 border-red-600/30"
          >
            <span className="live-dot" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              LIVE
            </span>
          </Badge>

          <span className="font-display text-lg tracking-tight text-primary ml-auto">
            DOBITKA
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <LiveResults />
      </main>
    </div>
  );
}
