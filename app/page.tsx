import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MatchHero } from '@/components/MatchHero';
import { TodayMatches } from '@/components/TodayMatches';
import { UCLBracket } from '@/components/UCLBracket';
import { LeagueTable } from '@/components/LeagueTable';
import { NewsFeed } from '@/components/NewsFeed';
import { QuotesSection } from '@/components/QuotesSection';
import { HistoricalMatchBlock, FactsBlock } from '@/components/DailyBlocks';
import { LEAGUES } from '@/config/leagues';

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="text-[11px] font-black uppercase tracking-[0.14em] text-primary">{text}</span>
      <span className="flex-1 border-t border-border/20" />
    </div>
  );
}

function Skel({ rows = 4 }: { rows?: number }) {
  return <div className="space-y-2">{[...Array(rows)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>;
}

const todayStr = new Date().toLocaleDateString('pl-PL', {
  weekday: 'long', day: 'numeric', month: 'long',
});

export default function HomePage() {
  const leagueOrder = ['PL', 'PD', 'SA', 'BL1', 'FL1'];
  const leagues = LEAGUES.filter((l) => leagueOrder.includes(l.code))
    .sort((a, b) => leagueOrder.indexOf(a.code) - leagueOrder.indexOf(b.code));

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md">
        <div className="max-w-screen-xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-black text-xl tracking-tight text-primary">DOBITKA</span>
            <span className="text-[11px] text-muted-foreground/50 hidden sm:block capitalize">{todayStr}</span>
          </div>
          <nav className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
            <a href="#live"   className="hover:text-primary transition-colors">Live</a>
            <a href="#mecze"  className="hover:text-primary transition-colors">Mecze</a>
            <a href="#ucl"    className="hover:text-primary transition-colors">UCL</a>
            <a href="#tabele" className="hover:text-primary transition-colors">Tabele</a>
            <a href="#newsy"  className="hover:text-primary transition-colors hidden sm:block">Newsy</a>
          </nav>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-4 space-y-5">

        {/* SMART BANNER */}
        <section id="live">
          <Suspense fallback={<Skeleton className="h-14 w-full rounded-xl" />}>
            <MatchHero />
          </Suspense>
        </section>

        {/* MECZE DNIA */}
        <section id="mecze">
          <SectionLabel text="Mecze" />
          <TodayMatches />
        </section>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-6 min-w-0 order-2 lg:order-1">

            {/* UCL */}
            <section id="ucl">
              <SectionLabel text="Liga Mistrzów" />
              <Card>
                <CardContent className="pt-4">
                  <Suspense fallback={<Skel rows={4} />}>
                    <UCLBracket />
                  </Suspense>
                </CardContent>
              </Card>
            </section>

            {/* League Tables */}
            <section id="tabele">
              <SectionLabel text="Tabele ligowe" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leagues.map((league, i) => (
                  <Card key={league.code}>
                    <CardContent className="pt-4">
                      <Suspense fallback={<Skel />}>
                        <LeagueTable leagueCode={league.code} delay={i * 8000} />
                      </Suspense>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* SIDEBAR — first on mobile */}
          <aside className="space-y-5 order-1 lg:order-2">

            {/* Newsy */}
            <section id="newsy">
              <SectionLabel text="Newsy" />
              <Card>
                <CardContent className="pt-4">
                  <Suspense fallback={<Skel rows={4} />}>
                    <NewsFeed />
                  </Suspense>
                </CardContent>
              </Card>
            </section>

            {/* Cytaty dnia */}
            <section>
              <SectionLabel text="Cytaty dnia" />
              <Card>
                <CardContent className="pt-4">
                  <QuotesSection />
                </CardContent>
              </Card>
            </section>

            {/* Daily blocks */}
            <section>
              <SectionLabel text="Dziś w piłce" />
              <div className="space-y-3">
                <Card>
                  <CardContent className="pt-4">
                    <Suspense fallback={<Skel rows={3} />}>
                      <HistoricalMatchBlock />
                    </Suspense>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <FactsBlock />
                  </CardContent>
                </Card>
              </div>
            </section>

          </aside>
        </div>

        {/* FOOTER */}
        <div className="divider-retro my-6" />
        <footer className="text-[11px] text-muted-foreground/30 pb-6 space-y-1">
          <p>
            <span className="text-muted-foreground/50 font-semibold">Źródła:</span>{' '}
            football-data.org · TheSportsDB · BBC Sport · The Guardian · Weszło.com · Tifo Football
          </p>
          <p>Live: 90s · UCL: 5min · Tabele: 2h · Newsy: 15min</p>
          <p className="text-primary/30 font-bold uppercase tracking-widest text-[9px]">DOBITKA — codziennie, bezkompromisowo</p>
        </footer>
      </main>
    </div>
  );
}
