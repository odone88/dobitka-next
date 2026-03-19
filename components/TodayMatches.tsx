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
};

// Priorytet lig — niższy = ważniejszy. CL zawsze na górze.
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

/* ─── Live minute counter — odlicza w czasie rzeczywistym ────────── */
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
    if (status === 'PAUSED') return; // Przerwa — nie odliczaj
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 60000);
      setDisplay(baseMinuteRef.current + elapsed);
    }, 15000); // Aktualizuj co 15s
    return () => clearInterval(id);
  }, [status]);

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-destructive/90
                     rounded text-[9px] font-black text-white tracking-wide">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
      </span>
      {status === 'PAUSED' ? 'PRZ' : display ? `${display}'` : '•'}
    </span>
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
          {g.assist && <span className="text-muted-foreground/30"> ({g.assist})</span>}
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
    // Otwórz match detail w nowej karcie lub nawiguj
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
      <div className="flex items-center px-3 py-2" onClick={handleNavigate}>
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

        {/* Teams + Score */}
        <div className="flex-1 grid grid-cols-[1fr_auto_1fr] gap-x-2 items-center min-w-0">
          <span className={cn(
            'text-[13px] text-right truncate transition-colors',
            homeWin ? 'font-bold text-foreground' : finished ? 'text-foreground/50' : 'text-foreground/75'
          )}>
            {match.homeTeam}
          </span>
          <span className={cn(
            'score-display text-[15px] font-black min-w-[44px] text-center',
            live ? 'text-destructive' : finished ? 'text-foreground' : 'text-muted-foreground/35'
          )}>
            {hasScore ? `${match.homeScore} – ${match.awayScore}` : '–'}
          </span>
          <span className={cn(
            'text-[13px] truncate transition-colors',
            awayWin ? 'font-bold text-foreground' : finished ? 'text-foreground/50' : 'text-foreground/75'
          )}>
            {match.awayTeam}
          </span>
        </div>

        {/* HT + expand */}
        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
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
              ▾
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

  // ─── SMART MATCH PRIORITY (wzor: FotMob) ───────────────────────
  // 1. Grupuj po ligach
  // 2. Ligi z meczami LIVE sortowane na gore (po priorytecie ligi)
  // 3. Potem ligi z meczami zaplanowanymi (po priorytecie)
  // 4. Na koncu ligi z samymi zakonczono (po priorytecie)
  // 5. W kazdej lidze: LIVE > SCHEDULED > FINISHED, potem po czasie
  const grouped = new Map<string, Match[]>();
  for (const m of matches) {
    const code = m.competitionCode;
    if (!grouped.has(code)) grouped.set(code, []);
    grouped.get(code)!.push(m);
  }

  const sortedLeagues = [...grouped.entries()].sort(([codeA, matchesA], [codeB, matchesB]) => {
    const hasLiveA = matchesA.some(isLive);
    const hasLiveB = matchesB.some(isLive);

    // Ligi z LIVE zawsze wyzej
    if (hasLiveA && !hasLiveB) return -1;
    if (!hasLiveA && hasLiveB) return 1;

    // Jesli obie maja live lub obie nie — sortuj po scheduled vs finished
    const hasScheduledA = matchesA.some((m) => m.status === 'SCHEDULED' || m.status === 'TIMED');
    const hasScheduledB = matchesB.some((m) => m.status === 'SCHEDULED' || m.status === 'TIMED');
    if (hasScheduledA && !hasScheduledB) return -1;
    if (!hasScheduledA && hasScheduledB) return 1;

    // Na koniec: priorytet ligi
    const pa = LEAGUE_PRIORITY[codeA] ?? 99;
    const pb = LEAGUE_PRIORITY[codeB] ?? 99;
    return pa - pb;
  });

  // Sortowanie meczow wewnatrz ligi: LIVE > SCHEDULED > FINISHED > czas
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
          <div className="py-6 text-center">
            <p className="text-[13px] text-muted-foreground/60">Nie udalo sie zaladowac meczow.</p>
            <button onClick={() => { setTimedOut(false); setLoading(true); fetchData(selectedDate); }}
              className="mt-2 text-[12px] text-primary hover:underline cursor-pointer">Sprobuj ponownie</button>
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
        <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
          {liveCount > 0 && (
            <span className="text-destructive/80 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive live-dot" />
              {liveCount} live
            </span>
          )}
          {scheduledCount > 0 && <span>{scheduledCount} zaplanowanych</span>}
          {finishedCount > 0 && <span>{finishedCount} zakonczonych</span>}
          {updatedAt && (() => {
            const ago = Math.round((Date.now() - new Date(updatedAt).getTime()) / 60000);
            return ago > 5 ? (
              <span className="text-muted-foreground/25">· dane sprzed {ago} min</span>
            ) : null;
          })()}
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
              return (
                <div key={code}>
                  {/* League header */}
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-1.5 border-b border-border/10',
                    hasLive ? 'bg-destructive/[0.08]' : 'bg-white/[0.02]',
                    leagueIdx > 0 && 'border-t border-border/15'
                  )}>
                    <span className="text-[13px] leading-none">{league?.flag ?? '⚽'}</span>
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
