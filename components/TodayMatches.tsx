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
  PPL: 'border-l-emerald-400',
  DED: 'border-l-orange-300',
  BSA: 'border-l-yellow-300',
  CLI: 'border-l-amber-400',
};

const LEAGUE_PRIORITY: Record<string, number> = {
  CL: 0, ELC: 1,
  PL: 2, PD: 3, SA: 4, BL1: 5, FL1: 6,
  PPL: 7, DED: 8,
  BSA: 9, CLI: 10,
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
            'px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer',
            selected === d.date
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/5',
            d.isToday && selected !== d.date && 'text-primary/60'
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
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-destructive/90
                     rounded text-[9px] font-black text-white tracking-wide">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
      </span>
      {status === 'PAUSED' ? 'PRZ' : display ? `${display}'` : '\u2022'}
    </span>
  );
}

/* ─── Team crest image ───────────────────────────────────────────── */
function Crest({ src, name, size = 18 }: { src?: string; name: string; size?: number }) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className="object-contain flex-shrink-0"
      loading="lazy"
    />
  );
}

/* ─── Goal scorers line ──────────────────────────────────────────── */
function GoalLine({ goals, teamId, isHome }: { goals: MatchGoal[]; teamId: number; isHome: boolean }) {
  const teamGoals = goals.filter((g) => g.teamId === teamId);
  if (teamGoals.length === 0) return null;

  return (
    <div className={cn('flex flex-col gap-0.5', isHome ? 'items-end' : 'items-start')}>
      {teamGoals.map((g, i) => (
        <span key={i} className="text-[10px] text-muted-foreground/60 leading-tight">
          <span className="text-foreground/70">{g.scorer}</span>
          <span className="score-display text-muted-foreground/40"> {g.minute}&apos;</span>
          {g.type === 'PENALTY' && <span className="text-amber/50"> (k)</span>}
          {g.type === 'OWN_GOAL' && <span className="text-destructive/50"> (sam.)</span>}
        </span>
      ))}
    </div>
  );
}

