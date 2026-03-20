'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
  squad: { id: number; name: string; position: string; nationality: string; dateOfBirth: string }[];
  recentMatches: { id: number; homeTeam: string; awayTeam: string; homeScore: number; awayScore: number; date: string; competition: string; result: string }[];
  upcomingMatches: { id: number; homeTeam: string; awayTeam: string; date: string; competition: string }[];
  competitions: { name: string; code: string; emblem: string }[];
}

const RESULT_COLOR: Record<string, string> = {
  W: 'bg-primary text-primary-foreground',
  D: 'bg-amber text-black',
  L: 'bg-destructive text-white',
};

const POSITION_ORDER = ['Goalkeeper', 'Defence', 'Midfield', 'Offence'];
const POSITION_PL: Record<string, string> = {
  Goalkeeper: 'Bramkarze',
  Defence: 'Obrona',
  Midfield: 'Pomoc',
  Offence: 'Atak',
};

export function TeamDetailView({ teamId }: { teamId: string }) {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/team/${teamId}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setTeam)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="py-16 text-center">
        <p className="text-[16px] font-display text-muted-foreground">Nie znaleziono druzyny</p>
        <a href="/" className="text-[13px] text-primary hover:underline mt-2 inline-block">← Strona glowna</a>
      </div>
    );
  }

  const age = (dob: string) => {
    const born = new Date(dob);
    const now = new Date();
    return now.getFullYear() - born.getFullYear();
  };

  return (
    <div className="space-y-4">
      {/* Team Header */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-6 flex items-center gap-5">
          {team.crest && (
            <img src={team.crest} alt={team.name} className="w-20 h-20 object-contain flex-shrink-0" />
          )}
          <div className="min-w-0">
            <h1 className="font-display text-2xl text-foreground leading-tight">{team.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-muted-foreground">
              {team.venue && <span>🏟 {team.venue}</span>}
              {team.founded && <span>📅 Zal. {team.founded}</span>}
              {team.coach && <span>👔 {team.coach.name}</span>}
            </div>
            {team.competitions.length > 0 && (
              <div className="flex gap-1.5 mt-2">
                {team.competitions.map((c) => (
                  <span key={c.code} className="text-[9px] px-2 py-0.5 rounded bg-white/[0.05] text-muted-foreground font-bold uppercase tracking-widest">
                    {c.code}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forma — ostatnie 5 */}
      {team.recentMatches.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-display text-[13px] text-primary mb-3">Forma</h3>
            <div className="flex gap-1.5 mb-3">
              {team.recentMatches.map((m) => (
                <span
                  key={m.id}
                  className={cn(
                    'w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-black',
                    RESULT_COLOR[m.result] ?? 'bg-muted'
                  )}
                  title={`${m.homeTeam} ${m.homeScore}-${m.awayScore} ${m.awayTeam}`}
                >
                  {m.result}
                </span>
              ))}
            </div>
            <div className="space-y-0">
              {team.recentMatches.map((m) => {
                const d = new Date(m.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
                return (
                  <a
                    key={m.id}
                    href={`/match/${m.id}`}
                    className="flex items-center gap-2 py-1.5 border-b border-border last:border-0 text-[12px] hover:bg-white/[0.02] transition-colors"
                  >
                    <span className={cn(
                      'w-5 h-5 rounded flex items-center justify-center text-[9px] font-black flex-shrink-0',
                      RESULT_COLOR[m.result]
                    )}>
                      {m.result}
                    </span>
                    <span className="text-muted-foreground w-12 flex-shrink-0 text-[10px]">{d}</span>
                    <span className="flex-1 truncate text-foreground">
                      {m.homeTeam} <span className="score-display font-bold text-foreground">{m.homeScore}–{m.awayScore}</span> {m.awayTeam}
                    </span>
                    <span className="text-[9px] text-muted-foreground flex-shrink-0 truncate max-w-[60px]">{m.competition}</span>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Najblizsze mecze */}
      {team.upcomingMatches.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-display text-[13px] text-primary mb-3">Najblizsze mecze</h3>
            <div className="space-y-0">
              {team.upcomingMatches.map((m) => {
                const d = new Date(m.date);
                const dateStr = d.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' });
                const timeStr = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
                return (
                  <a
                    key={m.id}
                    href={`/match/${m.id}`}
                    className="flex items-center gap-2 py-2 border-b border-border last:border-0 text-[12px] hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-muted-foreground w-20 flex-shrink-0 text-[10px]">{dateStr}</span>
                    <span className="flex-1 truncate font-medium text-foreground">
                      {m.homeTeam} vs {m.awayTeam}
                    </span>
                    <span className="score-display text-[11px] text-primary flex-shrink-0">{timeStr}</span>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skład */}
      {team.squad.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-display text-[13px] text-primary mb-3">Skład ({team.squad.length})</h3>
            {POSITION_ORDER.map((pos) => {
              const players = team.squad.filter((p) => p.position === pos);
              if (players.length === 0) return null;
              return (
                <div key={pos} className="mb-3 last:mb-0">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">
                    {POSITION_PL[pos] ?? pos}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {players.map((p) => (
                      <div key={p.id} className="text-[12px] py-1 px-2 rounded bg-white/[0.02] flex items-center gap-1.5">
                        <span className="text-foreground truncate">{p.name}</span>
                        {p.dateOfBirth && (
                          <span className="text-[9px] text-muted-foreground flex-shrink-0">{age(p.dateOfBirth)}</span>
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

      {/* Info */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="font-display text-[13px] text-primary mb-3">Informacje</h3>
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            {team.venue && (
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">Stadion</span>
                <span className="text-foreground">{team.venue}</span>
              </div>
            )}
            {team.founded && (
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">Zalozony</span>
                <span className="text-foreground">{team.founded}</span>
              </div>
            )}
            {team.clubColors && (
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">Barwy</span>
                <span className="text-foreground">{team.clubColors}</span>
              </div>
            )}
            {team.address && (
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">Adres</span>
                <span className="text-foreground">{team.address}</span>
              </div>
            )}
          </div>
          {team.website && (
            <a href={team.website} target="_blank" rel="noopener noreferrer"
               className="text-[11px] text-primary hover:text-primary transition-colors mt-3 inline-block">
              {team.website} ↗
            </a>
          )}
        </CardContent>
      </Card>

      <div className="text-center py-4">
        <a href="/" className="text-[12px] text-muted-foreground hover:text-primary transition-colors">← Strona glowna</a>
      </div>
    </div>
  );
}
