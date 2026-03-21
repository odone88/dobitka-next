'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Match } from '@/types';
import { getLeague } from '@/config/leagues';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const LEAGUE_ACCENT: Record<string, string> = {
  CL:  'border-l-blue-500',
  PL:  'border-l-purple-400',
  PD:  'border-l-red-400',
  SA:  'border-l-green-400',
  BL1: 'border-l-yellow-400',
  FL1: 'border-l-sky-400',
  ELC: 'border-l-orange-400',
  PPL: 'border-l-red-500',
  DED: 'border-l-orange-300',
  BSA: 'border-l-yellow-300',
  CLI: 'border-l-amber-400',
};

const LEAGUE_PRIORITY: Record<string, number> = {
  CL: 0, ELC: 1, PPL: 2,
  PL: 3, PD: 4, SA: 5, BL1: 6, FL1: 7,
  DED: 8, BSA: 9, CLI: 10,
};

function isLive(m: Match) {
  return m.status === 'LIVE' || m.status === 'IN_PLAY' || m.status === 'PAUSED';
}

/* ─── Team crest ─────────────────────────────────────────────────── */
function Crest({ src, name, size = 20 }: { src?: string; name: string; size?: number }) {
  if (!src) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full bg-muted text-[8px] font-bold text-muted-foreground flex-shrink-0"
        style={{ width: size, height: size }}
      >
        {name.slice(0, 2)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} width={size} height={size} className="object-contain flex-shrink-0" loading="lazy" />
  );
}

