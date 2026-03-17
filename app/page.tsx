import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { LiveCenter } from '@/components/LiveCenter';
import { LeagueTable } from '@/components/LeagueTable';
import { NewsFeed } from '@/components/NewsFeed';
import { FeaturedTeam } from '@/components/FeaturedTeam';
import { DailyFactsStrip } from '@/components/DailyFactsStrip';
import { LEAGUES } from '@/config/leagues';

function SectionSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-6 w-32" />
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
    </div>
  );
}

export default function HomePage() {
  const mainLeagues = LEAGUES.filter((l) => l.code !== 'CL');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── TOP HEADER ── */}
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚽</span>
            <span className="font-black text-lg tracking-tight text-foreground">DOBITKA</span>
            <span className="text-xs text-muted-foreground hidden sm:block">
              {new Date().toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <nav className="flex items-center gap-3 text-xs text-muted-foreground">
            <a href="#live" className="hover:text-foreground transition-colors">Live</a>
            <a href="#tables" className="hover:text-foreground transition-colors">Tabele</a>
            <a href="#news" className="hover:text-foreground transition-colors">Newsy</a>
          </nav>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">

        {/* ── LIVE CENTER ── */}
        <section id="live">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live & Dzisiaj
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SectionSkeleton />}>
                <LiveCenter />
              </Suspense>
            </CardContent>
          </Card>
        </section>

        {/* ── MAIN GRID: tables + sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: League Tables (2/3) */}
          <div className="lg:col-span-2 space-y-4" id="tables">
            {/* UCL first */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span>🏆</span>
                  <span className="text-blue-400">Liga Mistrzów</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<SectionSkeleton />}>
                  <LeagueTable leagueCode="CL" />
                </Suspense>
              </CardContent>
            </Card>

            {/* Grid of other leagues */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mainLeagues.map((league) => (
                <Card key={league.code}>
                  <CardContent className="pt-4">
                    <Suspense fallback={<SectionSkeleton />}>
                      <LeagueTable leagueCode={league.code} />
                    </Suspense>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* RIGHT: Sidebar (1/3) */}
          <div className="space-y-4">

            {/* Daily Facts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Wiedza Dnia</CardTitle>
              </CardHeader>
              <CardContent>
                <DailyFactsStrip />
              </CardContent>
            </Card>

            {/* Featured Team of the Day */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Klub Dnia</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-24 w-full" />}>
                  <FeaturedTeam />
                </Suspense>
              </CardContent>
            </Card>

            {/* News Feed */}
            <Card id="news">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Newsy</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<SectionSkeleton />}>
                  <NewsFeed />
                </Suspense>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* ── FOOTER ── */}
        <Separator className="my-4" />
        <footer className="text-xs text-muted-foreground/60 pb-6 space-y-1">
          <p>
            <strong className="text-muted-foreground">Źródła:</strong>{' '}
            football-data.org (free tier) · TheSportsDB (public API) · Reddit JSON API · YouTube RSS · Weszło.com RSS · Wikipedia REST API
          </p>
          <p>Dane aktualizowane automatycznie. Live: co 60s · Tabele: co 1h · Newsy: co 15min</p>
          <p>DOBITKA — do użytku osobistego/niekomercyjnego</p>
        </footer>
      </main>
    </div>
  );
}
