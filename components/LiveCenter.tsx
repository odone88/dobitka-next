'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Match } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface LiveData {
  live: Match[];
  today: Match[];
  updatedAt: string;
}

function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === 'LIVE' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  const time = !hasScore
    ? new Date(match.utcDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
      isLive ? 'border-red-500/40 bg-red-950/20' : 'border-border bg-card'
    }`}>
      {isLive && (
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-xs font-bold">
            {match.minute ? `${match.minute}'` : 'LIVE'}
          </span>
        </span>
      )}
      <span className="font-medium text-foreground truncate max-w-[90px]">{match.homeTeam}</span>
      {hasScore ? (
        <span className={`font-mono font-bold px-1 text-sm ${
          isLive ? 'text-red-300' : isFinished ? 'text-foreground' : 'text-muted-foreground'
        }`}>
          {match.homeScore}–{match.awayScore}
        </span>
      ) : (
        <span className="text-muted-foreground text-xs font-mono px-1">{time}</span>
      )}
      <span className="font-medium text-foreground truncate max-w-[90px]">{match.awayTeam}</span>
      <span className="text-xs text-muted-foreground ml-auto hidden sm:block">{match.competitionCode || match.competition}</span>
    </div>
  );
}

export function LiveCenter() {
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'live' | 'today'>('live');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/live');
      if (res.ok) setData(await res.json());
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60s when there are live matches
    const id = setInterval(() => {
      if (data?.live && data.live.length > 0) fetchData();
    }, 60000);
    return () => clearInterval(id);
  }, [fetchData, data?.live?.length]);

  const liveMatches = data?.live ?? [];
  const todayMatches = data?.today ?? [];
  const displayList = tab === 'live' ? liveMatches : todayMatches;

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setTab('live')}
          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
            tab === 'live'
              ? 'bg-red-500 text-white'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          LIVE
          {liveMatches.length > 0 && (
            <Badge variant="destructive" className="ml-1.5 text-xs px-1 py-0 h-4">
              {liveMatches.length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setTab('today')}
          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
            tab === 'today'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Dzisiaj ({todayMatches.length})
        </button>
        {data?.updatedAt && (
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(data.updatedAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {displayList.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {tab === 'live' ? 'Brak meczów na żywo' : 'Brak meczów dzisiaj'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {displayList.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      )}
    </div>
  );
}
