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
      label: offset === 0 ? 'Dzis' :
             offset === -1 ? 'Wczoraj' :
             offset === 1 ? 'Jutro' :
             d.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric' }),
      isToday: offset === 0,
    };
  });

  return (
    <div className="flex gap-1 justify-center">
      {days.map((d) => (
        <button
          key={d.date}
          onClick={() => onChange(d.date)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer',
            selected === d.date
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent',
            d.isToday && selected !== d.date && 'text-primary'
          )}
        >
          {d.label}
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
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-destructive
                     rounded text-[9px] font-black text-white tracking-wide animate-pulse">
      <span className="relative flex h-1.5 w-1.5">
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
      </span>
      {status === 'PAUSED' ? 'PRZ' : display ? `${display}'` : '\u2022'}
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
        <span key={i} className="text-[10px] text-muted-foreground leading-tight">
          <span className="text-foreground/80">{g.scorer}</span>
          <span className="score-display text-muted-foreground/60"> {g.minute}&apos;</span>
          {g.type === 'PENALTY' && <span className="text-amber"> (k)</span>}
          {g.type === 'OWN_GOAL' && <span className="text-destructive"> (sam.)</span>}
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
        'border-b border-border last:border-0 border-l-2 transition-all',
        LEAGUE_ACCENT[match.competitionCode] ?? 'border-l-transparent',
        live && 'bg-destructive/[0.08]',
        'cursor-pointer hover:bg-accent/50 hover:shadow-sm',
      )}
    >
      {/* Main row */}
      <a href={`/match/${match.id}`} className="flex items-center px-3 py-3 gap-2">
        {/* Time / Status */}
        <div className="w-[52px] flex-shrink-0 text-center">
          {live ? (
            <LiveMinute minute={match.minute} status={match.status} />
          ) : finished ? (
            <span className="text-[10px] font-bold text-muted-foreground">KON</span>
          ) : (
            <span className="text-[12px] score-display text-foreground/60">{time}</span>
          )}
        </div>

        {/* Home team */}
        <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
          <span className={cn(
            'text-[13px] text-right truncate',
            homeWin ? 'font-bold text-foreground' : finished ? 'text-foreground/60' : 'text-foreground/90'
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
            awayWin ? 'font-bold text-foreground' : finished ? 'text-foreground/60' : 'text-foreground/90'
          )}>
            {match.awayTeam}
          </span>
        </div>

        {/* HT + expand */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {match.halfTime && finished && (
            <span className="text-[9px] text-muted-foreground hidden sm:block score-display">
              ({match.halfTime})
            </span>
          )}
          {canExpand && (
            <button
              onClick={handleExpand}
              className={cn(
                'text-[10px] text-muted-foreground transition-transform hover:text-foreground p-1',
                expanded ? 'rotate-180' : ''
              )}
            >
              \u25BE
            </button>
          )}
        </div>
      </a>

      {/* Goal scorers */}
      {expanded && loadingGoals && (
        <div className="px-3 pb-2 text-center">
          <span className="text-[10px] text-muted-foreground">Ladowanie strzelcow...</span>
        </div>
      )}
      {hasGoals && (match.goals.length > 0 || expanded) && (finished || live) && (
        <div className="px-3 pb-2 -mt-0.5 grid grid-cols-[1fr_52px_1fr] gap-x-2 items-start animate-fade-in"
             style={{ paddingLeft: 'calc(0.75rem + 52px)' }}>
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
            <p className="text-[13px] text-muted-foreground">Nie udalo sie zaladowac meczow.</p>
            <button onClick={() => { setTimedOut(false); setLoading(true); fetchData(selectedDate); }}
              className="mt-2 text-[12px] text-primary hover:underline cursor-pointer">Sprobuj ponownie</button>
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
        <div className="flex items-center justify-center gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {liveCount > 0 && (
            <span className="text-destructive flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive live-dot" />
              {liveCount} live
            </span>
          )}
          {scheduledCount > 0 && <span>{scheduledCount} zaplanowanych</span>}
          {finishedCount > 0 && <span>{finishedCount} zakonczonych</span>}
        </div>
      )}

      {/* Match list */}
      <div className={cn(
        'transition-opacity duration-200',
        switching ? 'opacity-30' : 'opacity-100'
      )}>
        {sortedLeagues.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-[15px] text-foreground/60 font-display">Brak meczow na ten dzien</p>
            <p className="text-[12px] text-muted-foreground">Wybierz inny dzien lub sprawdz tabele ponizej.</p>
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
        )}
      </div>
    </div>
  );
}
