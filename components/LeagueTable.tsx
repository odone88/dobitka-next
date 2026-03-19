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

const ZONES: Record<string, { ucl: number; ucl_q?: number; uel: number; uecl?: number; playoff?: number; rel: number }> = {
  PL:  { ucl: 4,              uel: 6,  uecl: 7,  rel: 18 },
  PD:  { ucl: 4,              uel: 6,  uecl: 7,  rel: 18 },
  SA:  { ucl: 4,              uel: 6,  uecl: 7,  rel: 18 },
  BL1: { ucl: 4,              uel: 5,  uecl: 6,  playoff: 16, rel: 17 },
  FL1: { ucl: 3, ucl_q: 4,   uel: 5,  uecl: 6,  playoff: 16, rel: 17 },
  CL:  { ucl: 8,              uel: 16, rel: 99 },
};

type ZoneType = 'ucl' | 'ucl_q' | 'uel' | 'uecl' | 'playoff' | 'rel' | 'safe';

function getZone(pos: number, code: string): ZoneType {
  const z = ZONES[code];
  if (!z) return 'safe';
  if (pos > z.rel) return 'rel';
  if (z.playoff && pos >= z.playoff) return 'playoff';
  if (pos <= z.ucl) return 'ucl';
  if (z.ucl_q && pos === z.ucl_q) return 'ucl_q';
  if (pos <= z.uel) return 'uel';
  if (z.uecl && pos <= z.uecl) return 'uecl';
  return 'safe';
}

const ZONE_BORDER: Record<ZoneType, string> = {
  ucl:     'border-l-2 border-l-blue-500',
  ucl_q:   'border-l-2 border-l-blue-400',
  uel:     'border-l-2 border-l-orange-400',
  uecl:    'border-l-2 border-l-emerald-500',
  playoff: 'border-l-2 border-l-yellow-400',
  rel:     'border-l-2 border-l-red-500',
  safe:    'border-l-2 border-l-transparent',
};

function FormCell({ form }: { form?: string }) {
  if (!form) return null;
  const chars = form.replace(/,/g, '').slice(-5).split('');
  return (
    <div className="flex gap-0.5 items-center justify-center">
      {chars.map((c, i) => (
        <span key={i} className={cn(
          'inline-flex items-center justify-center w-4 h-4 rounded-[3px] text-[9px] font-black',
          c === 'W' ? 'bg-emerald-600 text-white' : c === 'D' ? 'bg-yellow-600 text-white' : 'bg-red-700 text-white'
        )}>
          {c}
        </span>
      ))}
    </div>
  );
}

const LEGEND_ITEMS: { zone: ZoneType; label: string; color: string }[] = [
  { zone: 'ucl',     label: 'Liga Mistrzów',     color: 'bg-blue-500' },
  { zone: 'uel',     label: 'Liga Europy',        color: 'bg-orange-400' },
  { zone: 'uecl',    label: 'Liga Konferencji',   color: 'bg-emerald-500' },
  { zone: 'playoff', label: 'Baraże',             color: 'bg-yellow-400' },
  { zone: 'rel',     label: 'Spadek',             color: 'bg-red-500' },
];

