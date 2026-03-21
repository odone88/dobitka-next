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
import { LazySection } from '@/components/LazySection';
import { LEAGUES } from '@/config/leagues';
import { getLiveMatches, getTodayMatches } from '@/lib/data-sources/football-data';
import type { Match } from '@/types';

// Revalidate every 90 seconds (matching live poll interval)
export const revalidate = 90;

function SectionLabel({ text, id }: { text: string; id?: string }) {
  return (
    <h2 id={id} className="mb-3 flex items-center gap-3 scroll-mt-16">
      <span className="font-display text-[13px] font-normal tracking-wide text-primary">{text}</span>
      <span className="flex-1 border-t border-border" aria-hidden="true" />
    </h2>
  );
}

function Skel({ rows = 4 }: { rows?: number }) {
  return <div className="space-y-2">{[...Array(rows)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>;
}

// Merge live + today matches, dedup by id
async function fetchInitialMatches(): Promise<Match[]> {
  try {
    const [live, today] = await Promise.all([getLiveMatches(), getTodayMatches()]);
    const seen = new Set<number>();
    return [...live, ...today].filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const leagueOrder = ['PPL', 'PL', 'PD', 'SA', 'BL1', 'FL1'];
  const leagues = LEAGUES.filter((l) => leagueOrder.includes(l.code))
    .sort((a, b) => leagueOrder.indexOf(a.code) - leagueOrder.indexOf(b.code));

  // Compute date inside async function so ISR revalidation gets fresh date
  const todayStr = new Date().toLocaleDateString('pl-PL', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  // Server-side fetch — no skeleton for above-the-fold content
  const initialMatches = await fetchInitialMatches();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LiveToastContainer />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              <h1 className="font-display text-2xl tracking-tight text-primary transition-all group-hover:text-primary/80">
                DOBITKA
              </h1>
            </a>
            <span className="text-[11px] text-muted-foreground hidden sm:block capitalize font-medium">{todayStr}</span>
          </div>
          <HomeClient />
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-4 space-y-5">

        {/* SMART BANNER — SSR with initial data */}
        <section id="live" className="scroll-mt-16" aria-live="polite" aria-atomic="false">
          <MatchHero initialMatches={initialMatches} ssrLoaded />
        </section>

        {/* DOBITKA DNIA */}
        <DobitkaDnia />

        {/* MECZE DNIA — SSR with initial data */}
        <section id="mecze" className="scroll-mt-16">
          <SectionLabel text="Mecze" />
          <TodayMatches initialMatches={initialMatches} ssrLoaded />
        </section>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-6 min-w-0 order-1">

            <LazySection>
              <section id="ucl" className="scroll-mt-16">
                <SectionLabel text="Liga Mistrzów" />
                <Card>
                  <CardContent className="pt-4">
                    <Suspense fallback={<Skel rows={4} />}>
                      <UCLBracket />
                    </Suspense>
                  </CardContent>
                </Card>
              </section>
            </LazySection>

            <LazySection>
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
            </LazySection>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-5 order-2">

            <LazySection>
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
            </LazySection>

            <section>
              <SectionLabel text="Głosy futbolu" />
              <Card>
                <CardContent className="pt-4">
                  <QuotesSection />
                </CardContent>
              </Card>
            </section>

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
        <footer className="text-[11px] text-muted-foreground pb-6 space-y-1">
          <p>
            <span className="text-muted-foreground font-semibold">Źródła:</span>{' '}
            football-data.org &middot; TheSportsDB &middot; BBC Sport &middot; The Guardian &middot; Weszło.com &middot; TVP Sport &middot; Sport.pl &middot; Tifo Football
          </p>
          <p>Live: 90s &middot; UCL: 5min &middot; Tabele: 2h &middot; Newsy: 15min</p>
          <div className="flex items-center gap-3 mt-1">
            <a href="/archive" className="text-primary/70 hover:text-primary font-bold uppercase tracking-widest text-[9px] transition-colors">
              Archiwum meczów →
            </a>
            <span className="text-border">|</span>
            <span className="text-primary/60 font-bold uppercase tracking-widest text-[9px]">DOBITKA &mdash; codziennie, bezkompromisowo</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
