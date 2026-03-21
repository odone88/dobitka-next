'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Match, MatchGoal } from '@/types';
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
  CL: 0, ELC: 1,
  PPL: 2,
  PL: 3, PD: 4, SA: 5, BL1: 6, FL1: 7,
  DED: 8, BSA: 9, CLI: 10,
};

function isLive(m: Match) {
  return m.status === 'LIVE' || m.status === 'IN_PLAY' || m.status === 'PAUSED';
}

/* ─── Day Picker ─────────────────────────────────────────────────── */
function DayPicker({ selected, onChange }: { selected: string; onChange: (d: string) => void }) {
  const days = [-2, -1, 0, 1, 2].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      date: d.toISOString().slice(0, 10),
      label: offset === 0 ? 'Dziś' :
             offset === -1 ? 'Wczoraj' :
             offset === 1 ? 'Jutro' :
             d.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric' }),
      isToday: offset === 0,
    };
  });

  return (
    <div className="flex gap-1.5 justify-center bg-card/50 rounded-xl p-1.5 border border-border">
      {days.map((d) => (
        <button
          key={d.date}
          onClick={() => onChange(d.date)}
          className={cn(
            'px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all cursor-pointer relative',
            selected === d.date
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent',
            d.isToday && selected !== d.date && 'text-primary'
          )}
        >
          {d.label}
          {d.isToday && selected !== d.date && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── Live minute counter ────────────────────────────────────────── */
function LiveMinute({ minute, status }: { minute: number | null | undefined; status: string }) {
  const [display, setDisplay] = useState(minute ?? 0);
  const startRef = useRef(Date.now());
  const baseMinuteRef = useRef(minute ?? 0);

  useEffect(() => {
    baseMinuteRef.current = minute ?? 0;
    startRef.current = Date.now();
    setDisplay(minute ?? 0);
  }, [minute]);

  useEffect(() => {
    if (status === 'PAUSED') return;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 60000);
      setDisplay(baseMinuteRef.current + elapsed);
    }, 15000);
    return () => clearInterval(id);
  }, [status]);

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-destructive
                     rounded-md text-[10px] font-black text-white tracking-wide">
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </span>
      {status === 'PAUSED' ? 'PRZERWA' : display ? `${display}'` : 'LIVE'}
    </span>
  );
}

/* ─── Team crest ─────────────────────────────────────────────────── */
function Crest({ src, name, size = 20 }: { src?: string; name: string; size?: number }) {
  if (!src) {
    return <span className="inline-flex items-center justify-center rounded-full bg-muted text-[8px] font-bold text-muted-foreground flex-shrink-0" style={{ width: size, height: size }}>{name.slice(0, 2)}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} width={size} height={size} className="object-contain flex-shrink-0" loading="lazy" />
  );
}

/* ─── Goal scorers line ──────────────────────────────────────────── */
function GoalLine({ goals, teamId, isHome }: { goals: MatchGoal[]; teamId: number; isHome: boolean }) {
  const teamGoals = goals.filter((g) => g.teamId === teamId);
  if (teamGoals.length === 0) return null;

  return (
    <div className={cn('flex flex-col gap-0.5', isHome ? 'items-end' : 'items-start')}>
      {teamGoals.map((g, i) => (
        <span key={i} className="text-[10px] leading-tight flex items-center gap-1">
          <span className="text-primary" aria-hidden="true">⚽</span>
          <span className="text-foreground font-medium">{g.scorer}</span>
          <span className="score-display text-muted-foreground">{g.minute}&apos;</span>
          {g.type === 'PENALTY' && <span className="text-amber font-bold">(k)</span>}
          {g.type === 'OWN_GOAL' && <span className="text-destructive font-bold">(sam.)</span>}
        </span>
      ))}
    </div>
  );
}

