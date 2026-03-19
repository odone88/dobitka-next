'use client';

import { useEffect, useState, useCallback } from 'react';
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
};

const LEAGUE_PRIORITY: Record<string, number> = {
  CL: 0, PL: 1, PD: 2, SA: 3, BL1: 4, FL1: 5,
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
    <div className="flex gap-1 justify-center">
      {days.map((d) => (
        <button
          key={d.date}
          onClick={() => onChange(d.date)}
          className={cn(
            'px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer',
            selected === d.date
              ? 'bg-primary text-primary-foreground'
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

/* ─── Goal scorers line ──────────────────────────────────────────── */
function GoalLine({ goals, teamId, isHome }: { goals: MatchGoal[]; teamId: number; isHome: boolean }) {
  const teamGoals = goals.filter((g) => g.teamId === teamId);
  if (teamGoals.length === 0) return null;

  return (
    <div className={cn('flex flex-col gap-0.5', isHome ? 'items-end' : 'items-start')}>
      {teamGoals.map((g, i) => (
        <span key={i} className="text-[10px] text-muted-foreground/60 leading-tight">
          <span className="text-foreground/70">{g.scorer}</span>
          <span className="text-muted-foreground/40"> {g.minute}&apos;</span>
          {g.type === 'PENALTY' && <span className="text-muted-foreground/30"> (k)</span>}
          {g.type === 'OWN_GOAL' && <span className="text-red-400/50"> (sam.)</span>}
          {g.assist && <span className="text-muted-foreground/30"> ({g.assist})</span>}
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

  // Use loaded goals if available, otherwise fall back to inline goals
  const goals = loadedGoals ?? match.goals;
  const hasGoals = goals.length > 0;

  // Can expand if match has a score > 0 and goals aren't already visible
  const canExpand = hasScore && (match.homeScore! + match.awayScore!) > 0 && (finished || live);

  function handleClick() {
    if (!canExpand) return;

    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);

    // If we already have goals (from list API or previous load), just show them
    if (goals.length > 0) return;

    // Fetch goal details on-demand
    setLoadingGoals(true);
    fetch(`/api/match/${match.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.goals) setLoadedGoals(data.goals);
      })
      .catch(() => {})
      .finally(() => setLoadingGoals(false));
  }

  return (
    <div
      className={cn(
        'border-b border-border/10 border-l-2',
        LEAGUE_ACCENT[match.competitionCode] ?? 'border-l-border/20',
        live && 'bg-red-950/10',
        canExpand && 'cursor-pointer',
      )}
      onClick={handleClick}
    >
      {/* Main row */}
      <div className="flex items-center px-3 py-2">
        {/* Time / Status */}
        <div className="w-11 flex-shrink-0 text-center">
          {live ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-600/90
                             rounded text-[9px] font-black text-white tracking-wide">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              {match.minute ? `${match.minute}'` : '•'}
            </span>
          ) : finished ? (
            <span className="text-[10px] font-bold text-muted-foreground/50">KOŃ</span>
          ) : (
            <span className="text-[11px] score-display text-muted-foreground/50">{time}</span>
          )}
        </div>

        {/* Teams + Score */}
        <div className="flex-1 grid grid-cols-[1fr_auto_1fr] gap-x-2 items-center min-w-0">
          <span className={cn(
            'text-[13px] text-right truncate',
            homeWin ? 'font-bold text-foreground' : finished ? 'text-foreground/50' : 'text-foreground/75'
          )}>
            {match.homeTeam}
          </span>
          <span className={cn(
            'score-display text-[15px] font-black min-w-[40px] text-center',
            live ? 'text-red-300' : finished ? 'text-foreground' : 'text-muted-foreground/40'
          )}>
            {hasScore ? `${match.homeScore} – ${match.awayScore}` : '–'}
          </span>
          <span className={cn(
            'text-[13px] truncate',
            awayWin ? 'font-bold text-foreground' : finished ? 'text-foreground/50' : 'text-foreground/75'
          )}>
            {match.awayTeam}
          </span>
        </div>

        {/* HT indicator + expand hint */}
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {match.halfTime && finished && (
            <span className="text-[9px] text-muted-foreground/40 hidden sm:block">
              ({match.halfTime})
            </span>
          )}
          {canExpand && !hasGoals && (
            <span className={cn(
              'text-[9px] text-muted-foreground/30 transition-transform',
              expanded ? 'rotate-180' : ''
            )}>
              ▾
            </span>
          )}
        </div>
      </div>

      {/* Goal scorers — always show if from list API, on-demand only when expanded */}
      {expanded && loadingGoals && (
        <div className="px-3 pb-2 text-center">
          <span className="text-[10px] text-muted-foreground/40">Ładowanie strzelców...</span>
        </div>
      )}
      {hasGoals && (match.goals.length > 0 || expanded) && (finished || live) && (
        <div className="px-3 pb-2 -mt-0.5 grid grid-cols-[1fr_40px_1fr] gap-x-2 items-start"
             style={{ paddingLeft: 'calc(0.75rem + 2.75rem)' }}>
          <GoalLine goals={goals} teamId={match.homeTeamId} isHome={true} />
          <div />
          <GoalLine goals={goals} teamId={match.awayTeamId} isHome={false} />
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export function TodayMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Timeout: if still loading after 6s, show fallback
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setTimedOut(true), 6000);
    return () => clearTimeout(t);
  }, [loading]);

  useEffect(() => {
    fetchData(selectedDate);
    const isToday = selectedDate === new Date().toISOString().slice(0, 10);
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

  // Group by league
  const grouped = new Map<string, Match[]>();
  for (const m of matches) {
    const code = m.competitionCode;
    if (!grouped.has(code)) grouped.set(code, []);
    grouped.get(code)!.push(m);
  }

  const sortedLeagues = [...grouped.entries()].sort(([a], [b]) => {
    const pa = LEAGUE_PRIORITY[a] ?? 99;
    const pb = LEAGUE_PRIORITY[b] ?? 99;
    return pa - pb;
  });

  for (const [, ms] of sortedLeagues) {
    ms.sort((a, b) => {
      if (isLive(a) && !isLive(b)) return -1;
      if (!isLive(a) && isLive(b)) return 1;
      return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
    });
  }

  const liveCount = matches.filter(isLive).length;

  if (loading) {
    return (
      <div className="space-y-2">
        <DayPicker selected={selectedDate} onChange={handleDateChange} />
        {timedOut ? (
          <div className="py-6 text-center">
            <p className="text-[13px] text-muted-foreground/60">Nie udało się załadować meczów.</p>
            <button onClick={() => { setTimedOut(false); setLoading(true); fetchData(selectedDate); }}
              className="mt-2 text-[12px] text-primary hover:underline cursor-pointer">Spróbuj ponownie</button>
          </div>
        ) : (
          <div className="space-y-0.5">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
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
        <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/35">
          {liveCount > 0 && <span className="text-red-400/80">{liveCount} live</span>}
          <span>{matches.length} meczów</span>
          {updatedAt && (() => {
            const ago = Math.round((Date.now() - new Date(updatedAt).getTime()) / 60000);
            return ago > 5 ? (
              <span className="text-muted-foreground/40">· dane sprzed {ago} min</span>
            ) : null;
          })()}
        </div>
      )}

      {/* Match list */}
      <div className={cn(
        'transition-opacity duration-150',
        switching ? 'opacity-40' : 'opacity-100'
      )}>
        {sortedLeagues.length === 0 ? (
          <div className="py-6 text-center space-y-1">
            <p className="text-[13px] text-muted-foreground/60">Brak meczów na ten dzień.</p>
            <p className="text-[11px] text-muted-foreground/40">Wybierz inny dzień lub sprawdź sekcję newsów poniżej.</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-border/30 card-elevated">
            {sortedLeagues.map(([code, ms], leagueIdx) => {
              const league = getLeague(code);
              const hasLive = ms.some(isLive);
              return (
                <div key={code}>
                  {/* League header */}
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-1.5 border-b border-border/15',
                    hasLive ? 'bg-red-950/15' : 'bg-white/[0.02]',
                    leagueIdx > 0 && 'border-t border-border/20'
                  )}>
                    <span className="text-[13px] leading-none">{league?.flag ?? '⚽'}</span>
                    <span className={cn(
                      'text-[10px] font-black uppercase tracking-widest',
                      league?.color ?? 'text-muted-foreground/60'
                    )}>
                      {league?.name ?? code}
                    </span>
                    <span className="text-[9px] text-muted-foreground/40 ml-auto tabular-nums">{ms.length}</span>
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
