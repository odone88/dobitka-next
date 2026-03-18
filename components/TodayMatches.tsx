'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Match } from '@/types';
import { getLeague } from '@/config/leagues';
import { getEditorialLine } from '@/lib/match-comments';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/* ─── League color accents (left border) ─────────────────────────── */
const LEAGUE_ACCENT: Record<string, string> = {
  CL:  'border-l-blue-500',
  PL:  'border-l-purple-400',
  PD:  'border-l-red-400',
  SA:  'border-l-green-400',
  BL1: 'border-l-yellow-400',
  FL1: 'border-l-sky-400',
};

/* ─── League sort priority ───────────────────────────────────────── */
const LEAGUE_PRIORITY: Record<string, number> = {
  CL: 0, PL: 1, PD: 2, SA: 3, BL1: 4, FL1: 5,
};

function isLive(m: Match) {
  return m.status === 'LIVE' || m.status === 'IN_PLAY' || m.status === 'PAUSED';
}

/* ─── Day Picker ─────────────────────────────────────────────────── */
function DayPicker({ selected, onChange }: { selected: string; onChange: (d: string) => void }) {
  const days = [-2, -1, 0, 1, 2].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      date: d.toISOString().slice(0, 10),
      label: offset === 0 ? 'Dziś' :
             offset === -1 ? 'Wczoraj' :
             offset === 1 ? 'Jutro' :
             d.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric' }),
      isToday: offset === 0,
    };
  });

  return (
    <div className="flex gap-1 justify-center">
      {days.map((d) => (
        <button
          key={d.date}
          onClick={() => onChange(d.date)}
          className={cn(
            'px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer',
            selected === d.date
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/5',
            d.isToday && selected !== d.date && 'text-primary/60'
          )}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Live Badge ─────────────────────────────────────────────────── */
function LiveBadge({ minute }: { minute?: number | null }) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-600/90
                     rounded text-[9px] font-black text-white uppercase tracking-wide">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
      </span>
      {minute ? `${minute}'` : 'LIVE'}
    </span>
  );
}

/* ─── Single match row ───────────────────────────────────────────── */
function MatchRow({ match, style }: { match: Match; style?: React.CSSProperties }) {
  const live = isLive(match);
  const finished = match.status === 'FINISHED';
  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const homeWin = hasScore && match.homeScore! > match.awayScore!;
  const awayWin = hasScore && match.awayScore! > match.homeScore!;
  const time = new Date(match.utcDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div
        onClick={() => finished && setExpanded(!expanded)}
        className={cn(
          'flex items-center px-3 py-2.5 border-b border-border/15 border-l-2 transition-colors',
          LEAGUE_ACCENT[match.competitionCode] ?? 'border-l-border/30',
          live && 'bg-red-950/15',
          finished && 'cursor-pointer hover:bg-white/[0.02]',
          !finished && !live && 'hover:bg-white/[0.01]'
        )}
        style={style}
      >
        {/* Time / Status column */}
        <div className="w-12 flex-shrink-0 text-center">
          {live ? (
            <LiveBadge minute={match.minute} />
          ) : finished ? (
            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">Kon.</span>
          ) : (
            <span className="text-[11px] score-display text-muted-foreground/60">{time}</span>
          )}
        </div>

        {/* Teams + Score — 3-column grid */}
        <div className="flex-1 grid grid-cols-[1fr_auto_1fr] gap-x-3 items-center min-w-0">
          <span className={cn(
            'text-[13px] text-right truncate',
            homeWin ? 'font-bold text-foreground' : finished ? 'text-foreground/60' : 'text-foreground/80'
          )}>
            {match.homeTeam}
          </span>

          <span className={cn(
            'score-display text-[15px] font-black min-w-[44px] text-center',
            live ? 'text-red-300' : finished ? 'text-foreground' : 'text-muted-foreground/30'
          )}>
            {hasScore ? `${match.homeScore} – ${match.awayScore}` : '–'}
          </span>

          <span className={cn(
            'text-[13px] truncate',
            awayWin ? 'font-bold text-foreground' : finished ? 'text-foreground/60' : 'text-foreground/80'
          )}>
            {match.awayTeam}
          </span>
        </div>

        {/* Expand indicator for finished */}
        {finished && (
          <span className={cn(
            'text-[10px] text-muted-foreground/30 ml-2 transition-transform flex-shrink-0',
            expanded && 'rotate-180'
          )}>
            ▾
          </span>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && finished && (
        <div className="px-4 py-2.5 bg-white/[0.015] border-b border-border/15
                        text-[12px] text-muted-foreground/70 italic
                        animate-[fadeIn_200ms_ease-out]">
          {getEditorialLine(match.homeTeam, match.awayTeam, match.homeScore, match.awayScore, match.status, match.utcDate, match.id)}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export function TodayMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const prevScoresRef = useRef<Map<number, string>>(new Map());

  const fetchData = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/live?date=${date}`);
      if (!res.ok) return;
      const d = await res.json();
      setMatches(d.today ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData(selectedDate);
    const isToday = selectedDate === new Date().toISOString().slice(0, 10);
    if (isToday) {
      const id = setInterval(() => fetchData(selectedDate), 60000);
      return () => clearInterval(id);
    }
  }, [selectedDate, fetchData]);

  function handleDateChange(date: string) {
    setSelectedDate(date);
  }

  // Group by league, sorted by priority
  const grouped = new Map<string, Match[]>();
  for (const m of matches) {
    const code = m.competitionCode;
    if (!grouped.has(code)) grouped.set(code, []);
    grouped.get(code)!.push(m);
  }

  // Sort leagues by priority, then by name
  const sortedLeagues = [...grouped.entries()].sort(([a], [b]) => {
    const pa = LEAGUE_PRIORITY[a] ?? 99;
    const pb = LEAGUE_PRIORITY[b] ?? 99;
    return pa - pb;
  });

  // Sort matches within each league: live first, then by time
  for (const [, ms] of sortedLeagues) {
    ms.sort((a, b) => {
      if (isLive(a) && !isLive(b)) return -1;
      if (!isLive(a) && isLive(b)) return 1;
      return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
    });
  }

  const liveCount = matches.filter(isLive).length;
  const finishedCount = matches.filter((m) => m.status === 'FINISHED').length;
  const scheduledCount = matches.filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED').length;

  if (loading) {
    return (
      <div className="space-y-2">
        <DayPicker selected={selectedDate} onChange={handleDateChange} />
        <div className="space-y-1">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DayPicker selected={selectedDate} onChange={handleDateChange} />

      {/* Stats bar */}
      {matches.length > 0 && (
        <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
          {liveCount > 0 && (
            <span className="text-red-400/80">{liveCount} live</span>
          )}
          {finishedCount > 0 && (
            <span>{finishedCount} zakończ.</span>
          )}
          {scheduledCount > 0 && (
            <span>{scheduledCount} zaplan.</span>
          )}
          <span>{matches.length} meczów</span>
        </div>
      )}

      {/* Match list grouped by league */}
      {sortedLeagues.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-[14px] text-muted-foreground/60">Brak meczów na ten dzień.</p>
          <p className="text-[11px] text-muted-foreground/30 mt-1">Sprawdź inny termin.</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-border/40 card-elevated">
          {sortedLeagues.map(([code, ms], leagueIdx) => {
            const league = getLeague(code);
            const hasLive = ms.some(isLive);
            return (
              <div key={code}>
                {/* League header */}
                <div className={cn(
                  'flex items-center gap-2 px-3 py-2 border-b border-border/20',
                  hasLive ? 'bg-red-950/20' : 'bg-white/[0.025]',
                  leagueIdx > 0 && 'border-t border-border/30'
                )}>
                  <span className="text-[14px] leading-none">{league?.flag ?? '⚽'}</span>
                  <span className={cn(
                    'text-[11px] font-black uppercase tracking-widest',
                    league?.color ?? 'text-muted-foreground/70'
                  )}>
                    {league?.name ?? code}
                  </span>
                  <span className="text-[10px] text-muted-foreground/30 ml-auto tabular-nums">
                    {ms.length}
                  </span>
                </div>

                {/* Match rows */}
                {ms.map((m, i) => (
                  <MatchRow
                    key={m.id}
                    match={m}
                    style={{ animationDelay: `${i * 30}ms` }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
