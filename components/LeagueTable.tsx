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

// Zone boundaries per league
const ZONES: Record<string, { ucl: number; ucl_qual?: number; uel: number; uecl?: number; playoff?: number; rel: number }> = {
  PL:  { ucl: 4, uel: 6, uecl: 7, rel: 17 },
  PD:  { ucl: 4, uel: 6, uecl: 7, rel: 17 },
  SA:  { ucl: 4, uel: 6, uecl: 7, rel: 17 },
  BL1: { ucl: 4, uel: 5, uecl: 6, rel: 16, playoff: 15 },
  FL1: { ucl: 3, ucl_qual: 4, uel: 5, uecl: 6, rel: 16, playoff: 15 },
  CL:  { ucl: 8, uel: 12, rel: 99 },
};

function getZoneStyle(pos: number, leagueCode: string): { border: string; label: string } | null {
  const z = ZONES[leagueCode];
  if (!z) return null;
  if (pos <= z.ucl) return { border: 'border-l-2 border-l-blue-500', label: 'UCL' };
  if (z.ucl_qual && pos === z.ucl_qual) return { border: 'border-l-2 border-l-blue-400', label: 'UCL Kwal.' };
  if (pos <= z.uel) return { border: 'border-l-2 border-l-orange-400', label: 'UEL' };
  if (z.uecl && pos <= z.uecl) return { border: 'border-l-2 border-l-green-500', label: 'UECL' };
  if (z.playoff && pos >= z.playoff && pos < z.rel) return { border: 'border-l-2 border-l-yellow-500', label: 'Baraże' };
  if (pos > z.rel) return { border: 'border-l-2 border-l-red-500', label: 'Spadek' };
  return null;
}

