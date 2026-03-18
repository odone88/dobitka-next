import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { MatchHero } from '@/components/MatchHero';
import { MatchStrip } from '@/components/MatchStrip';
import { UCLBracket } from '@/components/UCLBracket';
import { LeagueTable } from '@/components/LeagueTable';
import { NewsFeed } from '@/components/NewsFeed';
import { DailyFactsStrip } from '@/components/DailyFactsStrip';
import { QuotesSection } from '@/components/QuotesSection';
import { LEAGUES } from '@/config/leagues';

function CardSkeleton({ rows = 5 }: { rows?: number }) {
  return <div className="space-y-2">{[...Array(rows)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>;
}

const today = new Date().toLocaleDateString('pl-PL', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

export default function HomePage() {
  const leagueOrder = ['PL', 'PD', 'SA', 'BL1', 'FL1'];
  const otherLeagues = LEAGUES.filter((l) => leagueOrder.includes(l.code))
    .sort((a, b) => leagueOrder.indexOf(a.code) - leagueOrder.indexOf(b.code));

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="max-w-screen-xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl leading-none">⚽</span>
            <span className="font-black text-lg tracking-tight">DOBITKA</span>
            <span className="text-xs text-muted-foreground hidden sm:block capitalize">{today}</span>
          </div>
          <nav className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#live" className="hover:text-foreground transition-colors">Live</a>
            <a href="#ucl" className="hover:text-foreground transition-colors">UCL</a>
            <a href="#tabele" className="hover:text-foreground transition-colors">Tabele</a>
            <a href="#newsy" className="hover:text-foreground transition-colors">Newsy</a>
          </nav>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-5 space-y-5">

        {/* ── HERO MATCH ─────────────────────────────────────────────────── */}
        <section id="live">
          <Suspense fallback={<Skeleton className="h-28 w-full rounded-xl" />}>
            <MatchHero />
          </Suspense>
        </section>

        {/* ── TODAY'S MATCHES STRIP ───────────────────────────────────────── */}
        <Suspense fallback={null}>
          <MatchStrip />
        </Suspense>

        {/* ── MAIN GRID ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

          {/* ─── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="space-y-5 min-w-0">

            {/* UCL Bracket */}
            <section id="ucl">
              <Card>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <span>🏆</span>
                    <span className="text-blue-400 font-bold">Liga Mistrzów UEFA</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<CardSkeleton rows={4} />}>
                    <UCLBracket />
                  </Suspense>
                </CardContent>
              </Card>
            </section>

            {/* League Tables */}
            <section id="tabele" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherLeagues.map((league) => (
                  <Card key={league.code}>
                    <CardContent className="pt-4">
                      <Suspense fallback={<CardSkeleton />}>
                        <LeagueTable leagueCode={league.code} />
                      </Suspense>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* ─── SIDEBAR ─────────────────────────────────────────────────── */}
          <aside className="space-y-5">

            {/* News Feed */}
            <Card id="newsy">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-bold">Newsy</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<CardSkeleton rows={4} />}>
                  <NewsFeed />
                </Suspense>
              </CardContent>
            </Card>

            {/* Press Conference Quotes */}
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-bold">Cytaty Dnia</CardTitle>
              </CardHeader>
              <CardContent>
                <QuotesSection />
              </CardContent>
            </Card>

            {/* Daily Knowledge */}
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-bold">Wiedza Dnia</CardTitle>
              </CardHeader>
              <CardContent>
                <DailyFactsStrip />
              </CardContent>
            </Card>

          </aside>
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <Separator className="mt-6" />
        <footer className="text-xs text-muted-foreground/50 pb-6 space-y-1">
          <p>
            <span className="text-muted-foreground/80">Źródła:</span>{' '}
            football-data.org · TheSportsDB · BBC Sport RSS · The Guardian RSS · YouTube RSS (Tifo Football) · Weszło.com RSS
          </p>
          <p>Live: co 60s · UCL/Tabele: co 1h · Newsy: co 15min · Attribution required for free tier usage</p>
        </footer>
      </main>
    </div>
  );
}
