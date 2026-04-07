'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { LEAGUES } from '@/config/leagues';
import type { Match, MatchGoal } from '@/types';

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface LiveApiResponse {
  live: Match[];
  today: Match[];
  updatedAt: string;
}

interface LeagueGroup {
  code: string;
  name: string;
  emblem?: string;
  matches: Match[];
}

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const LIVE_STATUSES = new Set(['IN_PLAY', 'PAUSED', 'LIVE']);
const REFRESH_INTERVAL = 15_000;

// ─── HELPERS ────────────────────────────────────────────────────────────────

function isLive(status: string): boolean {
  return LIVE_STATUSES.has(status);
}

function groupByCompetition(matches: Match[]): LeagueGroup[] {
  const map = new Map<string, LeagueGroup>();
  for (const m of matches) {
    if (!map.has(m.competitionCode)) {
      map.set(m.competitionCode, {
        code: m.competitionCode,
        name: m.competition,
        emblem: m.competitionEmblem,
        matches: [],
      });
    }
    map.get(m.competitionCode)!.matches.push(m);
  }
  return Array.from(map.values());
}

function formatGoals(goals: MatchGoal[]): string {
  if (!goals || goals.length === 0) return '';
  return goals
    .map((g) => {
      const suffix = g.type === 'OWN_GOAL' ? ' (sam.)' : g.type === 'PENALTY' ? ' (k.)' : '';
      return `${g.minute}' ${g.scorer}${suffix}`;
    })
    .join(', ');
}

// ─── SKELETON LOADER ────────────────────────────────────────────────────────

function MatchSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-16" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
        <div className="flex justify-center">
          <Skeleton className="h-3 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-fade-in">
      <Skeleton className="h-6 w-40 mb-4" />
      {Array.from({ length: 4 }).map((_, i) => (
        <MatchSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── EMPTY STATE ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground mb-6"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      <p className="text-lg text-muted-foreground mb-2">
        Aktualnie nie ma rozgrywanych meczow
      </p>
      <p className="text-sm text-muted-foreground/60 mb-6">
        Sprawdz terminarz, zeby zobaczyc nadchodzace mecze
      </p>
      <Link
        href="/"
        className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
      >
        Sprawdz terminarz -&gt;
      </Link>
    </div>
  );
}

// ─── MATCH CARD ─────────────────────────────────────────────────────────────

function MatchCard({ match }: { match: Match }) {
  const isPaused = match.status === 'PAUSED';
  const goalsText = formatGoals(match.goals);

  return (
    <Link href={`/match/${match.id}`} className="block">
      <Card className="bg-card border-border hover:border-primary/30 transition-colors border-live">
        <CardContent className="p-4">
          {/* Main row: teams + score */}
          <div className="flex items-center gap-3">
            {/* Home team */}
            <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
              <span className="text-sm font-medium truncate text-right">
                {match.homeTeam}
              </span>
              {match.homeCrest && (
                <Image
                  src={match.homeCrest}
                  alt=""
                  width={20}
                  height={20}
                  className="shrink-0"
                  unoptimized
                />
              )}
            </div>

            {/* Score */}
            <div className="flex flex-col items-center shrink-0 min-w-[64px]">
              <span className="score-display text-2xl text-red-500 font-bold">
                {match.homeScore ?? 0} : {match.awayScore ?? 0}
              </span>
            </div>

            {/* Away team */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {match.awayCrest && (
                <Image
                  src={match.awayCrest}
                  alt=""
                  width={20}
                  height={20}
                  className="shrink-0"
                  unoptimized
                />
              )}
              <span className="text-sm font-medium truncate">
                {match.awayTeam}
              </span>
            </div>
          </div>

          {/* Minute / status */}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {isPaused ? (
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wide">
                PRZERWA
              </span>
            ) : (
              <>
                <span className="live-dot" />
                <span className="text-xs text-red-400 font-semibold tabular-nums">
                  {match.minute != null ? `${match.minute}'` : 'LIVE'}
                </span>
              </>
            )}
          </div>

          {/* Goals */}
          {goalsText && (
            <p className="text-[11px] text-muted-foreground text-center mt-2 leading-relaxed truncate">
              {goalsText}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── FILTER BAR ─────────────────────────────────────────────────────────────

function FilterBar({
  groups,
  active,
  onChange,
}: {
  groups: LeagueGroup[];
  active: string | null;
  onChange: (code: string | null) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border',
          active === null
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-card text-muted-foreground border-border hover:border-primary/40'
        )}
      >
        Wszystkie
      </button>
      {groups.map((g) => {
        const league = LEAGUES.find((l) => l.code === g.code);
        return (
          <button
            key={g.code}
            onClick={() => onChange(g.code)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border flex items-center gap-1.5',
              active === g.code
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40'
            )}
          >
            {league && <span>{league.flag}</span>}
            <span>{league?.shortName ?? g.name}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── MAIN CLIENT COMPONENT ─────────────────────────────────────────────────

export function LiveResults() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch('/api/live', { cache: 'no-store' });
      if (!res.ok) return;
      const data: LiveApiResponse = await res.json();
      const liveOnly = [...data.live, ...data.today].filter((m) => isLive(m.status));
      // Deduplicate by id
      const seen = new Set<number>();
      const deduped = liveOnly.filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });
      setMatches(deduped);
      setUpdatedAt(data.updatedAt);
    } catch {
      // Keep previous state on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLive]);

  const groups = useMemo(() => {
    if (!matches) return [];
    return groupByCompetition(matches);
  }, [matches]);

  const filteredGroups = useMemo(() => {
    if (!filter) return groups;
    return groups.filter((g) => g.code === filter);
  }, [groups, filter]);

  // Reset filter if that league no longer has live matches
  useEffect(() => {
    if (filter && !groups.some((g) => g.code === filter)) {
      setFilter(null);
    }
  }, [groups, filter]);

  return (
    <>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="font-display text-2xl tracking-tight mb-1">
          Wyniki na zywo
        </h1>
        {updatedAt && (
          <p className="text-[11px] text-muted-foreground/60">
            Aktualizacja co 15s
            {' -- '}
            ostatnia: {new Date(updatedAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && <LoadingSkeleton />}

      {/* Empty state */}
      {!loading && matches && matches.length === 0 && <EmptyState />}

      {/* Content */}
      {!loading && matches && matches.length > 0 && (
        <div className="animate-fade-in">
          {/* Filter bar */}
          {groups.length > 1 && (
            <FilterBar groups={groups} active={filter} onChange={setFilter} />
          )}

          {/* League groups */}
          <div className="space-y-6">
            {filteredGroups.map((group) => {
              const league = LEAGUES.find((l) => l.code === group.code);
              return (
                <section key={group.code}>
                  {/* League header */}
                  <div className="flex items-center gap-2 mb-3">
                    {group.emblem && (
                      <Image
                        src={group.emblem}
                        alt=""
                        width={20}
                        height={20}
                        className="shrink-0"
                        unoptimized
                      />
                    )}
                    <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                      {group.name}
                    </h2>
                    {league && (
                      <span className="text-xs text-muted-foreground/50">
                        {league.flag}
                      </span>
                    )}
                  </div>

                  {/* Match cards */}
                  <div className="space-y-2">
                    {group.matches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
