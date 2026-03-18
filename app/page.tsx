import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MatchHero } from '@/components/MatchHero';
import { MatchStrip } from '@/components/MatchStrip';
import { UCLBracket } from '@/components/UCLBracket';
import { LeagueTable } from '@/components/LeagueTable';
import { NewsFeed } from '@/components/NewsFeed';
import { QuotesSection } from '@/components/QuotesSection';
import { BirthdayBlock, HistoricalMatchBlock, FactsBlock } from '@/components/DailyBlocks';
import { LEAGUES } from '@/config/leagues';

function SectionLabel({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg leading-none">{emoji}</span>
      <span className="text-[11px] font-black uppercase tracking-[0.14em] text-primary">{text}</span>
      <span className="flex-1 border-t border-border/30" />
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

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl leading-none">⚽</span>
            <span className="font-black text-xl tracking-tight text-primary">DOBITKA</span>
            <span className="text-[12px] text-muted-foreground/70 hidden sm:block capitalize">{todayStr}</span>
          </div>
          <nav className="flex items-center gap-4 text-[12px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <a href="#live"   className="hover:text-primary transition-colors">Live</a>
            <a href="#ucl"    className="hover:text-primary transition-colors">UCL</a>
            <a href="#tabele" className="hover:text-primary transition-colors">Tabele</a>
            <a href="#newsy"  className="hover:text-primary transition-colors">Newsy</a>
          </nav>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-5 space-y-5">

        {/* ── HERO MATCH ─────────────────────────────────────────────────── */}
        <section id="live">
          <Suspense fallback={<Skeleton className="h-32 w-full rounded-xl" />}>
            <MatchHero />
          </Suspense>
        </section>

        {/* ── TODAY'S MATCHES STRIP ───────────────────────────────────────── */}
        <Suspense fallback={null}>
          <MatchStrip />
        </Suspense>

        {/* ── MAIN GRID ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          {/* ─── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="space-y-6 min-w-0">

            {/* UCL */}
            <section id="ucl">
              <SectionLabel emoji="🏆" text="Liga Mistrzów UEFA" />
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
              <SectionLabel emoji="📊" text="Tabele Ligowe" />
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

          {/* ─── SIDEBAR ─────────────────────────────────────────────────── */}
          <aside className="space-y-5">

            {/* Newsy */}
            <section id="newsy">
              <SectionLabel emoji="📰" text="Newsy" />
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
              <SectionLabel emoji="💬" text="Cytaty dnia" />
              <Card>
                <CardContent className="pt-4">
                  <QuotesSection />
                </CardContent>
              </Card>
            </section>

            {/* Daily retention blocks */}
            <section>
              <SectionLabel emoji="⚡" text="Dziś w piłce" />
              <div className="space-y-3">
                <BirthdayBlock />
                <Card>
                  <CardContent className="pt-4">
                    <HistoricalMatchBlock />
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

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <div className="divider-retro my-6" />
        <footer className="text-[11px] text-muted-foreground/40 pb-6 space-y-1">
          <p>
            <span className="text-muted-foreground/60 font-semibold">Źródła:</span>{' '}
            football-data.org · TheSportsDB · BBC Sport RSS · The Guardian RSS · YouTube RSS · Weszło.com RSS
          </p>
          <p>Live: 60s · UCL: 5min · Tabele: 1h · Newsy: 15min</p>
          <p className="text-primary/40 font-bold uppercase tracking-widest text-[9px]">DOBITKA — codziennie, bezkompromisowo</p>
        </footer>
      </main>
    </div>
  );
}
