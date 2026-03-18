'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Match, MatchGoal } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const COMP_PRIORITY = ['CL', 'PL', 'PD', 'SA', 'BL1', 'FL1'];

function pickMatches(live: Match[], today: Match[]): { hero: Match | null; secondary: Match[] } {
  if (live.length > 0) {
    const sorted = [...live].sort((a, b) => {
      const ai = COMP_PRIORITY.indexOf(a.competitionCode);
      const bi = COMP_PRIORITY.indexOf(b.competitionCode);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return { hero: sorted[0], secondary: sorted.slice(1, 4) };
  }
  const finished = [...today]
    .filter((m) => m.status === 'FINISHED' && m.homeScore !== null)
    .sort((a, b) => (b.homeScore! + b.awayScore!) - (a.homeScore! + a.awayScore!));
  if (finished.length > 0) return { hero: finished[0], secondary: [] };

  const upcoming = [...today]
    .filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED')
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
  return { hero: upcoming[0] ?? null, secondary: [] };
}

function HeroGoalLine({ goals, teamId, isHome }: { goals: MatchGoal[]; teamId: number; isHome: boolean }) {
  const teamGoals = goals.filter((g) => g.teamId === teamId);
  if (teamGoals.length === 0) return null;
  return (
    <div className={cn('flex flex-col gap-0.5', isHome ? 'items-end' : 'items-start')}>
      {teamGoals.map((g, i) => (
        <span key={i} className="text-[11px] text-muted-foreground/60 leading-tight">
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

export function MatchHero() {
  const [hero, setHero] = useState<Match | null>(null);
  const [secondary, setSecondary] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoreChanged, setScoreChanged] = useState(false);
  const prevScoreRef = useRef<string>('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/live');
      if (!res.ok) return;
      const d = await res.json();
      const { hero: h, secondary: s } = pickMatches(d.live ?? [], d.today ?? []);
      setHero(h);
      setSecondary(s);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => clearInterval(id);
  }, [fetchData]);

  // Detect score changes for animation
  useEffect(() => {
    if (!hero) return;
    const key = `${hero.homeScore}-${hero.awayScore}`;
    if (prevScoreRef.current !== '' && prevScoreRef.current !== key) {
      setScoreChanged(true);
      const t = setTimeout(() => setScoreChanged(false), 1000);
      return () => clearTimeout(t);
    }
    prevScoreRef.current = key;
  }, [hero?.homeScore, hero?.awayScore, hero]);

  if (loading) return <Skeleton className="h-36 w-full rounded-xl" />;
  if (!hero) return null;

  const isLive = hero.status === 'LIVE' || hero.status === 'IN_PLAY' || hero.status === 'PAUSED';
  const isFinished = hero.status === 'FINISHED';
  const hasScore = hero.homeScore !== null && hero.awayScore !== null;
  const homeWin = hasScore && hero.homeScore! > hero.awayScore!;
  const awayWin = hasScore && hero.awayScore! > hero.homeScore!;

  return (
    <div className="space-y-2">
      {/* Main hero card */}
      <div className={cn(
        'relative overflow-hidden rounded-xl border card-elevated',
        isLive
          ? 'border-live border-red-500/50 bg-gradient-to-br from-red-950/40 via-card to-card'
          : 'border-border bg-card'
      )}>
        {/* Top strip */}
        <div className={cn(
          'flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-widest',
          isLive ? 'bg-red-600 text-white' : 'bg-white/[0.03] text-muted-foreground/60'
        )}>
          <span className="flex items-center gap-2">
            {isLive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
            )}
            {isLive ? 'Na żywo' : isFinished ? 'Wynik meczu' : 'Zapowiedź'}
          </span>
          <span className="opacity-70">{hero.competition || hero.competitionCode}</span>
        </div>

        {/* Score area */}
        <div className="px-4 py-5 flex items-center gap-4">
          <div className="flex-1 text-right">
            <p className={cn('text-[18px] font-extrabold leading-tight',
              homeWin ? 'text-foreground' : 'text-foreground/60')}>
              {hero.homeTeam}
            </p>
          </div>

          <div className="flex-shrink-0 text-center min-w-[100px]">
            {hasScore ? (
              <div className={cn(
                'score-display text-[42px] leading-none font-black tracking-tight',
                isLive ? 'text-red-300' : 'text-foreground',
                scoreChanged && 'score-just-changed'
              )}>
                {hero.homeScore}<span className="text-muted-foreground/30 mx-1">–</span>{hero.awayScore}
              </div>
            ) : (
              <div>
                <p className="text-[28px] font-black text-muted-foreground/30">VS</p>
                <p className="text-[12px] text-muted-foreground/50 score-display mt-0.5">
                  {new Date(hero.utcDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
            {isLive && hero.minute && (
              <p className="text-[13px] font-black text-red-400 score-display mt-1">{hero.minute}&apos;</p>
            )}
          </div>

          <div className="flex-1 text-left">
            <p className={cn('text-[18px] font-extrabold leading-tight',
              awayWin ? 'text-foreground' : 'text-foreground/60')}>
              {hero.awayTeam}
            </p>
          </div>
        </div>

        {/* Goal scorers */}
        {hero.goals && hero.goals.length > 0 && (isLive || isFinished) && (
          <div className="px-4 pb-3 pt-0">
            <div className="border-t border-border/20 pt-2 grid grid-cols-[1fr_auto_1fr] gap-x-4 items-start">
              <HeroGoalLine goals={hero.goals} teamId={hero.homeTeamId} isHome={true} />
              <div />
              <HeroGoalLine goals={hero.goals} teamId={hero.awayTeamId} isHome={false} />
            </div>
          </div>
        )}
        {/* Half-time */}
        {hero.halfTime && isFinished && (
          <div className="px-4 pb-3 pt-0 text-center">
            <span className="text-[10px] text-muted-foreground/30">Przerwa: {hero.halfTime}</span>
          </div>
        )}
      </div>

      {/* Secondary live matches — mini cards under hero */}
      {secondary.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {secondary.map((m) => (
            <div
              key={m.id}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg
                         border border-red-500/25 bg-red-950/15 text-[12px]
                         animate-[fadeIn_300ms_ease-out]"
            >
              <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400/60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-400" />
              </span>
              <span className="font-bold text-foreground/80 truncate max-w-[80px]">{m.homeTeam}</span>
              <span className="score-display text-red-300 font-black">
                {m.homeScore}–{m.awayScore}
              </span>
              <span className="font-bold text-foreground/80 truncate max-w-[80px]">{m.awayTeam}</span>
              {m.minute && <span className="text-red-400/60 score-display text-[10px]">{m.minute}&apos;</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
