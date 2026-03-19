import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MatchDetailView } from '@/components/MatchDetail';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return {
    title: `Mecz #${id} — DOBITKA`,
    description: 'Szczegoly meczu, strzelcy, statystyki — DOBITKA',
  };
}

export default async function MatchPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Compact header */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-widest">Wstecz</span>
          </a>
          <span className="font-display text-lg tracking-tight text-primary ml-auto">DOBITKA</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Suspense fallback={<MatchSkeleton />}>
          <MatchDetailView matchId={id} />
        </Suspense>
      </main>
    </div>
  );
}

function MatchSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}
