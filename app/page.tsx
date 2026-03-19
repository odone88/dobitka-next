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
import { LiveToastContainer } from '@/components/LiveToast';
import { DobitkaDnia } from '@/components/DobitkaDnia';
import { HomeClient } from '@/components/HomeClient';
import { LEAGUES } from '@/config/leagues';

function SectionLabel({ text, id }: { text: string; id?: string }) {
  return (
    <h2 id={id} className="mb-3 flex items-center gap-3 scroll-mt-16">
      <span className="font-display text-[13px] font-normal tracking-wide text-primary">{text}</span>
      <span className="flex-1 border-t border-border/20" aria-hidden="true" />
    </h2>
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
      <LiveToastContainer />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              <h1 className="font-display text-2xl tracking-tight text-primary transition-all group-hover:text-primary/80">
                DOBITKA
              </h1>
            </a>
            <span className="text-[11px] text-muted-foreground/40 hidden sm:block capitalize font-medium">{todayStr}</span>
          </div>
          {/* Nav + favorites button — client component */}
          <HomeClient />
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-4 space-y-5">

        {/* SMART BANNER */}
        <section id="live" className="scroll-mt-16">
          <Suspense fallback={<Skeleton className="h-16 w-full rounded-xl" />}>
            <MatchHero />
          </Suspense>
        </section>

        {/* DOBITKA DNIA — komponent sam sie ukryje gdy brak predykcji */}
        <DobitkaDnia />

        {/* MECZE DNIA */}
        <section id="mecze" className="scroll-mt-16">
          <SectionLabel text="Mecze" />
          <TodayMatches />
        </section>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-6 min-w-0 order-1">

            {/* UCL */}
            <section id="ucl" className="scroll-mt-16">
              <SectionLabel text="Liga Mistrzow" />
              <Card>
                <CardContent className="pt-4">
                  <Suspense fallback={<Skel rows={4} />}>
                    <UCLBracket />
                  </Suspense>
                </CardContent>
              </Card>
            </section>

            {/* League Tables */}
            <section id="tabele" className="scroll-mt-16">
              <SectionLabel text="Tabele ligowe" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leagues.map((league) => (
                  <Card key={league.code}>
                    <CardContent className="pt-4">
                      <Suspense fallback={<Skel />}>
                        <LeagueTable leagueCode={league.code} />
                      </Suspense>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-5 order-2">

            {/* Newsy */}
            <section id="newsy" className="scroll-mt-16">
              <SectionLabel text="Newsy" />
              <Card>
                <CardContent className="pt-4">
                  <Suspense fallback={<Skel rows={4} />}>
                    <NewsFeed />
                  </Suspense>
                </CardContent>
              </Card>
            </section>

            {/* Cytaty */}
            <section>
              <SectionLabel text="Glosy futbolu" />
              <Card>
                <CardContent className="pt-4">
                  <QuotesSection />
                </CardContent>
              </Card>
            </section>

            {/* Daily blocks */}
            <section>
              <SectionLabel text="Dzis w pilce" />
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
            <span className="text-muted-foreground/50 font-semibold">Zrodla:</span>{' '}
            football-data.org · TheSportsDB · BBC Sport · The Guardian · Weszlo.com · Tifo Football
          </p>
          <p>Live: 90s · UCL: 5min · Tabele: 2h · Newsy: 15min</p>
          <p className="text-primary/30 font-bold uppercase tracking-widest text-[9px]">DOBITKA — codziennie, bezkompromisowo</p>
        </footer>
      </main>
    </div>
  );
}