/* ─── Single match row ───────────────────────────────────────────── */
function MatchRow({ match }: { match: Match }) {
  const live = isLive(match);
  const finished = match.status === 'FINISHED';
  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const homeWin = hasScore && match.homeScore! > match.awayScore!;
  const awayWin = hasScore && match.awayScore! > match.homeScore!;
  const time = new Date(match.utcDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

  return (
    <a
      href={`/match/${match.id}`}
      className={cn(
        'flex items-center px-3 py-3 gap-2 border-b border-border last:border-0 border-l-2 transition-all',
        LEAGUE_ACCENT[match.competitionCode] ?? 'border-l-transparent',
        live && 'bg-destructive/[0.08]',
        'hover:bg-accent/50 hover:shadow-sm',
      )}
    >
      {/* Time / Status */}
      <div className="w-[52px] flex-shrink-0 text-center">
        {live ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-destructive rounded text-[9px] font-black text-white tracking-wide animate-pulse">
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </span>
            {match.status === 'PAUSED' ? 'PRZ' : match.minute ? `${match.minute}'` : '\u2022'}
          </span>
        ) : finished ? (
          <span className="text-[10px] font-bold text-muted-foreground">KON</span>
        ) : (
          <span className="text-[12px] score-display text-muted-foreground">{time}</span>
        )}
      </div>

      {/* Home team */}
      <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
        <span className={cn(
          'text-[13px] text-right truncate',
          homeWin ? 'font-bold text-foreground' : finished ? 'text-muted-foreground' : 'text-foreground'
        )}>
          {match.homeTeam}
        </span>
        <Crest src={match.homeCrest} name={match.homeTeam} />
      </div>

      {/* Score */}
      <div className="w-[52px] flex-shrink-0 text-center">
        <span className={cn(
          'score-display text-[15px] font-black',
          live ? 'text-destructive' : finished ? 'text-foreground' : 'text-muted-foreground'
        )}>
          {hasScore ? `${match.homeScore} - ${match.awayScore}` : '-'}
        </span>
      </div>

      {/* Away team */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <Crest src={match.awayCrest} name={match.awayTeam} />
        <span className={cn(
          'text-[13px] truncate',
          awayWin ? 'font-bold text-foreground' : finished ? 'text-muted-foreground' : 'text-foreground'
        )}>
          {match.awayTeam}
        </span>
      </div>

      {/* HT */}
      {match.halfTime && finished && (
        <span className="text-[9px] text-muted-foreground hidden sm:block score-display flex-shrink-0">
          ({match.halfTime})
        </span>
      )}
    </a>
  );
}

/* ─── Loading skeleton ───────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3.5 border-b border-border last:border-0">
          <Skeleton className="h-4 w-10" />
          <div className="flex-1 flex items-center justify-end gap-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <Skeleton className="h-5 w-12" />
          <div className="flex-1 flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Archive Page ───────────────────────────────────────────────── */
export default function ArchivePage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMatches = useCallback(async (d: string) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/live?date=${d}`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setMatches(data.today ?? []);
    } catch {
      setError(true);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches(date);
  }, [date, fetchMatches]);

  // Group & sort matches by league
  const grouped = new Map<string, Match[]>();
  for (const m of matches) {
    const code = m.competitionCode;
    if (!grouped.has(code)) grouped.set(code, []);
    grouped.get(code)!.push(m);
  }

  const sortedLeagues = [...grouped.entries()].sort(([codeA, matchesA], [codeB, matchesB]) => {
    const hasLiveA = matchesA.some(isLive);
    const hasLiveB = matchesB.some(isLive);
    if (hasLiveA && !hasLiveB) return -1;
    if (!hasLiveA && hasLiveB) return 1;
    return (LEAGUE_PRIORITY[codeA] ?? 99) - (LEAGUE_PRIORITY[codeB] ?? 99);
  });

  for (const [, ms] of sortedLeagues) {
    ms.sort((a, b) => {
      const statusOrder = (m: Match) => isLive(m) ? 0 : (m.status === 'SCHEDULED' || m.status === 'TIMED') ? 1 : 2;
      const diff = statusOrder(a) - statusOrder(b);
      if (diff !== 0) return diff;
      return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
    });
  }

  const formatDateLabel = (iso: string) => {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-widest">Wstecz</span>
          </a>
          <span className="font-display text-lg tracking-tight text-primary ml-auto">DOBITKA</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-xl font-display font-bold tracking-tight">Archiwum meczów</h1>
          <p className="text-[13px] text-muted-foreground">Wybierz datę, aby zobaczyć wyniki i mecze z tego dnia.</p>
        </div>

        {/* Date picker with prev/next */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(date + 'T12:00:00');
              d.setDate(d.getDate() - 1);
              setDate(d.toISOString().slice(0, 10));
            }}
            className="p-2 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
            aria-label="Poprzedni dzień"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <input
            id="archive-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                       [color-scheme:dark]"
          />
          <button
            onClick={() => {
              const d = new Date(date + 'T12:00:00');
              d.setDate(d.getDate() + 1);
              setDate(d.toISOString().slice(0, 10));
            }}
            className="p-2 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
            aria-label="Następny dzień"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
          <button
            onClick={() => setDate(new Date().toISOString().slice(0, 10))}
            className="ml-1 px-2.5 py-1.5 rounded-lg border border-border text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            Dziś
          </button>
        </div>

        {/* Date label */}
        <p className="text-[13px] text-muted-foreground capitalize">{formatDateLabel(date)}</p>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-[13px] text-muted-foreground">Nie udało się załadować meczów.</p>
            <button
              onClick={() => fetchMatches(date)}
              className="mt-2 text-[12px] text-primary hover:underline cursor-pointer"
            >
              Spróbuj ponownie
            </button>
          </div>
        ) : sortedLeagues.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-[15px] text-muted-foreground font-display">Brak meczów na ten dzień</p>
            <p className="text-[12px] text-muted-foreground">Wybierz inną datę z kalendarza powyżej.</p>
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className="flex items-center justify-center gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>{matches.length} meczów</span>
              <span>{sortedLeagues.length} lig</span>
            </div>

            {/* Match list */}
            <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm">
              {sortedLeagues.map(([code, ms], leagueIdx) => {
                const league = getLeague(code);
                const hasLive = ms.some(isLive);
                const firstMatch = ms[0];
                return (
                  <div key={code}>
                    {/* League header */}
                    <div className={cn(
                      'flex items-center gap-2 px-3 py-2 border-b border-border',
                      hasLive ? 'bg-destructive/[0.1]' : 'bg-accent/50',
                      leagueIdx > 0 && 'border-t border-border'
                    )}>
                      {firstMatch?.competitionEmblem ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={firstMatch.competitionEmblem} alt="" className="h-4 w-4 object-contain" />
                      ) : (
                        <span className="text-sm leading-none">{league?.flag ?? '\u26BD'}</span>
                      )}
                      <span className={cn(
                        'text-[11px] font-black uppercase tracking-widest',
                        league?.color ?? 'text-muted-foreground'
                      )}>
                        {league?.name ?? code}
                      </span>
                      {hasLive && (
                        <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-destructive live-dot" />
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto score-display">{ms.length}</span>
                    </div>

                    {ms.map((m) => <MatchRow key={m.id} match={m} />)}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