function FormCell({ form }: { form?: string }) {
  if (!form) return <span className="text-muted-foreground/40">—</span>;
  const chars = form.replace(/,/g, '').slice(-5).split('');
  return (
    <div className="flex gap-0.5 justify-center">
      {chars.map((c, i) => (
        <span
          key={i}
          className={cn(
            'w-4 h-4 rounded-sm text-[9px] font-bold flex items-center justify-center',
            c === 'W' ? 'bg-green-600 text-white' : c === 'D' ? 'bg-yellow-600 text-white' : 'bg-red-700 text-white'
          )}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

function InsightBar({ prob, color }: { prob: number; color: string }) {
  const bg = { green: 'bg-green-500', amber: 'bg-amber-500', red: 'bg-red-500', blue: 'bg-blue-500' }[color] ?? 'bg-muted';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${bg}`} style={{ width: `${prob}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums">{prob}%</span>
    </div>
  );
}

const LEGEND = [
  { color: 'bg-blue-500', label: 'Liga Mistrzów' },
  { color: 'bg-orange-400', label: 'Liga Europy' },
  { color: 'bg-green-500', label: 'Liga Konferencji' },
  { color: 'bg-yellow-500', label: 'Baraże' },
  { color: 'bg-red-500', label: 'Spadek' },
];

export function LeagueTable({ leagueCode }: { leagueCode: string }) {
  const [data, setData] = useState<LeagueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNerd, setShowNerd] = useState(false);
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    fetch(`/api/standings/${leagueCode}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [leagueCode]);

  const league = getLeague(leagueCode);

  if (loading) {
    return <div className="space-y-1">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>;
  }

  if (!data?.standings) {
    return <p className="text-xs text-muted-foreground py-3">Błąd ładowania tabeli {leagueCode}</p>;
  }

  const { standings, scorers, insights } = data;
  const totalTeams = standings.table.length;
  const visibleCount = showFull ? totalTeams : Math.min(10, totalTeams);
  const table = standings.table.slice(0, visibleCount);

  return (
    <div className="space-y-3">
      {/* League header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{league?.flag}</span>
          <span className={`text-sm font-bold ${league?.color ?? 'text-foreground'}`}>
            {standings.leagueName}
          </span>
        </div>
        <button
          onClick={() => setShowNerd(!showNerd)}
          className={cn(
            'text-[11px] px-2 py-0.5 rounded border transition-colors',
            showNerd ? 'border-primary/60 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
          )}
        >
          NERD
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs min-w-[340px]">
          <thead>
            <tr className="text-[11px] text-muted-foreground/70 border-b border-border">
              <th className="w-7 text-left pb-1.5 pl-1">#</th>
              <th className="text-left pb-1.5">Drużyna</th>
              <th className="text-center pb-1.5 w-7 hidden sm:table-cell">M</th>
              <th className="text-center pb-1.5 w-5">W</th>
              <th className="text-center pb-1.5 w-5 hidden sm:table-cell">R</th>
              <th className="text-center pb-1.5 w-5 hidden sm:table-cell">P</th>
              <th className="text-center pb-1.5 w-9">GD</th>
              <th className="text-center pb-1.5 w-9 font-bold text-foreground/80">Pkt</th>
              <th className="text-center pb-1.5 hidden md:table-cell w-24">Forma</th>
              {showNerd && <th className="text-center pb-1.5 hidden lg:table-cell">Tytuł</th>}
            </tr>
          </thead>
          <tbody>
            {table.map((row, idx) => {
              const zone = getZoneStyle(row.position, leagueCode);
              const prevZone = idx > 0 ? getZoneStyle(table[idx - 1].position, leagueCode) : null;
              const zoneChanged = zone?.label !== prevZone?.label;
              return (
                <tr
                  key={row.position}
                  className={cn(
                    'hover:bg-muted/20 transition-colors',
                    zone?.border,
                    zoneChanged && idx > 0 ? 'border-t border-border/60' : ''
                  )}
                >
                  <td className="py-1.5 pl-1">
                    <span className="w-5 inline-block text-center text-[11px] text-muted-foreground font-mono">
                      {row.position}
                    </span>
                  </td>
                  <td className="py-1.5 max-w-[110px]">
                    <span className="truncate block text-[13px] text-foreground font-medium leading-tight">
                      {row.teamName}
                    </span>
                  </td>
                  <td className="py-1.5 text-center text-muted-foreground hidden sm:table-cell">{row.played}</td>
                  <td className="py-1.5 text-center text-green-400 font-medium">{row.won}</td>
                  <td className="py-1.5 text-center text-muted-foreground hidden sm:table-cell">{row.draw}</td>
                  <td className="py-1.5 text-center text-red-400/80 hidden sm:table-cell">{row.lost}</td>
                  <td className="py-1.5 text-center text-muted-foreground text-[11px]">
                    {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                  </td>
                  <td className="py-1.5 text-center font-bold text-[14px] text-foreground">{row.points}</td>
                  <td className="py-1.5 text-center hidden md:table-cell">
                    <FormCell form={row.form} />
                  </td>
                  {showNerd && (
                    <td className="py-1.5 text-center hidden lg:table-cell px-2">
                      {insights.titleRace.find((t) => t.teamName === row.teamName) && (
                        <InsightBar
                          prob={insights.titleRace.find((t) => t.teamName === row.teamName)!.probability}
                          color={insights.titleRace.find((t) => t.teamName === row.teamName)!.color}
                        />
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Show more / less */}
      {totalTeams > 10 && (
        <button
          onClick={() => setShowFull(!showFull)}
          className="w-full text-[11px] text-muted-foreground hover:text-foreground py-1 border border-dashed border-border/50 hover:border-border rounded-lg transition-colors"
        >
          {showFull ? `Zwiń ↑` : `Pokaż wszystkie ${totalTeams} drużyn ↓`}
        </button>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
        {LEGEND.filter((l) => {
          const z = ZONES[leagueCode];
          if (!z) return false;
          if (l.label === 'Liga Konferencji' && !z.uecl) return false;
          if (l.label === 'Baraże' && !z.playoff) return false;
          return true;
        }).map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-sm ${l.color}`} />
            <span className="text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Top scorers */}
      {scorers.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-[11px] text-muted-foreground mb-1.5 font-semibold uppercase tracking-wide">Top Strzelcy</p>
          <div className="space-y-1">
            {scorers.slice(0, 3).map((s, i) => (
              <div key={s.playerName} className="flex items-center gap-2 text-xs">
                <span className="text-[11px] text-muted-foreground/60 w-4 tabular-nums">{i + 1}.</span>
                <span className="text-foreground flex-1">{s.playerName}</span>
                <span className="text-muted-foreground text-[11px] truncate max-w-[70px]">{s.teamName}</span>
                <Badge variant="secondary" className="text-[11px] h-4 px-1.5 font-bold">{s.goals}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nerd: scenario insights */}
      {showNerd && insights.titleRace.length > 0 && (
        <div className="pt-2 border-t border-border/50 space-y-3">
          {insights.titleRace.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Wyścig o tytuł</p>
              {insights.titleRace.map((ins) => (
                <div key={ins.teamName} className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-foreground w-28 truncate">{ins.teamName}</span>
                  <InsightBar prob={ins.probability} color={ins.color} />
                </div>
              ))}
            </div>
          )}
          {insights.relegationZone.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Walka o utrzymanie</p>
              {insights.relegationZone.slice(0, 4).map((ins) => (
                <div key={ins.teamName} className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-foreground w-28 truncate">{ins.teamName}</span>
                  <InsightBar prob={ins.probability} color={ins.color} />
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground/50">
            * Szacunek bazuje na punktach i formie — nie symulacja Monte Carlo.
          </p>
        </div>
      )}
    </div>
  );
}
