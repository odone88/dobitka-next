import type { Match, StandingRow, LeagueStandings, Scorer } from '@/types';
import { FOOTBALL_DATA_KEY } from '@/config/sources';

const BASE = 'https://api.football-data.org/v4';
const HEADERS = { 'X-Auth-Token': FOOTBALL_DATA_KEY };

async function fdFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: HEADERS,
    next: { revalidate: 120 }, // Next.js cache: 2 min
  });
  if (!res.ok) throw new Error(`football-data ${path}: ${res.status}`);
  return res.json();
}

// ─── LIVE / TODAY MATCHES ────────────────────────────────────────────────────
export async function getLiveMatches(): Promise<Match[]> {
  try {
    const data = await fdFetch('/matches?status=LIVE');
    return mapMatches(data.matches ?? []);
  } catch {
    return [];
  }
}

export async function getTodayMatches(): Promise<Match[]> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const data = await fdFetch(`/matches?dateFrom=${today}&dateTo=${today}`);
    return mapMatches(data.matches ?? []);
  } catch {
    return [];
  }
}

// ─── STANDINGS ───────────────────────────────────────────────────────────────
export async function getStandings(leagueCode: string): Promise<LeagueStandings | null> {
  try {
    const data = await fdFetch(`/competitions/${leagueCode}/standings`);
    const table: StandingRow[] = (data.standings?.[0]?.table ?? []).map((row: Record<string, unknown>) => ({
      position: row.position as number,
      teamName: (row.team as Record<string, unknown>)?.name as string,
      teamCrest: (row.team as Record<string, unknown>)?.crest as string,
      played: row.playedGames as number,
      won: row.won as number,
      draw: row.draw as number,
      lost: row.lost as number,
      goalsFor: row.goalsFor as number,
      goalsAgainst: row.goalsAgainst as number,
      goalDiff: row.goalDifference as number,
      points: row.points as number,
      form: row.form as string,
      xG: null,
      xGA: null,
    }));
    return {
      leagueCode,
      leagueName: data.competition?.name ?? leagueCode,
      season: data.season?.startDate?.slice(0, 4) ?? '',
      table,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ─── TOP SCORERS ─────────────────────────────────────────────────────────────
export async function getTopScorers(leagueCode: string, limit = 5): Promise<Scorer[]> {
  try {
    const data = await fdFetch(`/competitions/${leagueCode}/scorers?limit=${limit}`);
    return (data.scorers ?? []).map((s: Record<string, unknown>) => ({
      playerName: (s.player as Record<string, unknown>)?.name as string,
      teamName: (s.team as Record<string, unknown>)?.shortName as string ?? (s.team as Record<string, unknown>)?.name as string,
      goals: s.goals as number,
      assists: s.assists as number ?? 0,
      nationality: (s.player as Record<string, unknown>)?.nationality as string,
    }));
  } catch {
    return [];
  }
}

// ─── RECENT RESULTS ──────────────────────────────────────────────────────────
export async function getRecentResults(leagueCode: string, limit = 5): Promise<Match[]> {
  try {
    const data = await fdFetch(`/competitions/${leagueCode}/matches?status=FINISHED&limit=${limit}`);
    return mapMatches(data.matches ?? []);
  } catch {
    return [];
  }
}

// ─── UPCOMING FIXTURES ───────────────────────────────────────────────────────
export async function getUpcomingFixtures(leagueCode: string, limit = 5): Promise<Match[]> {
  try {
    const data = await fdFetch(`/competitions/${leagueCode}/matches?status=SCHEDULED&limit=${limit}`);
    return mapMatches(data.matches ?? []);
  } catch {
    return [];
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function mapMatches(raw: Record<string, unknown>[]): Match[] {
  return raw.map((m) => ({
    id: m.id as number,
    homeTeam: (m.homeTeam as Record<string, unknown>)?.shortName as string ?? (m.homeTeam as Record<string, unknown>)?.name as string ?? '',
    awayTeam: (m.awayTeam as Record<string, unknown>)?.shortName as string ?? (m.awayTeam as Record<string, unknown>)?.name as string ?? '',
    homeScore: (m.score as Record<string, unknown>)?.fullTime
      ? ((m.score as Record<string, unknown>).fullTime as Record<string, unknown>).home as number | null
      : null,
    awayScore: (m.score as Record<string, unknown>)?.fullTime
      ? ((m.score as Record<string, unknown>).fullTime as Record<string, unknown>).away as number | null
      : null,
    status: m.status as Match['status'],
    minute: (m.minute as number) ?? null,
    utcDate: m.utcDate as string,
    competition: (m.competition as Record<string, unknown>)?.name as string ?? '',
    competitionCode: (m.competition as Record<string, unknown>)?.code as string ?? '',
  }));
}
