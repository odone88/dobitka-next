'use client';

import { useEffect, useState } from 'react';
import type { BracketRound, BracketMatch } from '@/lib/data-sources/ucl-bracket';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function MatchCard({ match }: { match: BracketMatch }) {
  const isLive = match.status === 'LIVE' || match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  const homeWin = hasScore && match.homeScore! > match.awayScore!;
  const awayWin = hasScore && match.awayScore! > match.homeScore!;

  const date = new Date(match.utcDate);
  const dateStr = date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  const timeStr = date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cn(
      'rounded-xl border p-3 space-y-2 transition-all',
      isLive ? 'border-red-500/50 bg-red-950/20' : 'border-border bg-card'
    )}>
      {/* Teams + Score */}
      <div className="space-y-1.5">
        {/* Home */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {match.homeCrest && (
              <img src={match.homeCrest} alt="" className="w-5 h-5 object-contain flex-shrink-0" loading="lazy" />
            )}
            <span className={cn('text-sm truncate', homeWin ? 'font-bold text-foreground' : 'text-muted-foreground')}>
              {match.homeTeam}
            </span>
          </div>
          {hasScore ? (
            <span className={cn('font-mono font-bold text-base tabular-nums', isLive ? 'text-red-300' : 'text-foreground')}>
              {match.homeScore}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground font-mono">{dateStr} {timeStr}</span>
          )}
        </div>
        {/* Away */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {match.awayCrest && (
              <img src={match.awayCrest} alt="" className="w-5 h-5 object-contain flex-shrink-0" loading="lazy" />
            )}
            <span className={cn('text-sm truncate', awayWin ? 'font-bold text-foreground' : 'text-muted-foreground')}>
              {match.awayTeam}
            </span>
          </div>
          {hasScore && (
            <span className={cn('font-mono font-bold text-base tabular-nums', isLive ? 'text-red-300' : 'text-foreground')}>
              {match.awayScore}
            </span>
          )}
        </div>
      </div>

      {/* Status + comment */}
      <div className="flex items-start justify-between gap-2 pt-1 border-t border-border/50">
        {isLive ? (
          <Badge variant="destructive" className="text-xs h-5">LIVE</Badge>
        ) : isFinished ? (
          <Badge variant="secondary" className="text-xs h-5">FT</Badge>
        ) : (
          <Badge variant="outline" className="text-xs h-5">{dateStr}</Badge>
        )}
        {match.comment && (
          <p className="text-xs text-muted-foreground italic leading-relaxed text-right">
            {match.comment}
          </p>
        )}
      </div>
    </div>
  );
}

function RoundSection({ round }: { round: BracketRound }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        {round.label}
        <span className="text-xs text-muted-foreground font-normal ml-1">({round.matches.length} meczów)</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {round.matches.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>
    </div>
  );
}

export function UCLBracket() {
  const [rounds, setRounds] = useState<BracketRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRound, setActiveRound] = useState(0);

  useEffect(() => {
    fetch('/api/ucl-bracket')
      .then((r) => r.json())
      .then((d) => {
        setRounds(d.rounds ?? []);
        // Default to latest round
        if (d.rounds?.length > 0) setActiveRound(d.rounds.length - 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }

  if (rounds.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Brak danych UCL — przerwa lub nieznana faza.</p>;
  }

  const current = rounds[activeRound];

  return (
    <div className="space-y-4">
      {/* Round tabs */}
      {rounds.length > 1 && (
        <div className="flex gap-1 flex-wrap">
          {rounds.map((r, i) => (
            <button
              key={r.stage}
              onClick={() => setActiveRound(i)}
              className={cn(
                'px-3 py-1 text-xs rounded-full font-medium transition-colors',
                activeRound === i
                  ? 'bg-blue-600 text-white'
                  : 'text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {current && <RoundSection round={current} />}
    </div>
  );
}
