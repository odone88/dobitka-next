'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Match } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function isLive(m: Match) {
  return m.status === 'LIVE' || m.status === 'IN_PLAY' || m.status === 'PAUSED';
}

const BANNER_PRIORITY: Record<string, number> = {
  CL: 0, ELC: 1, PL: 2, PD: 3, SA: 4, BL1: 5, FL1: 6, PPL: 7, DED: 8, BSA: 9, CLI: 10,
};

export function MatchHero() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [changedIds, setChangedIds] = useState<Set<number>>(new Set());
  const prevScoresRef = useRef<Map<number, string>>(new Map());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/live');
      if (!res.ok) return;
      const d = await res.json();
      setMatches(d.today ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 90_000);
    return () => clearInterval(id);
  }, [fetchData]);

  // Detekcja zmiany wyniku — per mecz, nie globalnie
  useEffect(() => {
    const liveMatches = matches.filter(isLive);
    if (liveMatches.length === 0) return;

    const newChanged = new Set<number>();
    for (const m of liveMatches) {
      const key = `${m.homeScore}-${m.awayScore}`;
      const prev = prevScoresRef.current.get(m.id);
      if (prev !== undefined && prev !== key) {
        newChanged.add(m.id);
      }
      prevScoresRef.current.set(m.id, key);
    }

    if (newChanged.size > 0) {
      setChangedIds(newChanged);
      const t = setTimeout(() => setChangedIds(new Set()), 1500);
      return () => clearTimeout(t);
    }
  }, [matches]);

  const liveMatches = matches.filter(isLive)
    .sort((a, b) => (BANNER_PRIORITY[a.competitionCode] ?? 99) - (BANNER_PRIORITY[b.competitionCode] ?? 99));
  const finished = matches.filter((m) => m.status === 'FINISHED' && m.homeScore !== null);
  const upcoming = matches.filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED')
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

  if (loading) return <Skeleton className="h-16 w-full rounded-xl" />;

  // ─── MODE 1: LIVE — banner z pulsujaca ramka ──────────────────
  if (liveMatches.length > 0) {
    return (
      <div className="rounded-xl border border-destructive/40 border-live bg-gradient-to-r from-destructive/[0.08] via-card to-card overflow-hidden">
        {/* Live header bar */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-destructive text-white text-[10px] font-black uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          {liveMatches.length} {liveMatches.length === 1 ? 'mecz na zywo' : liveMatches.length < 5 ? 'mecze na zywo' : 'meczow na zywo'}
        </div>

        {/* Live matches */}
        <div className="px-4 py-3 flex flex-wrap gap-x-6 gap-y-2.5">
          {liveMatches.map((m) => (
            <a
              key={m.id}
              href={`/match/${m.id}`}
              className="flex items-center gap-2 text-[14px] group hover:bg-white/[0.03] rounded-lg px-2 py-1 -mx-2 transition-colors"
            >
              <span className="font-bold text-foreground/90 group-hover:text-foreground transition-colors">
                {m.homeTeam}
              </span>
              <span className={cn(
                'score-display text-[18px] font-black text-destructive',
                changedIds.has(m.id) && 'score-just-changed'
              )}>
                {m.homeScore}&thinsp;–&thinsp;{m.awayScore}
              </span>
              <span className="font-bold text-foreground/90 group-hover:text-foreground transition-colors">
                {m.awayTeam}
              </span>
              {m.minute && (
                <span className="text-[11px] font-black text-destructive/70 score-display live-dot">
                  {m.status === 'PAUSED' ? 'PRZ' : `${m.minute}'`}
                </span>
              )}
              <span className="text-[9px] font-bold text-muted-foreground/30 uppercase">{m.competitionCode}</span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  // ─── MODE 2: WYNIKI DNIA — top rezultaty ──────────────────────
  if (finished.length > 0) {
    const top = finished
      .sort((a, b) => {
        // Najpierw po wadze ligi, potem po liczbie goli
        const pa = BANNER_PRIORITY[a.competitionCode] ?? 99;
        const pb = BANNER_PRIORITY[b.competitionCode] ?? 99;
        if (pa !== pb) return pa - pb;
        return (b.homeScore! + b.awayScore!) - (a.homeScore! + a.awayScore!);
      })
      .slice(0, 4);

    return (
      <div className="rounded-xl border border-border/30 bg-card overflow-hidden card-elevated">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
          Wyniki dnia
        </div>
        <div className="px-4 py-3 flex flex-wrap gap-x-6 gap-y-2">
          {top.map((m) => {
            const homeWin = m.homeScore! > m.awayScore!;
            const awayWin = m.awayScore! > m.homeScore!;
            return (
              <a
                key={m.id}
                href={`/match/${m.id}`}
                className="flex items-center gap-2 text-[14px] hover:bg-white/[0.03] rounded-lg px-2 py-1 -mx-2 transition-colors"
              >
                <span className={cn('font-medium', homeWin ? 'text-foreground font-bold' : 'text-foreground/50')}>
                  {m.homeTeam}
                </span>
                <span className="score-display text-[16px] font-black text-foreground">
                  {m.homeScore}&thinsp;–&thinsp;{m.awayScore}
                </span>
                <span className={cn('font-medium', awayWin ? 'text-foreground font-bold' : 'text-foreground/50')}>
                  {m.awayTeam}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── MODE 3: NAJBLIZSZY MECZ ──────────────────────────────────
  if (upcoming.length > 0) {
    const next = upcoming[0];
    const time = new Date(next.utcDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    const day = new Date(next.utcDate).toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' });
    const isToday = new Date(next.utcDate).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);

    return (
      <a
        href={`/match/${next.id}`}
        className="block rounded-xl border border-border/30 bg-card overflow-hidden card-elevated hover:border-primary/20 transition-colors"
      >
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
          Najblizszy mecz
        </div>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 text-[16px]">
            <span className="font-bold text-foreground">{next.homeTeam}</span>
            <span className="text-muted-foreground/25 font-black score-display">vs</span>
            <span className="font-bold text-foreground">{next.awayTeam}</span>
          </div>
          <span className="text-[12px] text-muted-foreground/50 ml-auto score-display">
            {isToday ? `dzis ${time}` : `${day} · ${time}`}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-primary/50">
            {next.competitionCode}
          </span>
        </div>
      </a>
    );
  }

  return null;
}
