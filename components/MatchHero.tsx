'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Match } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function isLive(m: Match) {
  return m.status === 'LIVE' || m.status === 'IN_PLAY' || m.status === 'PAUSED';
}

export function MatchHero() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoreChanged, setScoreChanged] = useState(false);
  const prevScoreRef = useRef<string>('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/live');
      if (!res.ok) return;
      const d = await res.json();
      setMatches(d.today ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 90_000);
    return () => clearInterval(id);
  }, [fetchData]);

  const liveMatches = matches.filter(isLive);
  const finished = matches.filter((m) => m.status === 'FINISHED' && m.homeScore !== null);
  const upcoming = matches.filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED')
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

  // Detect score changes
  useEffect(() => {
    if (liveMatches.length === 0) return;
    const key = liveMatches.map((m) => `${m.id}:${m.homeScore}-${m.awayScore}`).join(',');
    if (prevScoreRef.current !== '' && prevScoreRef.current !== key) {
      setScoreChanged(true);
      const t = setTimeout(() => setScoreChanged(false), 1200);
      return () => clearTimeout(t);
    }
    prevScoreRef.current = key;
  }, [liveMatches]);

  if (loading) return <Skeleton className="h-14 w-full rounded-xl" />;

  // MODE 1: Live matches
  if (liveMatches.length > 0) {
    return (
      <div className="rounded-xl border border-red-500/50 bg-gradient-to-r from-red-950/40 via-card to-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          {liveMatches.length} {liveMatches.length === 1 ? 'mecz na żywo' : 'mecze na żywo'}
        </div>
        <div className="px-4 py-3 flex flex-wrap gap-x-6 gap-y-2">
          {liveMatches.map((m) => (
            <div key={m.id} className="flex items-center gap-2 text-[14px]">
              <span className="font-bold text-foreground/90">{m.homeTeam}</span>
              <span className={cn(
                'score-display text-[18px] font-black text-red-300',
                scoreChanged && 'score-just-changed'
              )}>
                {m.homeScore}&thinsp;–&thinsp;{m.awayScore}
              </span>
              <span className="font-bold text-foreground/90">{m.awayTeam}</span>
              {m.minute && (
                <span className="text-[11px] font-black text-red-400/80 score-display">{m.minute}&apos;</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // MODE 2: Finished matches today — show top 3 results
  if (finished.length > 0) {
    const top = finished
      .sort((a, b) => (b.homeScore! + b.awayScore!) - (a.homeScore! + a.awayScore!))
      .slice(0, 4);
    return (
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          Wyniki dnia
        </div>
        <div className="px-4 py-3 flex flex-wrap gap-x-6 gap-y-2">
          {top.map((m) => {
            const homeWin = m.homeScore! > m.awayScore!;
            const awayWin = m.awayScore! > m.homeScore!;
            return (
              <div key={m.id} className="flex items-center gap-2 text-[14px]">
                <span className={cn('font-medium', homeWin ? 'text-foreground font-bold' : 'text-foreground/50')}>
                  {m.homeTeam}
                </span>
                <span className="score-display text-[16px] font-black text-foreground">
                  {m.homeScore}&thinsp;–&thinsp;{m.awayScore}
                </span>
                <span className={cn('font-medium', awayWin ? 'text-foreground font-bold' : 'text-foreground/50')}>
                  {m.awayTeam}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // MODE 3: Upcoming match
  if (upcoming.length > 0) {
    const next = upcoming[0];
    const time = new Date(next.utcDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    const day = new Date(next.utcDate).toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' });
    const isToday = new Date(next.utcDate).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
    return (
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          Najbliższy mecz
        </div>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 text-[16px]">
            <span className="font-bold text-foreground">{next.homeTeam}</span>
            <span className="text-muted-foreground/30 font-black">vs</span>
            <span className="font-bold text-foreground">{next.awayTeam}</span>
          </div>
          <span className="text-[12px] text-muted-foreground/60 ml-auto">
            {isToday ? `dziś ${time}` : `${day} · ${time}`}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-primary/60">
            {next.competitionCode}
          </span>
        </div>
      </div>
    );
  }

  // MODE 4: No matches at all — show nothing (news below will fill the gap)
  return null;
}
