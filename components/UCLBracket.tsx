'use client';

import { useEffect, useState } from 'react';
import type { BracketRound, BracketMatch } from '@/lib/data-sources/ucl-bracket';
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
      'rounded-lg border overflow-hidden transition-all',
      isLive ? 'border-live border-red-500/60 shadow-[0_0_12px_oklch(0.62_0.22_25/0.2)]' : 'border-border/60',
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest',
        isLive ? 'bg-red-600 text-white' : isFinished ? 'bg-white/5 text-muted-foreground' : 'bg-white/3 text-muted-foreground/60'
      )}>
        {isLive ? (
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </span>
            LIVE {match.status === 'PAUSED' ? '— przerwa' : ''}
          </span>
        ) : isFinished ? (
          <span>Pełny czas</span>
        ) : (
          <span>{dateStr} · {timeStr}</span>
        )}
        <span className="opacity-60 text-[9px]">UCL</span>
      </div>

      {/* Teams + Score */}
      <div className="bg-card px-3 py-2.5 space-y-1.5">
        {[
          { team: match.homeTeam, crest: match.homeCrest, score: match.homeScore, win: homeWin },
          { team: match.awayTeam, crest: match.awayCrest, score: match.awayScore, win: awayWin },
        ].map((side, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {side.crest ? (
                <img src={side.crest} alt="" className="w-5 h-5 object-contain flex-shrink-0" loading="lazy" />
              ) : (
                <span className="w-5 h-5 rounded-full bg-white/10 flex-shrink-0" />
              )}
              <span className={cn(
                'text-[13px] truncate',
                side.win ? 'font-bold text-foreground' : 'text-muted-foreground'
              )}>
                {side.team}
              </span>
            </div>
            {hasScore && (
              <span className={cn(
                'score-display text-xl font-black tabular-nums w-7 text-right flex-shrink-0',
                isLive ? 'text-red-300' : side.win ? 'text-primary' : 'text-foreground/70'
              )}>
                {side.score}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Half-time */}
      {match.halfTime && (
        <div className="px-3 pb-2.5 pt-0 border-t border-border/20">
          <p className="text-[10px] text-muted-foreground/40 pt-1.5 tabular-nums">
            Przerwa: {match.halfTime}
          </p>
        </div>
      )}
    </div>
  );
}

export function UCLBracket() {
  const [rounds, setRounds] = useState<BracketRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [subtitle, setSubtitle] = useState('');

  useEffect(() => {
    fetch('/api/ucl-bracket')
      .then((r) => r.json())
      .then((d) => {
        const r: BracketRound[] = d.rounds ?? [];
        setRounds(r);
        setActiveIdx(d.defaultIdx ?? (r.length > 0 ? r.length - 1 : 0));
        setSubtitle(d.subtitle ?? '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
      </div>
    );
  }

  if (rounds.length === 0) {
    return (
      <div className="py-6 text-center space-y-1.5">
        <p className="text-[14px] text-muted-foreground">Przerwa w rozgrywkach Ligi Mistrzów</p>
        <p className="text-[12px] text-muted-foreground/40">Następna runda wkrótce — dane pojawią się automatycznie.</p>
      </div>
    );
  }

  const current = rounds[activeIdx];

  return (
    <div className="space-y-3">
      {/* Subtitle */}
      {subtitle && (
        <p className="text-[12px] text-muted-foreground/80 italic">{subtitle}</p>
      )}

      {/* Round selector */}
      {rounds.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          {rounds.map((r, i) => (
            <button
              key={r.stage}
              onClick={() => setActiveIdx(i)}
              className={cn(
                'px-3 py-1 text-[11px] font-bold uppercase tracking-wide rounded transition-all',
                activeIdx === i
                  ? 'bg-blue-600 text-white'
                  : 'border border-border/50 text-muted-foreground hover:text-foreground hover:border-blue-500/40'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {/* Matches grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {current.matches.map((m) => <MatchCard key={m.id} match={m} />)}
      </div>

      {current.matches.length === 0 && (
        <p className="text-[13px] text-muted-foreground py-3 text-center">Brak meczów w tej rundzie.</p>
      )}
    </div>
  );
}
