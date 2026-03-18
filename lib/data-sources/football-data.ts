import type { Match, MatchGoal, StandingRow, LeagueStandings, Scorer } from '@/types';
import { FOOTBALL_DATA_KEY } from '@/config/sources';

const BASE = 'https://api.football-data.org/v4';
const HEADERS = { 'X-Auth-Token': FOOTBALL_DATA_KEY };

async function fdFetch(path: string, cacheSec = 120) {
  const res = await fetch(`${BASE}${path}`, {
    headers: HEADERS,
    next: { revalidate: cacheSec },
  });
  if (!res.ok) throw new Error(`football-data ${path}: ${res.status}`);
  return res.json();
}

// ─── LIVE / TODAY MATCHES ────────────────────────────────────────────────────
export async function getLiveMatches(): Promise<Match[]> {
  try {
    const data = await fdFetch('/matches?status=LIVE', 30);
    return mapMatches(data.matches ?? []);
  } catch {
    return [];
  }
}

export async function getTodayMatches(): Promise<Match[]> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const data = await fdFetch(`/matches?dateFrom=${today}&dateTo=${today}`, 60);
    return mapMatches(data.matches ?? []);
  } catch {
    return [];
  }
}

export async function getMatchesByDate(date: string): Promise<Match[]> {
  try {
    const data = await fdFetch(`/matches?dateFrom=${date}&dateTo=${date}`, 300);
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

// ─── MATCH DETAILS (goals, assists) ─────────────────────────────────────────
// The /matches list endpoint doesn't include goal events.
// Fetch /matches/{id} for up to 4 matches to stay within rate limits (10 req/min).
export async function enrichMatchesWithGoals(matches: Match[]): Promise<Match[]> {
  try {
  const toEnrich = matches
    .filter((m) => m.status === 'FINISHED' || m.status === 'IN_PLAY' || m.status === 'LIVE' || m.status === 'PAUSED')
    .filter((m) => m.homeScore !== null && m.homeScore + (m.awayScore ?? 0) > 0)
    .slice(0, 4);

  if (toEnrich.length === 0) return matches;

  const details = await Promise.allSettled(
    toEnrich.map((m) => fdFetch(`/matches/${m.id}`, m.status === 'FINISHED' ? 3600 : 60))
  );

  const goalsMap = new Map<number, MatchGoal[]>();
  for (let i = 0; i < toEnrich.length; i++) {
    const result = details[i];
    if (result.status !== 'fulfilled') continue;
    const data = result.value;
    const goalsRaw = (data.goals as Record<string, unknown>[]) ?? [];
    if (goalsRaw.length === 0) continue;
    goalsMap.set(toEnrich[i].id, goalsRaw.map((g) => ({
      minute: (g.minute as number) ?? 0,
      scorer: ((g.scorer as Record<string, unknown>)?.name as string) ?? 'Nieznany',
      assist: ((g.assist as Record<string, unknown>)?.name as string) ?? undefined,
      type: (g.type as MatchGoal['type']) ?? 'REGULAR',
      teamId: ((g.team as Record<string, unknown>)?.id as number) ?? 0,
    })));
  }

  return matches.map((m) => {
    const goals = goalsMap.get(m.id);
    return goals ? { ...m, goals } : m;
  });
  } catch {
    return matches; // fallback: return matches without goals on any error
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function mapMatches(raw: Record<string, unknown>[]): Match[] {
  return raw.map((m) => {
    const homeTeamObj = m.homeTeam as Record<string, unknown>;
    const awayTeamObj = m.awayTeam as Record<string, unknown>;
    const scoreObj = m.score as Record<string, unknown> | undefined;
    const fullTime = scoreObj?.fullTime as Record<string, unknown> | undefined;
    const halfTime = scoreObj?.halfTime as Record<string, unknown> | undefined;

    const htHome = halfTime?.home as number | null ?? null;
    const htAway = halfTime?.away as number | null ?? null;

    // Extract goals with scorer + assist
    const goalsRaw = (m.goals as Record<string, unknown>[]) ?? [];
    const goals: MatchGoal[] = goalsRaw.map((g) => ({
      minute: (g.minute as number) ?? 0,
      scorer: ((g.scorer as Record<string, unknown>)?.name as string) ?? 'Nieznany',
      assist: ((g.assist as Record<string, unknown>)?.name as string) ?? undefined,
      type: (g.type as MatchGoal['type']) ?? 'REGULAR',
      teamId: ((g.team as Record<string, unknown>)?.id as number) ?? 0,
    }));

    return {
      id: m.id as number,
      homeTeam: (homeTeamObj?.shortName as string) ?? (homeTeamObj?.name as string) ?? '',
      awayTeam: (awayTeamObj?.shortName as string) ?? (awayTeamObj?.name as string) ?? '',
      homeTeamId: (homeTeamObj?.id as number) ?? 0,
      awayTeamId: (awayTeamObj?.id as number) ?? 0,
      homeScore: fullTime ? (fullTime.home as number | null) : null,
      awayScore: fullTime ? (fullTime.away as number | null) : null,
      status: m.status as Match['status'],
      minute: (m.minute as number) ?? null,
      utcDate: m.utcDate as string,
      competition: (m.competition as Record<string, unknown>)?.name as string ?? '',
      competitionCode: (m.competition as Record<string, unknown>)?.code as string ?? '',
      goals,
      halfTime: htHome !== null && htAway !== null ? `${htHome}–${htAway}` : undefined,
    };
  });
}
