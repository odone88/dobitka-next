'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { Match } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getEditorialLine } from '@/lib/match-comments';

function isLive(m: Match) {
  return m.status === 'LIVE' || m.status === 'IN_PLAY' || m.status === 'PAUSED';
}

const BANNER_PRIORITY: Record<string, number> = {
  CL: 0, ELC: 1, PPL: 2, PL: 3, PD: 4, SA: 5, BL1: 6, FL1: 7, DED: 8, BSA: 9, CLI: 10,
};

function Crest({ src, name, size = 22 }: { src?: string; name: string; size?: number }) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} width={size} height={size} className="object-contain" loading="lazy" />
  );
}

export function MatchHero({ initialMatches = [], ssrLoaded = false }: { initialMatches?: Match[]; ssrLoaded?: boolean }) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [loading, setLoading] = useState(!ssrLoaded && initialMatches.length === 0);
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
    // If SSR loaded data AND we actually have matches, skip first fetch
    if (ssrLoaded && initialMatches.length > 0) {
      const id = setInterval(fetchData, 90_000);
      return () => clearInterval(id);
    }
    // SSR was empty or not loaded — fetch immediately
    fetchData();
    const id = setInterval(fetchData, 90_000);
    return () => clearInterval(id);
  }, [fetchData, ssrLoaded, initialMatches.length]);

  // Score change detection
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

  // ─── MODE 1: LIVE ──────────────────────────────────────────────
  if (liveMatches.length > 0) {
    return (
      <div className="rounded-2xl border-2 border-destructive/50 border-live bg-gradient-to-br from-destructive/[0.15] via-card to-card overflow-hidden shadow-lg shadow-destructive/10">
        <div className="flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-destructive to-destructive/80 text-white text-[11px] font-black uppercase tracking-widest" role="status" aria-live="polite">
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          {liveMatches.length} {liveMatches.length === 1 ? 'mecz na żywo' : liveMatches.length < 5 ? 'mecze na żywo' : 'meczów na żywo'}
        </div>

        <div className="px-4 py-2 space-y-0">
          {liveMatches.map((m) => (
            <Link
              key={m.id}
              href={`/match/${m.id}`}
              className="group flex items-center gap-3 hover:bg-white/[0.05] rounded-xl px-3 py-1.5 -mx-1 transition-all"
            >
              {/* Home */}
              <div className="flex-1 flex items-center gap-2.5 justify-end min-w-0">
                <span className="font-bold text-[14px] text-foreground truncate">{m.homeTeam}</span>
                <Crest src={m.homeCrest} name={m.homeTeam} size={28} />
              </div>

              {/* Score — big and dramatic */}
              <div className="flex flex-col items-center px-3">
                <span className={cn(
                  'score-display text-[26px] font-black text-destructive leading-none',
                  changedIds.has(m.id) && 'score-just-changed'
                )}>
                  {m.homeScore} <span className="text-[18px] text-destructive/50">:</span> {m.awayScore}
                </span>
                {m.minute && (
                  <span className="text-[10px] font-black text-destructive score-display mt-0.5 live-dot">
                    {m.status === 'PAUSED' ? 'PRZERWA' : `${m.minute}'`}
                  </span>
                )}
              </div>

              {/* Away */}
              <div className="flex-1 flex items-center gap-2.5 min-w-0">
                <Crest src={m.awayCrest} name={m.awayTeam} size={28} />
                <span className="font-bold text-[14px] text-foreground truncate">{m.awayTeam}</span>
              </div>

              <span className="text-[9px] font-bold text-muted-foreground uppercase flex-shrink-0 hidden sm:block">{m.competitionCode}</span>
            </Link>
          ))}
        </div>

        {/* Editorial line for the most interesting live match */}
        {liveMatches.length > 0 && (
          <p className="px-5 pb-3 text-[11px] text-muted-foreground italic">
            {getEditorialLine(
              liveMatches[0].homeTeam, liveMatches[0].awayTeam,
              liveMatches[0].homeScore, liveMatches[0].awayScore,
              liveMatches[0].status, liveMatches[0].utcDate, liveMatches[0].id
            )}
          </p>
        )}
      </div>
    );
  }

  // ─── MODE 2: WYNIKI DNIA ───────────────────────────────────────
  if (finished.length > 0) {
    const top = finished
      .sort((a, b) => {
        const pa = BANNER_PRIORITY[a.competitionCode] ?? 99;
        const pb = BANNER_PRIORITY[b.competitionCode] ?? 99;
        if (pa !== pb) return pa - pb;
        return (b.homeScore! + b.awayScore!) - (a.homeScore! + a.awayScore!);
      })
      .slice(0, 4);

    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden card-elevated">
        <div className="flex items-center gap-2 px-5 py-2 bg-accent/30 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
          </svg>
          Najlepsze wyniki dnia
        </div>
        <div className="px-4 py-2 space-y-0">
          {top.map((m) => {
            const homeWin = m.homeScore! > m.awayScore!;
            const awayWin = m.awayScore! > m.homeScore!;
            return (
              <Link
                key={m.id}
                href={`/match/${m.id}`}
                className="group flex items-center gap-3 hover:bg-accent/50 rounded-xl px-3 py-1.5 -mx-1 transition-all"
              >
                <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
                  <span className={cn('text-[13px] truncate', homeWin ? 'font-bold text-foreground' : 'text-muted-foreground')}>
                    {m.homeTeam}
                  </span>
                  <Crest src={m.homeCrest} name={m.homeTeam} size={24} />
                </div>
                <span className="score-display text-[20px] font-black text-foreground w-[60px] text-center">
                  {m.homeScore} <span className="text-muted-foreground text-[14px]">:</span> {m.awayScore}
                </span>
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <Crest src={m.awayCrest} name={m.awayTeam} size={24} />
                  <span className={cn('text-[13px] truncate', awayWin ? 'font-bold text-foreground' : 'text-muted-foreground')}>
                    {m.awayTeam}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase flex-shrink-0 hidden sm:block">{m.competitionCode}</span>
              </Link>
            );
          })}
        </div>

        {/* Editorial line for the top result */}
        {top.length > 0 && (
          <p className="px-5 pb-3 text-[11px] text-muted-foreground italic">
            {getEditorialLine(
              top[0].homeTeam, top[0].awayTeam,
              top[0].homeScore, top[0].awayScore,
              top[0].status, top[0].utcDate, top[0].id
            )}
          </p>
        )}
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
      <Link
        href={`/match/${next.id}`}
        className="group block rounded-2xl border border-border bg-gradient-to-r from-primary/[0.06] to-card overflow-hidden card-elevated hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
      >
        <div className="flex items-center gap-2 px-5 py-2 bg-primary/[0.08] text-[11px] font-black uppercase tracking-widest text-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Najbliższy mecz
        </div>
        <div className="px-5 py-2.5 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Crest src={next.homeCrest} name={next.homeTeam} size={32} />
            <span className="font-bold text-[16px] text-foreground">{next.homeTeam}</span>
          </div>
          <div className="flex flex-col items-center px-3">
            <span className="text-[22px] font-black score-display text-primary">vs</span>
            <span className="text-[11px] text-muted-foreground score-display mt-0.5">
              {isToday ? `dziś ${time}` : `${day} · ${time}`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-[16px] text-foreground">{next.awayTeam}</span>
            <Crest src={next.awayCrest} name={next.awayTeam} size={32} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wide text-primary ml-auto hidden sm:block">
            {next.competitionCode}
          </span>
        </div>
      </Link>
    );
  }

  // ─── MODE 4: BRAK MECZÓW — date banner ─────────────────────────
  const todayStr = new Date().toLocaleDateString('pl-PL', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/[0.04] to-card overflow-hidden">
      <div className="px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Dzisiaj</p>
          <p className="font-display text-lg text-foreground capitalize">{todayStr}</p>
          <p className="text-[12px] text-muted-foreground mt-1">Brak meczów w głównych ligach. Sprawdź archiwum lub wróć później.</p>
        </div>
        <Link href="/archive" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex-shrink-0">
          Archiwum &rarr;
        </Link>
      </div>
    </div>
  );
}
