'use client';

import { useEffect, useState } from 'react';
import type { BracketRound, BracketTie } from '@/lib/data-sources/ucl-bracket';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/* ─── Single Tie Row ─────────────────────────────────────────────── */
function TieRow({ tie }: { tie: BracketTie }) {
  const decided = !!tie.winner;
  const hasAnyScore = tie.leg1?.homeScore !== null || (tie.leg2 && tie.leg2.homeScore !== null);

  return (
    <div className={cn(
      'rounded-lg border overflow-hidden',
      tie.isLive ? 'border-red-500/60 shadow-[0_0_8px_oklch(0.62_0.22_25/0.15)]' : 'border-border/40',
    )}>
      {/* Team rows */}
      {[
        { team: tie.team1, crest: tie.crest1, agg: tie.agg1, isWinner: tie.winner === tie.team1 },
        { team: tie.team2, crest: tie.crest2, agg: tie.agg2, isWinner: tie.winner === tie.team2 },
      ].map((side, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5',
            i === 0 && 'border-b border-border/20',
            side.isWinner && 'bg-blue-500/10',
          )}
        >
          {side.crest ? (
            <img src={side.crest} alt={side.team} className="w-4 h-4 object-contain flex-shrink-0" loading="lazy" />
          ) : (
            <span className="w-4 h-4 rounded-full bg-white/10 flex-shrink-0" />
          )}
          <span className={cn(
            'text-[13px] flex-1 truncate',
            side.isWinner ? 'font-bold text-foreground' : decided ? 'text-muted-foreground' : 'text-foreground/80',
          )}>
            {side.team}
          </span>
          {hasAnyScore && (
            <span className={cn(
              'score-display text-[15px] font-black tabular-nums',
              tie.isLive ? 'text-red-300' : side.isWinner ? 'text-primary' : 'text-foreground/60',
            )}>
              {side.agg}
            </span>
          )}
        </div>
      ))}

      {/* Leg scores */}
      {hasAnyScore && (
        <div className="px-3 py-1 bg-white/[0.02] border-t border-border/20 flex items-center gap-3 text-[10px] text-muted-foreground/50">
          {tie.leg1 && tie.leg1.homeScore !== null && (
            <span>
              Mecz 1: <span className="text-foreground/60 tabular-nums">{tie.leg1.homeScore}–{tie.leg1.awayScore}</span>
            </span>
          )}
          {tie.leg2 && tie.leg2.homeScore !== null && (
            <span>
              Mecz 2: <span className="text-foreground/60 tabular-nums">{tie.leg2.homeScore}–{tie.leg2.awayScore}</span>
            </span>
          )}
          {tie.isLive && (
            <span className="flex items-center gap-1 text-red-400 font-bold uppercase tracking-wider">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400/60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-400" />
              </span>
              Live
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Bracket Column ─────────────────────────────────────────────── */
function BracketColumn({ round, isActive }: { round: BracketRound; isActive: boolean }) {
  if (!isActive) return null;

  return (
    <div className="space-y-2">
      {round.ties.length > 0 ? (
        round.ties.map((tie, i) => <TieRow key={i} tie={tie} />)
      ) : (
        <p className="text-[12px] text-muted-foreground/40 text-center py-3">Brak meczów w tej rundzie</p>
      )}
    </div>
  );
}

/* ─── Main UCL Bracket ───────────────────────────────────────────── */
export function UCLBracket() {
  const [rounds, setRounds] = useState<BracketRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [subtitle, setSubtitle] = useState('');

  useEffect(() => {
    fetch('/api/ucl-bracket')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then((d) => {
        const r: BracketRound[] = d.rounds ?? [];
        setRounds(r);
        setActiveIdx(d.defaultIdx ?? (r.length > 0 ? r.length - 1 : 0));
        setSubtitle(d.subtitle ?? '');
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  if (error || rounds.length === 0) {
    return (
      <div className="py-6 text-center space-y-1.5">
        <p className="text-[14px] text-muted-foreground">
          {error ? 'Nie udalo sie zaladowac drabinki LM' : 'Przerwa w rozgrywkach Ligi Mistrzow'}
        </p>
        <p className="text-[12px] text-muted-foreground/40">
          {error ? 'Sprawdz za chwile.' : 'Nastepna runda wkrotce — dane pojawia sie automatycznie.'}
        </p>
      </div>
    );
  }

  const current = rounds[activeIdx];

  return (
    <div className="space-y-3">
      {/* Round tabs — styled as bracket progression */}
      {rounds.length > 1 && (
        <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
          {rounds.map((r, i) => {
            const hasLive = r.ties.some((t) => t.isLive);
            const allDone = r.ties.length > 0 && r.ties.every((t) => t.winner);
            return (
              <button
                key={r.stage}
                onClick={() => setActiveIdx(i)}
                className={cn(
                  'relative px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded-lg transition-all whitespace-nowrap cursor-pointer',
                  activeIdx === i
                    ? 'bg-blue-600 text-white'
                    : hasLive
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/5',
                  allDone && activeIdx !== i && 'text-muted-foreground/40',
                )}
              >
                {r.label}
                {hasLive && activeIdx !== i && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400/60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
                  </span>
                )}
              </button>
            );
          })}
          {/* Bracket progression arrows */}
          {rounds.length > 1 && (
            <div className="flex-shrink-0 text-[10px] text-muted-foreground/20 px-1 hidden sm:block">
              → Finał
            </div>
          )}
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p className="text-[11px] text-muted-foreground/60 italic">{subtitle}</p>
      )}

      {/* Ties */}
      <BracketColumn round={current} isActive={true} />
    </div>
  );
}
