'use client';

import { useEffect, useState } from 'react';
import type { LeagueStandings, Scorer, LeagueInsights } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getLeague } from '@/config/leagues';
import { cn } from '@/lib/utils';

interface LeagueData {
  standings: LeagueStandings;
  scorers: Scorer[];
  insights: LeagueInsights;
}

function PositionBadge({ pos, total }: { pos: number; total: number }) {
  // UCL spots, UEL, relegation — color the badge
  if (pos <= 4) return <span className="w-5 text-center text-xs font-bold text-blue-400">{pos}</span>;
  if (pos <= 6) return <span className="w-5 text-center text-xs font-bold text-orange-400">{pos}</span>;
  if (pos > total - 3) return <span className="w-5 text-center text-xs font-bold text-red-400">{pos}</span>;
  return <span className="w-5 text-center text-xs text-muted-foreground">{pos}</span>;
}

function FormDots({ form }: { form?: string }) {
  if (!form) return null;
  const chars = form.replace(/,/g, '').slice(-5).split('');
  return (
    <div className="flex gap-0.5">
      {chars.map((c, i) => (
        <span
          key={i}
          className={cn('w-2 h-2 rounded-full', {
            'bg-green-500': c === 'W',
            'bg-yellow-500': c === 'D',
            'bg-red-500': c === 'L',
          })}
          title={c === 'W' ? 'Wygrana' : c === 'D' ? 'Remis' : 'Porażka'}
        />
      ))}
    </div>
  );
}

function InsightBar({ prob, color }: { prob: number; color: string }) {
  const colorClass = {
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  }[color] ?? 'bg-gray-500';
  return (
    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${prob}%` }} />
    </div>
  );
}

export function LeagueTable({ leagueCode }: { leagueCode: string }) {
  const [data, setData] = useState<LeagueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNerd, setShowNerd] = useState(false);

  useEffect(() => {
    fetch(`/api/standings/${leagueCode}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [leagueCode]);

  const league = getLeague(leagueCode);

  if (loading) {
    return <div className="space-y-1">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}</div>;
  }

  if (!data?.standings) {
    return <p className="text-xs text-muted-foreground py-3">Błąd ładowania tabeli {leagueCode}</p>;
  }

  const { standings, scorers, insights } = data;
  const table = standings.table.slice(0, 10); // top 10 in main view

  return (
    <div>
      {/* League header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{league?.flag}</span>
          <span className={`text-sm font-semibold ${league?.color ?? 'text-foreground'}`}>
            {standings.leagueName}
          </span>
        </div>
        <button
          onClick={() => setShowNerd(!showNerd)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showNerd ? 'Ukryj Nerd' : 'Tryb Nerd'}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="w-6 text-left pb-1">#</th>
              <th className="text-left pb-1 pl-1">Drużyna</th>
              <th className="text-center pb-1 w-6">M</th>
              <th className="text-center pb-1 w-6">W</th>
              <th className="text-center pb-1 w-6">R</th>
              <th className="text-center pb-1 w-6">P</th>
              <th className="text-center pb-1 w-8">GD</th>
              <th className="text-center pb-1 w-8 font-bold">Pkt</th>
              <th className="text-center pb-1 hidden sm:table-cell">Forma</th>
              {showNerd && <th className="text-center pb-1 hidden sm:table-cell">Scenariusz</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {table.map((row) => (
              <tr key={row.position} className="hover:bg-muted/30 transition-colors">
                <td className="py-1.5"><PositionBadge pos={row.position} total={standings.table.length} /></td>
                <td className="py-1.5 pl-1 max-w-[120px]">
                  <span className="truncate block text-foreground">{row.teamName}</span>
                </td>
                <td className="py-1.5 text-center text-muted-foreground">{row.played}</td>
                <td className="py-1.5 text-center text-green-400">{row.won}</td>
                <td className="py-1.5 text-center text-yellow-400">{row.draw}</td>
                <td className="py-1.5 text-center text-red-400">{row.lost}</td>
                <td className="py-1.5 text-center text-muted-foreground">
                  {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                </td>
                <td className="py-1.5 text-center font-bold text-foreground">{row.points}</td>
                <td className="py-1.5 text-center hidden sm:table-cell">
                  <FormDots form={row.form} />
                </td>
                {showNerd && (
                  <td className="py-1.5 text-center hidden sm:table-cell">
                    {insights.titleRace.find((t) => t.teamName === row.teamName) && (
                      <InsightBar
                        prob={insights.titleRace.find((t) => t.teamName === row.teamName)!.probability}
                        color={insights.titleRace.find((t) => t.teamName === row.teamName)!.color}
                      />
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top scorers mini */}
      {scorers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Strzelcy</p>
          <div className="space-y-1">
            {scorers.slice(0, 3).map((s) => (
              <div key={s.playerName} className="flex items-center justify-between text-xs">
                <span className="text-foreground">{s.playerName}</span>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-xs">{s.teamName}</span>
                  <Badge variant="secondary" className="text-xs h-4 px-1">{s.goals}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nerd mode: insights */}
      {showNerd && insights.titleRace.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Wyścig o tytuł (szacunek)</p>
          {insights.titleRace.map((ins) => (
            <div key={ins.teamName} className="flex items-center gap-2 text-xs">
              <span className="text-foreground w-28 truncate">{ins.teamName}</span>
              <InsightBar prob={ins.probability} color={ins.color} />
              <span className="text-muted-foreground">{ins.label}</span>
            </div>
          ))}
          <p className="text-xs text-muted-foreground/60 mt-1">
            * Szacunek bazuje na punktach, formie i meczu do rozegrania — nie Monte Carlo.
          </p>
        </div>
      )}
    </div>
  );
}