/* ─── Single match row ───────────────────────────────────────────── */
function MatchRow({ match, index }: { match: Match; index: number }) {
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

    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);
    if (goals.length > 0) return;

    setLoadingGoals(true);
    fetch(`/api/match/${match.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.goals) setLoadedGoals(data.goals);
      })
      .catch(() => {})
      .finally(() => setLoadingGoals(false));
  }

  function handleNavigate() {
    window.location.href = `/match/${match.id}`;
  }

  return (
    <div
      className={cn(
        'border-b border-border/10 border-l-2 transition-all',
        LEAGUE_ACCENT[match.competitionCode] ?? 'border-l-border/20',
        live && 'bg-destructive/[0.06]',
        'cursor-pointer hover:bg-white/[0.03]',
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Main row */}
      <div className="flex items-center px-3 py-2.5 gap-2" onClick={handleNavigate}>
        {/* Time / Status */}
        <div className="w-12 flex-shrink-0 text-center">
          {live ? (
            <LiveMinute minute={match.minute} status={match.status} />
          ) : finished ? (
            <span className="text-[10px] font-bold text-muted-foreground/40">KON</span>
          ) : (
            <span className="text-[11px] score-display text-muted-foreground/50">{time}</span>
          )}
        </div>

        {/* Teams + Score — FotMob style with crests */}
        <div className="flex-1 grid grid-cols-[1fr_auto_1fr] gap-x-2 items-center min-w-0">
          <div className={cn(
            'flex items-center gap-1.5 justify-end min-w-0',
          )}>
            <span className={cn(
              'text-[13px] text-right truncate transition-colors',
              homeWin ? 'font-bold text-foreground' : finished ? 'text-foreground/50' : 'text-foreground/75'
            )}>
              {match.homeTeam}
            </span>
            <Crest src={match.homeCrest} name={match.homeTeam} />
          </div>

          <span className={cn(
            'score-display text-[15px] font-black min-w-[44px] text-center',
            live ? 'text-destructive' : finished ? 'text-foreground' : 'text-muted-foreground/35'
          )}>
            {hasScore ? `${match.homeScore} \u2013 ${match.awayScore}` : '\u2013'}
          </span>

          <div className={cn(
            'flex items-center gap-1.5 min-w-0',
          )}>
            <Crest src={match.awayCrest} name={match.awayTeam} />
            <span className={cn(
              'text-[13px] truncate transition-colors',
              awayWin ? 'font-bold text-foreground' : finished ? 'text-foreground/50' : 'text-foreground/75'
            )}>
              {match.awayTeam}
            </span>
          </div>
        </div>

        {/* HT + expand */}
        <div className="flex items-center gap-1.5 ml-1 flex-shrink-0">
          {match.halfTime && finished && (
            <span className="text-[9px] text-muted-foreground/30 hidden sm:block score-display">
              ({match.halfTime})
            </span>
          )}
          {canExpand && (
            <button
              onClick={handleExpand}
              className={cn(
                'text-[10px] text-muted-foreground/30 transition-transform hover:text-muted-foreground/50 p-1',
                expanded ? 'rotate-180' : ''
              )}
            >
              \u25BE
            </button>
          )}
        </div>
      </div>

      {/* Goal scorers */}
      {expanded && loadingGoals && (
        <div className="px-3 pb-2 text-center">
          <span className="text-[10px] text-muted-foreground/40">Ladowanie strzelcow...</span>
        </div>
      )}
      {hasGoals && (match.goals.length > 0 || expanded) && (finished || live) && (
        <div className="px-3 pb-2 -mt-0.5 grid grid-cols-[1fr_44px_1fr] gap-x-2 items-start animate-fade-in"
             style={{ paddingLeft: 'calc(0.75rem + 3rem)' }}>
          <GoalLine goals={goals} teamId={match.homeTeamId} isHome={true} />
          <div />
          <GoalLine goals={goals} teamId={match.awayTeamId} isHome={false} />
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export function TodayMatches({ initialMatches = [] }: { initialMatches?: Match[] }) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [loading, setLoading] = useState(initialMatches.length === 0);
  const [timedOut, setTimedOut] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [updatedAt, setUpdatedAt] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  const fetchData = useCallback(async (date: string, isSwitch = false) => {
    if (isSwitch) setSwitching(true);
    try {
      const res = await fetch(`/api/live?date=${date}`);
      if (!res.ok) return;
      const d = await res.json();
      setMatches(d.today ?? []);
      if (d.updatedAt) setUpdatedAt(d.updatedAt);
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

  useEffect(() => {
    // If we have SSR data for today, skip initial fetch — just poll
    const isToday = selectedDate === new Date().toISOString().slice(0, 10);
    if (initialMatches.length > 0 && isToday && !switching) {
      const id = setInterval(() => fetchData(selectedDate), 90_000);
      return () => clearInterval(id);
    }
    fetchData(selectedDate);
    if (isToday) {
      const id = setInterval(() => fetchData(selectedDate), 90_000);
      return () => clearInterval(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="space-y-2">
        <DayPicker selected={selectedDate} onChange={handleDateChange} />
        {timedOut ? (
          <div className="py-4 text-center">
            <p className="text-[12px] text-muted-foreground/50">Nie udalo sie zaladowac meczow.</p>
            <button onClick={() => { setTimedOut(false); setLoading(true); fetchData(selectedDate); }}
              className="mt-1.5 text-[11px] text-primary hover:underline cursor-pointer">Sprobuj ponownie</button>
          </div>
        ) : (
          <div className="rounded-xl border border-border/15 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 border-b border-border/10">
                <Skeleton className="h-4 w-10" />
                <div className="flex-1 flex items-center justify-end gap-1.5">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-[18px] w-[18px] rounded-full" />
                </div>
                <Skeleton className="h-5 w-10" />
                <div className="flex-1 flex items-center gap-1.5">
                  <Skeleton className="h-[18px] w-[18px] rounded-full" />
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
        <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
          {liveCount > 0 && (
            <span className="text-destructive/80 flex items-center gap-1">
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
          <div className="py-8 text-center space-y-1">
            <p className="text-[14px] text-muted-foreground/50 font-display">Brak meczow na ten dzien</p>
            <p className="text-[11px] text-muted-foreground/30">Wybierz inny dzien lub sprawdz newsy ponizej.</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-border/20 card-elevated">
            {sortedLeagues.map(([code, ms], leagueIdx) => {
              const league = getLeague(code);
              const hasLive = ms.some(isLive);
              const firstMatch = ms[0];
              return (
                <div key={code}>
                  {/* League header */}
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-1.5 border-b border-border/10',
                    hasLive ? 'bg-destructive/[0.08]' : 'bg-white/[0.02]',
                    leagueIdx > 0 && 'border-t border-border/15'
                  )}>
                    {firstMatch?.competitionEmblem ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={firstMatch.competitionEmblem} alt={league?.name ?? code} className="h-4 w-4 object-contain" />
                    ) : (
                      <span className="text-[13px] leading-none">{league?.flag ?? '\u26BD'}</span>
                    )}
                    <span className={cn(
                      'text-[10px] font-black uppercase tracking-widest',
                      league?.color ?? 'text-muted-foreground/60'
                    )}>
                      {league?.name ?? code}
                    </span>
                    {hasLive && (
                      <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-destructive live-dot" />
                    )}
                    <span className="text-[9px] text-muted-foreground/30 ml-auto score-display">{ms.length}</span>
                  </div>

                  {ms.map((m, i) => <MatchRow key={m.id} match={m} index={i} />)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
