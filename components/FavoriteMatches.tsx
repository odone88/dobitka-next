'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFavoriteIds, matchInvolvesFavorite } from '@/lib/favorites';
import type { Match } from '@/types';
import { cn } from '@/lib/utils';

function isLive(status: string) {
  return status === 'LIVE' || status === 'IN_PLAY' || status === 'PAUSED';
}

export function FavoriteMatches({ initialMatches }: { initialMatches: Match[] }) {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [matches, setMatches] = useState<Match[]>(initialMatches);

  useEffect(() => {
    const ids = getFavoriteIds();
    setFavoriteIds(ids);
  }, []);

  // Poll for fresh data
  useEffect(() => {
    if (favoriteIds.length === 0) return;

    const poll = async () => {
      try {
        const res = await fetch('/api/live');
        if (!res.ok) return;
        const data = await res.json();
        // API returns { live: Match[], today: Match[], updatedAt: string }
        const seen = new Set<number>();
        const merged = [...(data.live ?? []), ...(data.today ?? [])].filter((m: Match) => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
        setMatches(merged);
      } catch { /* silent */ }
    };

    const id = setInterval(poll, 60_000);
    return () => clearInterval(id);
  }, [favoriteIds]);

  if (favoriteIds.length === 0) return null;

  const favMatches = matches.filter(m =>
    matchInvolvesFavorite(m.homeTeamId, m.awayTeamId, favoriteIds)
  );

  if (favMatches.length === 0) return null;

  // Sort: live first, then by time
  const sorted = [...favMatches].sort((a, b) => {
    const aLive = isLive(a.status) ? 0 : 1;
    const bLive = isLive(b.status) ? 0 : 1;
    if (aLive !== bLive) return aLive - bLive;
    return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
  });

  return (
    <section id="ulubione" className="scroll-mt-16">
      <div className="flex items-center gap-2 mb-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-primary flex-shrink-0">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
        <span className="font-display text-[15px] text-primary font-semibold">Twoje mecze</span>
        <span className="flex-1 border-t border-border" />
      </div>

      <div className="space-y-1.5">
        {sorted.map((match) => {
          const live = isLive(match.status);
          const finished = match.status === 'FINISHED';
          const scheduled = match.status === 'SCHEDULED' || match.status === 'TIMED';
          const time = new Date(match.utcDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

          // Check which team is favorite for highlight
          const homeFav = favoriteIds.includes(match.homeTeamId);
          const awayFav = favoriteIds.includes(match.awayTeamId);

          return (
            <Link
              key={match.id}
              href={`/match/${match.id}`}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                'hover:bg-white/[0.04]',
                live ? 'bg-destructive/[0.06] border border-destructive/20' : 'bg-card border border-border'
              )}
            >
              {/* Home */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                <span className={cn(
                  'text-[13px] font-medium truncate text-right',
                  homeFav ? 'text-primary font-bold' : 'text-foreground'
                )}>
                  {match.homeTeam}
                </span>
                {match.homeCrest && (
                  <img src={match.homeCrest} alt="" className="w-5 h-5 object-contain flex-shrink-0" loading="lazy" />
                )}
              </div>

              {/* Score / Time */}
              <div className="flex flex-col items-center min-w-[52px]">
                {match.homeScore !== null ? (
                  <span className={cn(
                    'score-display text-[16px] font-black',
                    live ? 'text-destructive' : 'text-foreground'
                  )}>
                    {match.homeScore} - {match.awayScore}
                  </span>
                ) : (
                  <span className="text-[13px] font-bold text-muted-foreground">{time}</span>
                )}
                {live && (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-destructive">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive live-dot" />
                    {match.status === 'PAUSED' ? 'PRZ' : match.minute ? `${match.minute}'` : 'LIVE'}
                  </span>
                )}
                {finished && (
                  <span className="text-[9px] font-bold text-muted-foreground">ZAK</span>
                )}
              </div>

              {/* Away */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                {match.awayCrest && (
                  <img src={match.awayCrest} alt="" className="w-5 h-5 object-contain flex-shrink-0" loading="lazy" />
                )}
                <span className={cn(
                  'text-[13px] font-medium truncate',
                  awayFav ? 'text-primary font-bold' : 'text-foreground'
                )}>
                  {match.awayTeam}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