export function LeagueTable({ leagueCode, delay = 0 }: { leagueCode: string; delay?: number }) {
  const [data, setData] = useState<LeagueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFull, setShowFull] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      fetch(`/api/standings/${leagueCode}`)
        .then((r) => r.json())
        .then(setData)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, delay);
    return () => clearTimeout(t);
  }, [leagueCode, delay]);

  const league = getLeague(leagueCode);

  if (loading) {
    return <div className="space-y-1.5">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}</div>;
  }
  if (!data?.standings) {
    return <p className="text-[12px] text-muted-foreground py-3">Błąd tabeli {leagueCode}</p>;
  }

  const { standings, scorers, insights } = data;
  const total = standings.table.length;
  const visible = showFull ? total : Math.min(10, total);
  const table = standings.table.slice(0, visible);
  const maxPoints = standings.table[0]?.points ?? 1;

  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{league?.flag}</span>
          <span className={`text-[15px] font-black ${league?.color ?? 'text-foreground'}`}>
            {standings.leagueName}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground/30 tabular-nums">{standings.season}</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-0.5">
        <table className="w-full min-w-[300px]" style={{ fontSize: '13px' }}>
          <thead>
            <tr className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider border-b border-border/40">
              <th className="w-7 text-left pb-1.5 pl-2">#</th>
              <th className="text-left pb-1.5">Drużyna</th>
              <th className="text-center pb-1.5 w-7 hidden sm:table-cell">M</th>
              <th className="text-center pb-1.5 w-6">W</th>
              <th className="text-center pb-1.5 w-6 hidden sm:table-cell">R</th>
              <th className="text-center pb-1.5 w-6 hidden sm:table-cell">P</th>
              <th className="text-center pb-1.5 w-9">GD</th>
              <th className="text-center pb-1.5 w-10 text-foreground/80">Pkt</th>
              <th className="text-center pb-1.5 w-24 hidden md:table-cell">Forma</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row) => {
              const zone = getZone(row.position, leagueCode);
              return (
                <tr
                  key={row.position}
                  className={cn(
                    'hover:bg-white/[0.03] transition-colors',
                    ZONE_BORDER[zone]
                  )}
                >
                  <td className="py-1.5 pl-2">
                    <span className="tabular-nums text-muted-foreground/60 w-5 inline-block text-center">{row.position}</span>
                  </td>
                  <td className="py-1.5 pr-2 max-w-[140px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {row.teamCrest && (
                        <img src={row.teamCrest} alt="" className="w-4 h-4 object-contain flex-shrink-0" loading="lazy" />
                      )}
                      <span className="truncate text-foreground font-medium leading-tight">{row.teamName}</span>
                    </div>
                  </td>
                  <td className="py-1.5 text-center text-muted-foreground/70 hidden sm:table-cell">{row.played}</td>
                  <td className="py-1.5 text-center text-emerald-400 font-semibold">{row.won}</td>
                  <td className="py-1.5 text-center text-muted-foreground/60 hidden sm:table-cell">{row.draw}</td>
                  <td className="py-1.5 text-center text-red-400/70 hidden sm:table-cell">{row.lost}</td>
                  <td className="py-1.5 text-center text-muted-foreground/70 tabular-nums">
                    {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                  </td>
                  <td className="py-1.5 text-center relative">
                    <div
                      className="absolute inset-y-0.5 left-0 bg-primary/[0.07] rounded-r"
                      style={{ width: `${(row.points / maxPoints) * 100}%` }}
                    />
                    <span className="relative score-display font-black text-[15px] text-foreground">{row.points}</span>
                  </td>
                  <td className="py-1.5 text-center hidden md:table-cell">
                    <FormCell form={row.form} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Show full toggle */}
      {total > 10 && (
        <button
          onClick={() => setShowFull(!showFull)}
          className="w-full text-[11px] text-muted-foreground/60 hover:text-muted-foreground py-1.5 border border-dashed border-border/40 hover:border-border/70 rounded-lg transition-colors"
        >
          {showFull ? 'Zwiń ↑' : `Pokaż wszystkie ${total} drużyn ↓`}
        </button>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {LEGEND_ITEMS
          .filter(({ zone }) => {
            const z = ZONES[leagueCode];
            if (!z) return false;
            if (zone === 'uecl' && !z.uecl) return false;
            if (zone === 'playoff' && !z.playoff) return false;
            if (zone === 'ucl_q') return false;
            return true;
          })
          .map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-sm ${color}`} />
              <span className="text-[10px] text-muted-foreground/60">{label}</span>
            </div>
          ))}
      </div>

      {/* Scorers */}
      {scorers.length > 0 && (
        <div className="pt-2 border-t border-border/30">
          <p className="label-retro mb-1.5">Strzelcy</p>
          <div className="space-y-1">
            {scorers.slice(0, 5).map((s, i) => (
              <div key={s.playerName} className="flex items-center gap-2 text-[13px]">
                <span className="text-[10px] text-muted-foreground/40 w-4 tabular-nums text-right">{i + 1}.</span>
                <span className="text-foreground flex-1 truncate">{s.playerName}</span>
                <span className="text-muted-foreground/60 text-[11px] truncate max-w-[60px]">{s.teamName}</span>
                <Badge variant="secondary" className="text-[11px] h-5 px-1.5 font-black score-display">{s.goals}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
