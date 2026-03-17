'use client';

import { useEffect, useState } from 'react';
import type { FeaturedTeam as FeaturedTeamType } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export function FeaturedTeam() {
  const [team, setTeam] = useState<FeaturedTeamType | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch('/api/featured-team')
      .then((r) => r.json())
      .then((d) => setTeam(d.team))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-24 w-full" />;
  if (!team) return null;

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
      {team.badge && (
        <img
          src={team.badge}
          alt={team.name}
          className="w-12 h-12 object-contain flex-shrink-0"
          loading="lazy"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm text-foreground">{team.name}</h3>
          <span className="text-xs text-muted-foreground">{team.country}</span>
        </div>
        {team.stadium && (
          <p className="text-xs text-muted-foreground mb-1">Stadion: {team.stadium}</p>
        )}
        {team.bio && (
          <div>
            <p className={`text-xs text-muted-foreground leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
              {team.bio}
            </p>
            {team.bio.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-primary hover:underline mt-1"
              >
                {expanded ? 'Zwiń' : 'Więcej'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
