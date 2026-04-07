'use client';

import { useEffect, useState } from 'react';
import type { Scorer } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const LEAGUES_TO_SHOW = [
  { code: 'PPL', name: 'Ekstraklasa', flag: '🇵🇱' },
  { code: 'PL', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
];

interface LeagueScorers {
  code: string;
  name: string;
  flag: string;
  scorers: Scorer[];
}

export function TopScorers() {
  const [data, setData] = useState<LeagueScorers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled(
      LEAGUES_TO_SHOW.map(async (league) => {
        const res = await fetch(`/api/standings/${league.code}`);
        if (!res.ok) return null;
        const d = await res.json();
        return {
          code: league.code,
          name: league.name,
          flag: league.flag,
          scorers: (d.scorers ?? []) as Scorer[],
        };
      })
    ).then((results) => {
      const valid: LeagueScorers[] = [];
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value && r.value.scorers.length > 0) {
          valid.push(r.value);
        }
      }
      setData(valid);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
      </div>
    );
  }

  if (data.length === 0) return null;

  return (
    <div className="space-y-4">
      {data.map((league) => (
        <div key={league.code}>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">{league.flag}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {league.name}
            </span>
          </div>
          <div className="space-y-0">
            {league.scorers.slice(0, 5).map((s, i) => (
              <div
                key={s.playerName}
                className={cn(
                  'flex items-center gap-2 py-1.5 text-[13px]',
                  i < league.scorers.length - 1 && 'border-b border-border'
                )}
              >
                <span className={cn(
                  'w-5 h-5 rounded flex items-center justify-center text-[10px] font-black flex-shrink-0',
                  i === 0 ? 'bg-primary text-primary-foreground' :
                  i < 3 ? 'bg-primary/20 text-primary' :
                  'bg-muted text-muted-foreground'
                )}>
                  {i + 1}
                </span>
                <span className="text-foreground flex-1 truncate font-medium">{s.playerName}</span>
                <span className="text-[11px] text-muted-foreground truncate max-w-[70px]">{s.teamName}</span>
                <span className="score-display text-[15px] font-black text-foreground w-7 text-right">{s.goals}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
