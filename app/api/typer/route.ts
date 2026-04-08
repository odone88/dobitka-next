import { NextResponse } from 'next/server';
import type { TyperRound, TyperFixture } from '@/lib/typer';
import { cachedFetch } from '@/lib/cache';

export const revalidate = 300; // 5 min ISR

interface FPLEvent {
  id: number;
  name: string;
  deadline_time: string;
  finished: boolean;
  is_current: boolean;
  is_next: boolean;
}

interface FPLFixture {
  id: number;
  event: number;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  kickoff_time: string;
  finished: boolean;
}

interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
}

async function fetchFPLData(): Promise<{
  current: TyperRound | null;
  next: TyperRound | null;
  previous: TyperRound | null;
}> {
  // Fetch bootstrap (teams + gameweeks)
  const bootstrapRes = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
    headers: { 'User-Agent': 'Dobitka/2.0' },
    next: { revalidate: 600 },
  });
  if (!bootstrapRes.ok) throw new Error('FPL API error');
  const bootstrap = await bootstrapRes.json();

  const teams: Record<number, FPLTeam> = {};
  for (const t of bootstrap.teams) {
    teams[t.id] = { id: t.id, name: t.name, short_name: t.short_name };
  }

  const events: FPLEvent[] = bootstrap.events;
  const currentEvent = events.find((e: FPLEvent) => e.is_current) ?? null;
  const nextEvent = events.find((e: FPLEvent) => e.is_next) ?? null;
  const previousEvent = currentEvent
    ? events.find((e: FPLEvent) => e.id === currentEvent.id - 1) ?? null
    : null;

  // Fetch fixtures
  const fixturesRes = await fetch('https://fantasy.premierleague.com/api/fixtures/', {
    headers: { 'User-Agent': 'Dobitka/2.0' },
    next: { revalidate: 300 },
  });
  if (!fixturesRes.ok) throw new Error('FPL fixtures error');
  const allFixtures: FPLFixture[] = await fixturesRes.json();

  function buildRound(event: FPLEvent | null): TyperRound | null {
    if (!event) return null;
    const gw = event.id;
    const gwFixtures = allFixtures.filter((f: FPLFixture) => f.event === gw);
    const fixtures: TyperFixture[] = gwFixtures.map((f: FPLFixture) => {
      const h = teams[f.team_h];
      const a = teams[f.team_a];
      return {
        id: f.id,
        homeTeam: h?.name ?? `Team ${f.team_h}`,
        homeShort: h?.short_name ?? '???',
        homeCrest: `https://resources.premierleague.com/premierleague/badges/50/t${f.team_h}.png`,
        awayTeam: a?.name ?? `Team ${f.team_a}`,
        awayShort: a?.short_name ?? '???',
        awayCrest: `https://resources.premierleague.com/premierleague/badges/50/t${f.team_a}.png`,
        kickoff: f.kickoff_time,
        finished: f.finished,
        homeScore: f.team_h_score,
        awayScore: f.team_a_score,
      };
    });
    return { gameweek: gw, deadline: event.deadline_time, fixtures };
  }

  return {
    current: buildRound(currentEvent),
    next: buildRound(nextEvent),
    previous: buildRound(previousEvent),
  };
}

export async function GET() {
  try {
    const data = await cachedFetch('typer:rounds', fetchFPLData, 300);
    return NextResponse.json(data);
  } catch (e) {
    console.error('[DOBITKA] Typer API error:', e);
    return NextResponse.json({ current: null, next: null, previous: null, error: true });
  }
}
