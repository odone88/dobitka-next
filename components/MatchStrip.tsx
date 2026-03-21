'use client';

import { useEffect, useState } from 'react';
import type { Match } from '@/types';
import { cn } from '@/lib/utils';

export function MatchStrip() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetch('/api/live')
      .then((r) => r.json())
      .then((d) => setMatches(d.today ?? []))
      .catch(() => {});
    const id = setInterval(() => {
      fetch('/api/live').then((r) => r.json()).then((d) => setMatches(d.today ?? [])).catch(() => {});
    }, 60000);
    return () => clearInterval(id);
  }, []);

  if (matches.length === 0) return null;

  return (
    <div className="overflow-x-auto scrollbar-none">
      <div className="flex gap-2 pb-1 min-w-max">
        {matches.map((m) => {
          const isLive = m.status === 'LIVE' || m.status === 'IN_PLAY' || m.status === 'PAUSED';
          const isFinished = m.status === 'FINISHED';
          const hasScore = m.homeScore !== null && m.awayScore !== null;
          const time = new Date(m.utcDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={m.id}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border flex-shrink-0 whitespace-nowrap',
                isLive ? 'border-red-500/50 bg-red-950/30 text-foreground' : 'border-border bg-card text-muted-foreground'
              )}
            >
              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />}
              <span className={cn('font-medium', isLive ? 'text-foreground' : '')}>{m.homeTeam}</span>
              <span className={cn('font-mono font-bold tabular-nums', isLive ? 'text-red-300' : isFinished ? 'text-foreground' : 'text-muted-foreground')}>
                {hasScore ? `${m.homeScore}–${m.awayScore}` : time}
              </span>
              <span className={cn('font-medium', isLive ? 'text-foreground' : '')}>{m.awayTeam}</span>
              {isLive && m.minute && (
                <span className="text-[10px] text-red-400 font-bold">{m.minute}'</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