/* ─── Single match row ───────────────────────────────────────────── */
function MatchRow({ match }: { match: Match }) {
  const [expanded, setExpanded] = useState(false);
  const [loadedGoals, setLoadedGoals] = useState<MatchGoal[] | null>(null);
  const [loadingGoals, setLoadingGoals] = useState(false);

  const live = isLive(match);
  const finished = match.status === 'FINISHED';
  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const homeWin = hasScore && match.homeScore! > match.awayScore!;
  const awayWin = hasScore && match.awayScore! > match.homeScore!;
  const time = new Date(match.utcDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

  const goals = loadedGoals ?? match.goals;
  const hasGoals = goals.length > 0;
  const canExpand = hasScore && (match.homeScore! + match.awayScore!) > 0 && (finished || live);

  function handleExpand(e: React.MouseEvent) {
    e.stopPropagation();
    if (!canExpand) return;

    if (expanded) { setExpanded(false); return; }

    setExpanded(true);
    if (goals.length > 0) return;

    setLoadingGoals(true);
    fetch(`/api/match/${match.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.goals) setLoadedGoals(data.goals); })
      .catch(() => {})
      .finally(() => setLoadingGoals(false));
  }

  return (
    <div
      className={cn(
        'border-b border-border last:border-0 border-l-3 transition-all',
        LEAGUE_ACCENT[match.competitionCode] ?? 'border-l-transparent',
        live && 'bg-gradient-to-r from-destructive/[0.12] to-transparent',
        'cursor-pointer hover:bg-accent/50',
      )}
    >
      {/* Main row */}
      <a href={`/match/${match.id}`} className="flex items-center px-3 py-3.5 gap-2">
        {/* Time / Status */}
        <div className="w-[56px] flex-shrink-0 text-center">
          {live ? (
            <LiveMinute minute={match.minute} status={match.status} />
          ) : finished ? (
            <span className="inline-flex px-2 py-0.5 rounded bg-muted text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
              Koniec
            </span>
          ) : (
            <span className="text-[13px] score-display text-foreground font-bold">{time}</span>
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
          <Crest src={match.homeCrest} name={match.homeTeam} size={22} />
        </div>

        {/* Score */}
        <div className="w-[56px] flex-shrink-0 text-center">
          {hasScore ? (
            <span className={cn(
              'score-display text-[18px] font-black inline-block',
              live ? 'text-destructive scale-110' : 'text-foreground'
            )}>
              {match.homeScore} <span className="text-muted-foreground text-[14px]">:</span> {match.awayScore}
            </span>
          ) : (
            <span className="text-[13px] text-muted-foreground">vs</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Crest src={match.awayCrest} name={match.awayTeam} size={22} />
          <span className={cn(
            'text-[13px] truncate',
            awayWin ? 'font-bold text-foreground' : finished ? 'text-muted-foreground' : 'text-foreground'
          )}>
            {match.awayTeam}
          </span>
        </div>

        {/* HT + expand */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {match.halfTime && finished && (
            <span className="text-[9px] text-muted-foreground hidden sm:block score-display bg-muted px-1.5 py-0.5 rounded">
              {match.halfTime}
            </span>
          )}
          {canExpand && (
            <button
              onClick={handleExpand}
              className={cn(
                'w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground transition-all hover:text-foreground hover:bg-accent',
                expanded ? 'rotate-180 bg-accent' : ''
              )}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          )}
        </div>
      </a>

      {/* Goal scorers */}
      {expanded && loadingGoals && (
        <div className="px-3 pb-3 text-center">
          <span className="text-[10px] text-muted-foreground animate-pulse">Ładowanie strzelców...</span>
        </div>
      )}
      {hasGoals && (match.goals.length > 0 || expanded) && (finished || live) && (
        <div className="px-3 pb-3 -mt-1 grid grid-cols-[1fr_56px_1fr] gap-x-2 items-start animate-fade-in"
             style={{ paddingLeft: 'calc(0.75rem + 56px)' }}>
          <GoalLine goals={goals} teamId={match.homeTeamId} isHome={true} />
          <div />
          <GoalLine goals={goals} teamId={match.awayTeamId} isHome={false} />
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export function TodayMatches({ initialMatches = [], ssrLoaded = false }: { initialMatches?: Match[]; ssrLoaded?: boolean }) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [loading, setLoading] = useState(!ssrLoaded && initialMatches.length === 0);
  const [timedOut, setTimedOut] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  const fetchData = useCallback(async (date: string, isSwitch = false) => {
    if (isSwitch) setSwitching(true);
    try {
      const res = await fetch(`/api/live?date=${date}`);
      if (!res.ok) return;
      const d = await res.json();
      setMatches(d.today ?? []);
    } catch { /* silent */ }
    finally {
      setLoading(false);
      setSwitching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setTimedOut(true), 3500);
    return () => clearTimeout(t);
  }, [loading]);

  const ssrLoadedRef = useRef(ssrLoaded);

  useEffect(() => {
    const isToday = selectedDate === new Date().toISOString().slice(0, 10);

    if (ssrLoadedRef.current && isToday) {
      ssrLoadedRef.current = false;
      const id = setInterval(() => fetchData(selectedDate), 90_000);
      return () => clearInterval(id);
    }

    fetchData(selectedDate);
    if (isToday) {
      const id = setInterval(() => fetchData(selectedDate), 90_000);
      return () => clearInterval(id);
    }
  }, [selectedDate, fetchData]);

  function handleDateChange(date: string) {
    if (date === selectedDate) return;
    setSelectedDate(date);
    fetchData(date, true);
  }

  // ─── SMART MATCH PRIORITY ──────────────────────────────────────
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

    const hasScheduledA = matchesA.some((m) => m.status === 'SCHEDULED' || m.status === 'TIMED');
    const hasScheduledB = matchesB.some((m) => m.status === 'SCHEDULED' || m.status === 'TIMED');
    if (hasScheduledA && !hasScheduledB) return -1;
    if (!hasScheduledA && hasScheduledB) return 1;

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

  const liveCount = matches.filter(isLive).length;
  const scheduledCount = matches.filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED').length;
  const finishedCount = matches.filter((m) => m.status === 'FINISHED').length;

  if (loading) {
    return (
      <div className="space-y-3">
        <DayPicker selected={selectedDate} onChange={handleDateChange} />
        {timedOut ? (
          <div className="py-6 text-center">
            <p className="text-[13px] text-muted-foreground">Nie udało się załadować meczów.</p>
            <button onClick={() => { setTimedOut(false); setLoading(true); fetchData(selectedDate); }}
              className="mt-2 text-[12px] text-primary hover:underline cursor-pointer">Spróbuj ponownie</button>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            {[...Array(4)].map((_, i) => (
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
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DayPicker selected={selectedDate} onChange={handleDateChange} />

      {/* Stats bar */}
      {matches.length > 0 && (
        <div className="flex items-center justify-center gap-3 text-[11px] font-bold">
          {liveCount > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/15 text-destructive">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive/60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
              </span>
              {liveCount} na żywo
            </span>
          )}
          {scheduledCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              {scheduledCount} zaplanowanych
            </span>
          )}
          {finishedCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              {finishedCount} zakończonych
            </span>
          )}
        </div>
      )}

      {/* Match list */}
      <div className={cn(
        'transition-opacity duration-200',
        switching ? 'opacity-30' : 'opacity-100'
      )}>
        {sortedLeagues.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-[15px] text-muted-foreground font-display">Brak meczów na ten dzień</p>
            <p className="text-[12px] text-muted-foreground">Wybierz inny dzień lub sprawdź tabelę poniżej.</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm">
            {sortedLeagues.map(([code, ms], leagueIdx) => {
              const league = getLeague(code);
              const hasLive = ms.some(isLive);
              const firstMatch = ms[0];
              return (
                <div key={code}>
                  {/* League header */}
                  <div className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 border-b border-border',
                    hasLive ? 'bg-gradient-to-r from-destructive/[0.12] to-transparent' : 'bg-accent/30',
                    leagueIdx > 0 && 'border-t border-border'
                  )}>
                    {firstMatch?.competitionEmblem ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={firstMatch.competitionEmblem} alt="" className="h-5 w-5 object-contain" />
                    ) : (
                      <span className="text-base leading-none">{league?.flag ?? '\u26BD'}</span>
                    )}
                    <div className="flex flex-col">
                      <span className={cn(
                        'text-[12px] font-black uppercase tracking-wide leading-tight',
                        league?.color ?? 'text-muted-foreground'
                      )}>
                        {league?.name ?? code}
                      </span>
                      {league?.country && (
                        <span className="text-[9px] text-muted-foreground leading-tight">{league.country}</span>
                      )}
                    </div>
                    {hasLive && (
                      <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 bg-destructive/20 rounded text-[8px] font-black text-destructive uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive live-dot" />
                        Live
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto score-display font-bold">{ms.length} {ms.length === 1 ? 'mecz' : ms.length < 5 ? 'mecze' : 'meczów'}</span>
                  </div>

                  {ms.map((m) => <MatchRow key={m.id} match={m} />)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
