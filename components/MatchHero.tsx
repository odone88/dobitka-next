'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Match } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const COMP_PRIORITY = ['CL', 'PL', 'PD', 'SA', 'BL1', 'FL1'];

function pickHeroMatch(live: Match[], today: Match[]): Match | null {
  // 1. Live UCL first
  const liveUCL = live.find((m) => m.competitionCode === 'CL');
  if (liveUCL) return liveUCL;
  // 2. Any live match
  if (live.length > 0) {
    const sorted = [...live].sort(
      (a, b) => COMP_PRIORITY.indexOf(a.competitionCode) - COMP_PRIORITY.indexOf(b.competitionCode)
    );
    return sorted[0];
  }
  // 3. Most recent finished with goals
  const finished = today
    .filter((m) => m.status === 'FINISHED' && m.homeScore !== null)
    .sort((a, b) => (b.homeScore! + b.awayScore!) - (a.homeScore! + a.awayScore!));
  if (finished.length > 0) return finished[0];
  // 4. Next upcoming
  const upcoming = today
    .filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED')
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
  return upcoming[0] ?? null;
}

function editorialLine(m: Match): string {
  if (m.status === 'LIVE' || m.status === 'IN_PLAY') {
    if (m.homeScore === m.awayScore) return `Remis na żywo — napięcie rośnie.`;
    const leading = m.homeScore! > m.awayScore! ? m.homeTeam : m.awayTeam;
    return `${leading} prowadzi — ale nic nie jest przesądzone.`;
  }
  if (m.status === 'FINISHED' && m.homeScore !== null) {
    const diff = m.homeScore! - m.awayScore!;
    if (diff === 0) return `Remis — jeden punkt, mnóstwo niedosytu.`;
    const winner = diff > 0 ? m.homeTeam : m.awayTeam;
    const loser = diff > 0 ? m.awayTeam : m.homeTeam;
    if (Math.abs(diff) >= 3) return `${winner} rozjechał ${loser} — komplet punktów bez dyskusji.`;
    if (Math.abs(diff) === 2) return `${winner} kontrolował od początku do końca.`;
    return `${winner} zdobył trzy punkty, ale musiał się napocić.`;
  }
  const date = new Date(m.utcDate);
  const time = date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  return `Dziś o ${time} — to może być mecz dnia.`;
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
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => clearInterval(id);
  }, [fetchData]);

  if (loading) return <Skeleton className="h-28 w-full rounded-xl" />;
  if (!hero) return null;

  const isLive = hero.status === 'LIVE' || hero.status === 'IN_PLAY' || hero.status === 'PAUSED';
  const isFinished = hero.status === 'FINISHED';
  const hasScore = hero.homeScore !== null && hero.awayScore !== null;

  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 ${
      isLive
        ? 'border-red-500/50 bg-gradient-to-br from-red-950/40 to-card'
        : 'border-border/80 bg-gradient-to-br from-muted/20 to-card'
    }`}>
      {/* Competition label */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {isLive ? 'Na Żywo' : isFinished ? 'Wynik' : 'Zapowiedź'} · {hero.competition || hero.competitionCode}
          </span>
        </div>
        {isLive && hero.minute && (
          <Badge variant="destructive" className="text-sm font-bold px-2">{hero.minute}'</Badge>
        )}
      </div>

      {/* Match */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-xl font-bold text-foreground text-right flex-1">{hero.homeTeam}</span>
        <div className="flex-shrink-0 text-center">
          {hasScore ? (
            <span className={`text-4xl font-black tabular-nums tracking-tight ${
              isLive ? 'text-red-300' : 'text-foreground'
            }`}>
              {hero.homeScore} – {hero.awayScore}
            </span>
          ) : (
            <div className="text-center">
              <span className="text-2xl font-black text-muted-foreground/60">vs</span>
              <div className="text-[11px] text-muted-foreground mt-1">
                {new Date(hero.utcDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )}
        </div>
        <span className="text-xl font-bold text-foreground flex-1">{hero.awayTeam}</span>
      </div>

      {/* Editorial comment */}
      <p className="mt-4 text-[13px] text-muted-foreground italic border-t border-border/40 pt-3">
        {editorialLine(hero)}
      </p>
    </div>
  );
}
