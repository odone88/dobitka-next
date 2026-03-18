'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Match } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getEditorialLine } from '@/lib/match-comments';

const COMP_PRIORITY = ['CL', 'PL', 'PD', 'SA', 'BL1', 'FL1'];

function pickHeroMatch(live: Match[], today: Match[]): Match | null {
  if (live.length > 0) {
    return [...live].sort((a, b) => {
      const ai = COMP_PRIORITY.indexOf(a.competitionCode);
      const bi = COMP_PRIORITY.indexOf(b.competitionCode);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })[0];
  }
  const finished = [...today]
    .filter((m) => m.status === 'FINISHED' && m.homeScore !== null)
    .sort((a, b) => (b.homeScore! + b.awayScore!) - (a.homeScore! + a.awayScore!));
  if (finished.length > 0) return finished[0];

  const upcoming = [...today]
    .filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED')
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
  return upcoming[0] ?? null;
}

function editorialLine(m: Match): string {
  return getEditorialLine(m.homeTeam, m.awayTeam, m.homeScore, m.awayScore, m.status, m.utcDate, m.id);
}

export function MatchHero() {
  const [hero, setHero] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/live');
      if (!res.ok) return;
      const d = await res.json();
      setHero(pickHeroMatch(d.live ?? [], d.today ?? []));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => clearInterval(id);
  }, [fetchData]);

  if (loading) return <Skeleton className="h-32 w-full rounded-xl" />;
  if (!hero) return null;

  const isLive = hero.status === 'LIVE' || hero.status === 'IN_PLAY' || hero.status === 'PAUSED';
  const isFinished = hero.status === 'FINISHED';
  const hasScore = hero.homeScore !== null && hero.awayScore !== null;
  const homeWin = hasScore && hero.homeScore! > hero.awayScore!;
  const awayWin = hasScore && hero.awayScore! > hero.homeScore!;

  return (
    <div className={`relative overflow-hidden rounded-xl border ${
      isLive
        ? 'border-red-500/50 bg-gradient-to-br from-red-950/50 via-card to-card'
        : 'border-border bg-card'
    }`}>
      {/* Top strip */}
      <div className={`flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
        isLive ? 'bg-red-600 text-white' : 'bg-white/4 text-muted-foreground'
      }`}>
        <span className="flex items-center gap-2">
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white live-ring" />}
          {isLive ? 'NA ŻYWO' : isFinished ? 'WYNIK MECZU' : 'ZAPOWIEDŹ'}
        </span>
        <span className="opacity-70">{hero.competition || hero.competitionCode}</span>
      </div>

      {/* Score area */}
      <div className="px-4 py-5 flex items-center gap-4">
        {/* Home */}
        <div className="flex-1 text-right">
          <p className={`text-[18px] font-black leading-tight ${homeWin ? 'text-foreground' : 'text-foreground/70'}`}>
            {hero.homeTeam}
          </p>
        </div>

        {/* Score / vs */}
        <div className="flex-shrink-0 text-center min-w-[100px]">
          {hasScore ? (
            <div className={`score-display text-[42px] leading-none font-black tracking-tight ${
              isLive ? 'text-red-300' : 'text-foreground'
            }`}>
              {hero.homeScore}<span className="text-muted-foreground/40 mx-1">–</span>{hero.awayScore}
            </div>
          ) : (
            <div>
              <p className="text-[28px] font-black text-muted-foreground/40">VS</p>
              <p className="text-[12px] text-muted-foreground/60 score-display mt-0.5">
                {new Date(hero.utcDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
          {isLive && hero.minute && (
            <p className="text-[13px] font-black text-red-400 score-display mt-1">{hero.minute}&apos;</p>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 text-left">
          <p className={`text-[18px] font-black leading-tight ${awayWin ? 'text-foreground' : 'text-foreground/70'}`}>
            {hero.awayTeam}
          </p>
        </div>
      </div>

      {/* Editorial comment */}
      <div className="px-4 pb-4 pt-0">
        <div className="border-t border-border/30 pt-3">
          <p className="text-[13px] text-muted-foreground italic leading-relaxed">
            {editorialLine(hero)}
          </p>
        </div>
      </div>
    </div>
  );
}
