'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { MatchDetail, MatchGoal, H2HMatch } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function isLive(status: string) {
  return status === 'LIVE' || status === 'IN_PLAY' || status === 'PAUSED';
}

/* ─── Score Header — hero sekcja z wynikiem ───────────────────────── */
function ScoreHeader({ match }: { match: MatchDetail }) {
  const live = isLive(match.status);
  const finished = match.status === 'FINISHED';
  const scheduled = match.status === 'SCHEDULED' || match.status === 'TIMED';
  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const time = new Date(match.utcDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const date = new Date(match.utcDate).toLocaleDateString('pl-PL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className={cn(
      'rounded-xl overflow-hidden',
      live ? 'border border-destructive/40 border-live' : 'border border-border'
    )}>
      {/* Competition bar */}
      <div className={cn(
        'flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest',
        live ? 'bg-destructive text-white' : 'bg-white/[0.03] text-muted-foreground'
      )}>
        {match.competitionEmblem && (
          <img src={match.competitionEmblem} alt="" className="w-4 h-4" loading="lazy" />
        )}
        {match.competition}
        {match.matchday && <span className="text-muted-foreground">· Kolejka {match.matchday}</span>}
      </div>

      {/* Score area */}
      <div className={cn(
        'px-6 py-8',
        live ? 'bg-gradient-to-b from-destructive/[0.06] to-card' : 'bg-card'
      )}>
        <div className="flex items-center justify-center gap-6 sm:gap-10">
          {/* Home team */}
          <a href={`/team/${match.homeTeamId}`} className="flex flex-col items-center gap-2 min-w-0 flex-1 group">
            {match.homeCrest && (
              <img src={match.homeCrest} alt={match.homeTeam} className="w-14 h-14 sm:w-16 sm:h-16 object-contain group-hover:scale-105 transition-transform" loading="lazy" />
            )}
            <span className={cn(
              'text-[14px] sm:text-[16px] font-bold text-center leading-tight group-hover:text-primary transition-colors',
              hasScore && match.homeScore! > match.awayScore! ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {match.homeTeam}
            </span>
          </a>

          {/* Score / Time */}
          <div className="flex flex-col items-center gap-1">
            {hasScore ? (
              <>
                <div className={cn(
                  'score-display text-[40px] sm:text-[48px] font-black leading-none',
                  live ? 'text-destructive' : 'text-foreground'
                )}>
                  {match.homeScore}&thinsp;–&thinsp;{match.awayScore}
                </div>
                {match.halfTimeHome !== null && match.halfTimeAway !== null && (
                  <span className="text-[11px] score-display text-muted-foreground">
                    Połowa: {match.halfTimeHome}–{match.halfTimeAway}
                  </span>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-0.5">
                <span className="score-display text-[28px] font-black text-muted-foreground">vs</span>
              </div>
            )}

            {/* Status badge */}
            {live && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-destructive/90 rounded-full text-[10px] font-black text-white tracking-wide mt-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                {match.status === 'PAUSED' ? 'PRZERWA' : match.minute ? `${match.minute}'` : 'LIVE'}
              </span>
            )}
            {finished && (
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                Zakończony
              </span>
            )}
            {scheduled && (
              <span className="score-display text-[20px] font-bold text-primary mt-1">{time}</span>
            )}
          </div>

          {/* Away team */}
          <a href={`/team/${match.awayTeamId}`} className="flex flex-col items-center gap-2 min-w-0 flex-1 group">
            {match.awayCrest && (
              <img src={match.awayCrest} alt={match.awayTeam} className="w-14 h-14 sm:w-16 sm:h-16 object-contain group-hover:scale-105 transition-transform" loading="lazy" />
            )}
            <span className={cn(
              'text-[14px] sm:text-[16px] font-bold text-center leading-tight group-hover:text-primary transition-colors',
              hasScore && match.awayScore! > match.homeScore! ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {match.awayTeam}
            </span>
          </a>
        </div>

        {/* Date */}
        <p className="text-center text-[11px] text-muted-foreground mt-4 capitalize">{date}</p>
      </div>
    </div>
  );
}

/* ─── Events Timeline — gole z ikonkami ──────────────────────────── */
function EventsTimeline({ goals, homeTeamId }: { goals: MatchGoal[]; homeTeamId: number }) {
  if (goals.length === 0) return null;

  const sorted = [...goals].sort((a, b) => a.minute - b.minute);

  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="font-display text-[13px] text-primary mb-3">Przebieg meczu</h3>
        <div className="space-y-0">
          {sorted.map((goal, i) => {
            const isHome = goal.teamId === homeTeamId;
            return (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-3 py-2 border-b border-border last:border-0',
                  'animate-fade-in'
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Minuta */}
                <span className="score-display text-[12px] font-bold text-muted-foreground w-8 text-right flex-shrink-0">
                  {goal.minute}&apos;
                </span>

                {/* Ikona */}
                <span className="text-[16px] flex-shrink-0">
                  {goal.type === 'OWN_GOAL' ? '🔴' : goal.type === 'PENALTY' ? '🎯' : '⚽'}
                </span>

                {/* Strzelec + asystent */}
                <div className={cn('flex-1 min-w-0', isHome ? 'text-left' : 'text-left')}>
                  <span className="text-[13px] font-bold text-foreground">{goal.scorer}</span>
                  {goal.type === 'PENALTY' && (
                    <span className="text-[10px] text-amber ml-1">(karny)</span>
                  )}
                  {goal.type === 'OWN_GOAL' && (
                    <span className="text-[10px] text-destructive ml-1">(samobojczy)</span>
                  )}
                  {goal.assist && (
                    <span className="text-[11px] text-muted-foreground ml-1.5">
                      ← {goal.assist}
                    </span>
                  )}
                </div>

                {/* Strona boiska */}
                <span className={cn(
                  'text-[9px] font-bold uppercase tracking-widest flex-shrink-0',
                  isHome ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {isHome ? 'DOM' : 'WYJ'}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── H2H — ostatnie spotkania ───────────────────────────────────── */
function H2HSection({ h2h, homeTeam, awayTeam }: { h2h: MatchDetail['head2head']; homeTeam: string; awayTeam: string }) {
  if (!h2h || h2h.lastMatches.length === 0) return null;

  const total = h2h.homeWins + h2h.awayWins + h2h.draws;
  const homePercent = total > 0 ? Math.round((h2h.homeWins / total) * 100) : 0;
  const drawPercent = total > 0 ? Math.round((h2h.draws / total) * 100) : 0;
  const awayPercent = total > 0 ? 100 - homePercent - drawPercent : 0;

  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="font-display text-[13px] text-primary mb-3">
          Ostatnie spotkania ({h2h.numberOfMatches})
        </h3>

        {/* H2H stats bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
            <span className="text-primary">{homeTeam} {h2h.homeWins}</span>
            <span className="text-muted-foreground">{h2h.draws} remisy</span>
            <span className="text-foreground">{awayTeam} {h2h.awayWins}</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
            <div className="bg-primary transition-all" style={{ width: `${homePercent}%` }} />
            <div className="bg-muted-foreground transition-all" style={{ width: `${drawPercent}%` }} />
            <div className="bg-foreground transition-all" style={{ width: `${awayPercent}%` }} />
          </div>
        </div>

        {/* Ostatnie mecze */}
        <div className="space-y-0">
          {h2h.lastMatches.map((m: H2HMatch, i: number) => {
            const date = new Date(m.date).toLocaleDateString('pl-PL', {
              day: 'numeric', month: 'short', year: 'numeric'
            });
            return (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border last:border-0 text-[12px]">
                <span className="text-muted-foreground w-20 flex-shrink-0 text-[10px]">{date}</span>
                <span className="flex-1 text-right truncate text-foreground">{m.homeTeam}</span>
                <span className="score-display font-bold text-foreground min-w-[36px] text-center">
                  {m.homeScore}–{m.awayScore}
                </span>
                <span className="flex-1 truncate text-foreground">{m.awayTeam}</span>
                <span className="text-[9px] text-muted-foreground w-12 text-right flex-shrink-0 truncate">
                  {m.competition}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Match Info — sedzia, stadion, data ─────────────────────────── */
function MatchInfo({ match }: { match: MatchDetail }) {
  const mainRef = match.referees.find((r) => r.type === 'REFEREE');

  const infoPairs = [
    match.venue && ['Stadion', match.venue],
    mainRef && ['Sędzia', `${mainRef.name}${mainRef.nationality ? ` (${mainRef.nationality})` : ''}`],
    match.matchday && ['Kolejka', `${match.matchday}`],
    match.competitionCode && ['Rozgrywki', match.competition],
  ].filter(Boolean) as [string, string][];

  if (infoPairs.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="font-display text-[13px] text-primary mb-3">Informacje</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {infoPairs.map(([label, value]) => (
            <div key={label}>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">{label}</span>
              <span className="text-[13px] text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Main MatchDetailView ───────────────────────────────────────── */
export function MatchDetailView({ matchId, initialMatch = null }: { matchId: string; initialMatch?: MatchDetail | null }) {
  const [match, setMatch] = useState<MatchDetail | null>(initialMatch);
  const [loading, setLoading] = useState(!initialMatch);
  const [error, setError] = useState(false);
  const matchRef = useRef<MatchDetail | null>(initialMatch);

  const fetchMatch = useCallback(async () => {
    try {
      const res = await fetch(`/api/match/${matchId}`);
      if (!res.ok) {
        if (!matchRef.current) setError(true);
        return;
      }
      const data = await res.json();
      setMatch(data);
      matchRef.current = data;
    } catch {
      if (!matchRef.current) setError(true);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    // If we have SSR data, skip initial fetch — just poll for live
    if (initialMatch) {
      const id = setInterval(() => {
        if (matchRef.current && isLive(matchRef.current.status)) {
          fetchMatch();
        }
      }, 60_000);
      return () => clearInterval(id);
    }

    fetchMatch();
    const id = setInterval(() => {
      if (matchRef.current && isLive(matchRef.current.status)) {
        fetchMatch();
      }
    }, 60_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="py-16 text-center">
        <p className="text-[16px] font-display text-muted-foreground">Nie znaleziono meczu</p>
        <a href="/" className="text-[13px] text-primary hover:underline mt-2 inline-block">
          ← Wstecz do strony głównej
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ScoreHeader match={match} />
      <EventsTimeline goals={match.goals} homeTeamId={match.homeTeamId} />
      <H2HSection h2h={match.head2head} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
      <MatchInfo match={match} />

      {/* Link do powrotu */}
      <div className="text-center py-4">
        <a href="/" className="text-[12px] text-muted-foreground hover:text-primary transition-colors">
          ← Wstecz do strony głównej
        </a>
      </div>
    </div>
  );
}
