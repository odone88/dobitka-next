'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getZone, ZONE_BORDER } from '@/lib/zones';
import { cn } from '@/lib/utils';
import type { LeagueStandings, Scorer, StandingRow } from '@/types';

interface LeagueContentProps {
  code: string;
  slug: string;
}

interface ApiResponse {
  standings: LeagueStandings;
  scorers: Scorer[];
}

// ─── SECTION LABEL ──────────────────────────────────────────────────────────
function SectionLabel({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <h2 className="mb-4 flex items-center gap-3">
      <span className={cn(
        'font-display text-[15px] tracking-wide',
        accent ? 'text-primary font-bold' : 'text-foreground font-semibold'
      )}>
        {text}
      </span>
      <span className="flex-1 border-t border-border" aria-hidden="true" />
    </h2>
  );
}

// ─── FORM CELL ──────────────────────────────────────────────────────────────
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

// ─── SHORTENED TABLE ────────────────────────────────────────────────────────
function ShortenedTable({ table, code, slug }: { table: StandingRow[]; code: string; slug: string }) {
  const top = table.slice(0, 6);
  const bottom = table.slice(-3);
  const maxPoints = table[0]?.points ?? 1;
  const hasGap = table.length > 9;

  const renderRow = (row: StandingRow) => {
    const zone = getZone(row.position, code);
    return (
      <tr key={row.position} className={cn('hover:bg-accent/50 transition-colors', ZONE_BORDER[zone])}>
        <td className="py-1.5 pl-2">
          <span className="tabular-nums text-muted-foreground w-5 inline-block text-center">{row.position}</span>
        </td>
        <td className="py-1.5 pr-2 max-w-[140px]">
          <div className="flex items-center gap-1.5 min-w-0">
            {row.teamCrest && (
              <img src={row.teamCrest} alt={row.teamName} className="w-4 h-4 object-contain shrink-0" loading="lazy" />
            )}
            <span className="truncate text-foreground font-medium leading-tight">{row.teamName}</span>
          </div>
        </td>
        <td className="py-1.5 text-center text-muted-foreground hidden sm:table-cell">{row.played}</td>
        <td className="py-1.5 text-center tabular-nums text-muted-foreground">
          {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
        </td>
        <td className="py-1.5 text-center relative">
          <div
            className="absolute inset-y-0.5 left-0 bg-primary/[0.12] rounded-r"
            style={{ width: `${(row.points / maxPoints) * 100}%` }}
          />
          <span className="relative score-display font-black text-[15px] text-foreground">{row.points}</span>
        </td>
        <td className="py-1.5 text-center hidden md:table-cell">
          <FormCell form={row.form} />
        </td>
      </tr>
    );
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px]" style={{ fontSize: '13px' }}>
          <thead>
            <tr className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider border-b border-border">
              <th className="w-7 text-left pb-1.5 pl-2">#</th>
              <th className="text-left pb-1.5">Druzyna</th>
              <th className="text-center pb-1.5 w-7 hidden sm:table-cell">M</th>
              <th className="text-center pb-1.5 w-9">+/-</th>
              <th className="text-center pb-1.5 w-10 text-foreground">Pkt</th>
              <th className="text-center pb-1.5 w-24 hidden md:table-cell">Forma</th>
            </tr>
          </thead>
          <tbody>
            {top.map(renderRow)}
            {hasGap && (
              <tr>
                <td colSpan={6} className="py-1 text-center">
                  <span className="text-[11px] text-muted-foreground tracking-widest">...</span>
                </td>
              </tr>
            )}
            {hasGap && bottom.map(renderRow)}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <Link
          href={`/${slug}/tabela`}
          className="text-[12px] text-primary hover:text-primary/80 font-bold uppercase tracking-wider transition-colors"
        >
          Pelna tabela →
        </Link>
      </div>
    </div>
  );
}

// ─── SKELETON LOADER ────────────────────────────────────────────────────────
function LeagueSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Table skeleton */}
      <section>
        <Skeleton className="h-5 w-24 mb-4" />
        <Card>
          <CardContent className="pt-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      {/* Scorers skeleton */}
      <section>
        <Skeleton className="h-5 w-24 mb-4" />
        <Card>
          <CardContent className="pt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-6 w-10 rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// ─── MAIN CLIENT COMPONENT ─────────────────────────────────────────────────
export function LeagueContent({ code, slug }: LeagueContentProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/standings/${code}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: ApiResponse) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [code]);

  if (loading) return <LeagueSkeleton />;

  if (error || !data?.standings) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nie udalo sie zaladowac danych. Sprobuj ponownie pozniej.</p>
      </div>
    );
  }

  const { standings, scorers } = data;
  const season = standings.season
    ? `${standings.season}/${(parseInt(standings.season, 10) + 1).toString().slice(-2)}`
    : '2025/26';

  return (
    <div className="space-y-8">
      {/* Season info */}
      <p className="text-[12px] text-muted-foreground -mt-4">Sezon {season}</p>

      {/* TABELA (skrocona) */}
      {standings.table.length > 0 && (
        <section className="animate-fade-in">
          <SectionLabel text="Tabela" />
          <Card>
            <CardContent className="pt-4">
              <ShortenedTable table={standings.table} code={code} slug={slug} />
            </CardContent>
          </Card>
        </section>
      )}

      {/* STRZELCY (top 5 from API, show up to 10 if available) */}
      {scorers.length > 0 && (
        <section className="animate-fade-in">
          <SectionLabel text="Strzelcy" accent />
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-1.5">
                {scorers.map((s, i) => (
                  <div
                    key={`${s.playerName}-${s.teamName}`}
                    className={cn(
                      'flex items-center gap-3 py-2 px-3 rounded-lg transition-colors',
                      i < 3 ? 'bg-accent/30' : 'hover:bg-accent/20'
                    )}
                  >
                    <span className={cn(
                      'text-[13px] w-6 tabular-nums text-right font-bold',
                      i === 0 ? 'text-amber-400' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-orange-600' : 'text-muted-foreground'
                    )}>
                      {i + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] text-foreground font-medium truncate block">{s.playerName}</span>
                      <span className="text-[11px] text-muted-foreground truncate block">{s.teamName}</span>
                    </div>
                    {s.assists !== undefined && s.assists > 0 && (
                      <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                        {s.assists} ast.
                      </span>
                    )}
                    <Badge variant="secondary" className="text-[13px] h-6 px-2 font-black score-display shrink-0">
                      {s.goals}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
