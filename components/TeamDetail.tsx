'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TeamData {
  id: number;
  name: string;
  shortName: string;
  crest: string;
  address: string;
  website: string;
  founded: number;
  venue: string;
  clubColors: string;
  coach: { name: string; nationality: string } | null;
  squad: {
    id: number;
    name: string;
    position: string;
    nationality: string;
    dateOfBirth: string;
  }[];
  recentMatches: MatchEntry[];
  upcomingMatches: UpcomingEntry[];
  competitions: { name: string; code: string; emblem: string }[];
}

interface MatchEntry {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeCrest?: string;
  awayCrest?: string;
  homeScore: number;
  awayScore: number;
  date: string;
  competition: string;
  result: string;
}

interface UpcomingEntry {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeCrest?: string;
  awayCrest?: string;
  date: string;
  competition: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const RESULT_COLOR: Record<string, string> = {
  W: 'bg-primary text-primary-foreground',
  D: 'bg-amber-500 text-black',
  L: 'bg-destructive text-white',
};

const POSITION_ORDER = ['Goalkeeper', 'Defence', 'Midfield', 'Offence'];
const POSITION_PL: Record<string, string> = {
  Goalkeeper: 'Bramkarze',
  Defence: 'Obrona',
  Midfield: 'Pomoc',
  Offence: 'Atak',
};

type TabId = 'mecze' | 'info';

// ─── Component ──────────────────────────────────────────────────────────────

export function TeamDetailView({ teamId }: { teamId: string }) {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('mecze');

  useEffect(() => {
    fetch(`/api/team/${teamId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setTeam)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="py-16 text-center">
        <p className="text-[16px] font-display text-muted-foreground">
          Nie znaleziono druzyny
        </p>
        <a
          href="/"
          className="text-[13px] text-primary hover:underline mt-2 inline-block"
        >
          &larr; Strona glowna
        </a>
      </div>
    );
  }

  const age = (dob: string) => {
    const born = new Date(dob);
    const now = new Date();
    let a = now.getFullYear() - born.getFullYear();
    const m = now.getMonth() - born.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < born.getDate())) a--;
    return a;
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'mecze', label: 'Mecze' },
    { id: 'info', label: 'Info' },
  ];

  return (
    <div className="space-y-4">
      {/* ── Hero Header ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 flex items-center gap-5">
          {team.crest && (
            <img
              src={team.crest}
              alt={team.name}
              width={80}
              height={80}
              className="w-20 h-20 object-contain flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl text-foreground leading-tight">
              {team.name}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-muted-foreground">
              {team.venue && (
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                  {team.venue}
                </span>
              )}
              {team.founded > 0 && (
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Zal. {team.founded}
                </span>
              )}
              {team.coach && (
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {team.coach.name}
                </span>
              )}
            </div>
            {team.competitions.length > 0 && (
              <div className="flex gap-1.5 mt-2">
                {team.competitions.map((c) => (
                  <span
                    key={c.code}
                    className="text-[9px] px-2 py-0.5 rounded bg-white/[0.05] text-muted-foreground font-bold uppercase tracking-widest"
                  >
                    {c.code}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Form badges ──────────────────────────────────────────── */}
        {team.recentMatches.length > 0 && (
          <div className="px-5 pb-4 flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mr-1">
              Forma
            </span>
            {team.recentMatches.map((m) => (
              <span
                key={m.id}
                className={cn(
                  'w-6 h-6 rounded flex items-center justify-center text-[10px] font-black',
                  RESULT_COLOR[m.result] ?? 'bg-muted'
                )}
                title={`${m.homeTeam} ${m.homeScore}-${m.awayScore} ${m.awayTeam}`}
              >
                {m.result}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Tab Navigation ───────────────────────────────────────────── */}
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-[12px] font-bold uppercase tracking-widest transition-colors',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-white/[0.04] text-muted-foreground hover:text-foreground hover:bg-white/[0.08]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Mecze ───────────────────────────────────────────────── */}
      {activeTab === 'mecze' && (
        <>
          {/* Ostatnie wyniki */}
          {team.recentMatches.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-display text-[13px] text-primary mb-3">
                  Ostatnie wyniki
                </h3>
                <div className="space-y-0">
                  {team.recentMatches.map((m) => {
                    const d = new Date(m.date).toLocaleDateString('pl-PL', {
                      day: 'numeric',
                      month: 'short',
                    });
                    return (
                      <a
                        key={m.id}
                        href={`/match/${m.id}`}
                        className="flex items-center gap-2 py-2 border-b border-border/50 last:border-0 text-[12px] hover:bg-white/[0.02] transition-colors rounded-sm"
                      >
                        <span
                          className={cn(
                            'w-5 h-5 rounded flex items-center justify-center text-[9px] font-black flex-shrink-0',
                            RESULT_COLOR[m.result]
                          )}
                        >
                          {m.result}
                        </span>
                        <span className="text-muted-foreground w-12 flex-shrink-0 text-[10px]">
                          {d}
                        </span>
                        <div className="flex-1 flex items-center gap-1.5 min-w-0">
                          {m.homeCrest && (
                            <img
                              src={m.homeCrest}
                              alt=""
                              className="w-4 h-4 object-contain flex-shrink-0"
                            />
                          )}
                          <span className="truncate text-foreground">
                            {m.homeTeam}
                          </span>
                          <span className="score-display font-bold text-foreground flex-shrink-0">
                            {m.homeScore}&ndash;{m.awayScore}
                          </span>
                          <span className="truncate text-foreground">
                            {m.awayTeam}
                          </span>
                          {m.awayCrest && (
                            <img
                              src={m.awayCrest}
                              alt=""
                              className="w-4 h-4 object-contain flex-shrink-0"
                            />
                          )}
                        </div>
                        <span className="text-[9px] text-muted-foreground flex-shrink-0 truncate max-w-[60px]">
                          {m.competition}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Nadchodzace mecze */}
          {team.upcomingMatches.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-display text-[13px] text-primary mb-3">
                  Nadchodzace mecze
                </h3>
                <div className="space-y-0">
                  {team.upcomingMatches.map((m) => {
                    const d = new Date(m.date);
                    const dateStr = d.toLocaleDateString('pl-PL', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    });
                    const timeStr = d.toLocaleTimeString('pl-PL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    return (
                      <a
                        key={m.id}
                        href={`/match/${m.id}`}
                        className="flex items-center gap-2 py-2.5 border-b border-border/50 last:border-0 text-[12px] hover:bg-white/[0.02] transition-colors rounded-sm"
                      >
                        <span className="text-muted-foreground w-20 flex-shrink-0 text-[10px]">
                          {dateStr}
                        </span>
                        <div className="flex-1 flex items-center gap-1.5 min-w-0">
                          {m.homeCrest && (
                            <img
                              src={m.homeCrest}
                              alt=""
                              className="w-4 h-4 object-contain flex-shrink-0"
                            />
                          )}
                          <span className="truncate font-medium text-foreground">
                            {m.homeTeam}
                          </span>
                          <span className="text-muted-foreground flex-shrink-0">
                            vs
                          </span>
                          <span className="truncate font-medium text-foreground">
                            {m.awayTeam}
                          </span>
                          {m.awayCrest && (
                            <img
                              src={m.awayCrest}
                              alt=""
                              className="w-4 h-4 object-contain flex-shrink-0"
                            />
                          )}
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="score-display text-[11px] text-primary">
                            {timeStr}
                          </span>
                          <span className="text-[9px] text-muted-foreground truncate max-w-[60px]">
                            {m.competition}
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {team.recentMatches.length === 0 &&
            team.upcomingMatches.length === 0 && (
              <div className="py-8 text-center text-[13px] text-muted-foreground">
                Brak danych o meczach
              </div>
            )}
        </>
      )}

      {/* ── Tab: Info ────────────────────────────────────────────────── */}
      {activeTab === 'info' && (
        <>
          {/* Informacje o klubie */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-display text-[13px] text-primary mb-3">
                Informacje
              </h3>
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                {team.venue && (
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">
                      Stadion
                    </span>
                    <span className="text-foreground">{team.venue}</span>
                  </div>
                )}
                {team.founded > 0 && (
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">
                      Zalozony
                    </span>
                    <span className="text-foreground">{team.founded}</span>
                  </div>
                )}
                {team.clubColors && (
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">
                      Barwy
                    </span>
                    <span className="text-foreground">{team.clubColors}</span>
                  </div>
                )}
                {team.address && (
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">
                      Adres
                    </span>
                    <span className="text-foreground">{team.address}</span>
                  </div>
                )}
                {team.coach && (
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">
                      Trener
                    </span>
                    <span className="text-foreground">
                      {team.coach.name}{' '}
                      <span className="text-muted-foreground">
                        ({team.coach.nationality})
                      </span>
                    </span>
                  </div>
                )}
              </div>
              {team.website && team.website.startsWith('http') && (
                <a
                  href={team.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-primary hover:text-primary/80 transition-colors mt-3 inline-flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Oficjalna strona
                </a>
              )}
            </CardContent>
          </Card>

          {/* Sklad */}
          {team.squad.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-display text-[13px] text-primary mb-3">
                  Sklad ({team.squad.length})
                </h3>
                {POSITION_ORDER.map((pos) => {
                  const players = team.squad.filter(
                    (p) => p.position === pos
                  );
                  if (players.length === 0) return null;
                  return (
                    <div key={pos} className="mb-3 last:mb-0">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
                        {POSITION_PL[pos] ?? pos}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                        {players.map((p) => (
                          <div
                            key={p.id}
                            className="text-[12px] py-1 px-2 rounded bg-white/[0.02] flex items-center gap-1.5"
                          >
                            <span className="text-foreground truncate">
                              {p.name}
                            </span>
                            {p.dateOfBirth && (
                              <span className="text-[9px] text-muted-foreground flex-shrink-0">
                                {age(p.dateOfBirth)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Footer link */}
      <div className="text-center py-4">
        <a
          href="/"
          className="text-[12px] text-muted-foreground hover:text-primary transition-colors"
        >
          &larr; Strona glowna
        </a>
      </div>
    </div>
  );
}
