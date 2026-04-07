'use client';

import { useEffect, useState } from 'react';
import type { Match } from '@/types';
import { getLeague } from '@/config/leagues';
import { cn } from '@/lib/utils';
import { getEditorialLine } from '@/lib/match-comments';

const LEAGUE_PRIORITY: Record<string, number> = {
  CL: 0, ELC: 1, PPL: 2, PL: 3, PD: 4, SA: 5, BL1: 6, FL1: 7,
};

function isWeekendRecap(): boolean {
  const day = new Date().getDay(); // 0=Sun, 1=Mon, 2=Tue
  return day === 1 || day === 2;
}

function getWeekendDates(): string[] {
  const now = new Date();
  const day = now.getDay();
  const dates: string[] = [];

  // Find last Saturday and Sunday
  const daysToSat = day === 0 ? 1 : day === 1 ? 2 : day === 2 ? 3 : 0;
  const daysToSun = daysToSat - 1;

  if (daysToSat > 0) {
    const sat = new Date(now);
    sat.setDate(now.getDate() - daysToSat);
    dates.push(sat.toISOString().slice(0, 10));
  }
  if (daysToSun > 0) {
    const sun = new Date(now);
    sun.setDate(now.getDate() - daysToSun);
    dates.push(sun.toISOString().slice(0, 10));
  }

  return dates;
}

interface TopResult extends Match {
  totalGoals: number;
}

export function WeekendResults() {
  const [results, setResults] = useState<TopResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isWeekendRecap()) {
      setLoading(false);
      return;
    }

    const dates = getWeekendDates();
    Promise.allSettled(
      dates.map((d) => fetch(`/api/live?date=${d}`).then((r) => r.json()))
    ).then((responses) => {
      const allMatches: Match[] = [];
      for (const r of responses) {
        if (r.status === 'fulfilled' && r.value?.today) {
          allMatches.push(...r.value.today);
        }
      }

      // Filter finished matches from top leagues, sort by entertainment value
      const topLeagues = new Set(['PPL', 'PL', 'PD', 'SA', 'BL1', 'FL1', 'CL', 'ELC']);
      const finished = allMatches
        .filter((m) => m.status === 'FINISHED' && topLeagues.has(m.competitionCode))
        .filter((m) => m.homeScore !== null && m.awayScore !== null)
        .map((m) => ({
          ...m,
          totalGoals: (m.homeScore ?? 0) + (m.awayScore ?? 0),
        }))
        .sort((a, b) => {
          // Prioritize: high-goal games, then league priority
          const goalDiff = b.totalGoals - a.totalGoals;
          if (goalDiff !== 0) return goalDiff;
          return (LEAGUE_PRIORITY[a.competitionCode] ?? 99) - (LEAGUE_PRIORITY[b.competitionCode] ?? 99);
        })
        .slice(0, 6);

      setResults(finished);
      setLoading(false);
    });
  }, []);

  if (loading || results.length === 0) return null;

  return (
    <section className="scroll-mt-16">
      <div className="rounded-2xl border border-border bg-card overflow-hidden card-elevated">
        <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/10 to-transparent text-[11px] font-black uppercase tracking-widest text-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          Top weekendu
        </div>

        <div className="p-4 space-y-1">
          {results.map((m) => {
            const homeWin = m.homeScore! > m.awayScore!;
            const awayWin = m.awayScore! > m.homeScore!;
            const league = getLeague(m.competitionCode);
            return (
              <a
                key={m.id}
                href={`/match/${m.id}`}
                className="group flex items-center gap-3 hover:bg-accent/50 rounded-xl px-3 py-2 -mx-1 transition-all"
              >
                <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
                  <span className={cn('text-[13px] truncate', homeWin ? 'font-bold text-foreground' : 'text-muted-foreground')}>
                    {m.homeTeam}
                  </span>
                  {m.homeCrest && <img src={m.homeCrest} alt="" className="w-5 h-5 object-contain flex-shrink-0" loading="lazy" />}
                </div>
                <span className="score-display text-[18px] font-black text-foreground w-[50px] text-center">
                  {m.homeScore}<span className="text-muted-foreground text-[12px]">:</span>{m.awayScore}
                </span>
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  {m.awayCrest && <img src={m.awayCrest} alt="" className="w-5 h-5 object-contain flex-shrink-0" loading="lazy" />}
                  <span className={cn('text-[13px] truncate', awayWin ? 'font-bold text-foreground' : 'text-muted-foreground')}>
                    {m.awayTeam}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase flex-shrink-0 hidden sm:block">{league?.shortName ?? m.competitionCode}</span>
              </a>
            );
          })}
        </div>

        {/* Editorial line */}
        {results.length > 0 && (
          <p className="px-5 pb-3 text-[11px] text-muted-foreground italic">
            {getEditorialLine(
              results[0].homeTeam, results[0].awayTeam,
              results[0].homeScore, results[0].awayScore,
              results[0].status, results[0].utcDate, results[0].id
            )}
          </p>
        )}
      </div>
    </section>
  );
}
