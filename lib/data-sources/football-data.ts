import type { Match, MatchGoal, MatchDetail, Referee, H2HData, H2HMatch, StandingRow, LeagueStandings, Scorer } from '@/types';
import { FOOTBALL_DATA_KEY } from '@/config/sources';
import { cachedFetch } from '@/lib/cache';

const BASE = 'https://api.football-data.org/v4';
const HEADERS = { 'X-Auth-Token': FOOTBALL_DATA_KEY };

// ─── IN-MEMORY FALLBACK CACHE ────────────────────────────────────────────────
// Stores last successful response per path so 429/5xx still returns stale data.
const memCache = new Map<string, { data: unknown; ts: number }>();
const MEM_TTL = 5 * 60 * 1000; // 5 min max staleness

async function fdFetch(path: string, cacheSec = 120) {
  const cacheKey = path;

  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: HEADERS,
      next: { revalidate: cacheSec },
    });

    // Rate limited — retry once after 2s
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 2000));
      const retry = await fetch(`${BASE}${path}`, {
        headers: HEADERS,
        next: { revalidate: cacheSec },
      });
      if (retry.ok) {
        const data = await retry.json();
        memCache.set(cacheKey, { data, ts: Date.now() });
        return data;
      }
      // Retry also failed — fall through to mem cache
    } else if (res.ok) {
      const data = await res.json();
      memCache.set(cacheKey, { data, ts: Date.now() });
      return data;
    }

    // Non-OK, non-429 — try mem cache
    const cached = memCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < MEM_TTL) {
      return cached.data;
    }
    console.error(`[DOBITKA] football-data ${path}: HTTP ${res.status}`);
    throw new Error(`football-data ${path}: ${res.status}`);
  } catch (err) {
    // Network error — try mem cache before giving up
    const cached = memCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < MEM_TTL) {
      console.warn(`[DOBITKA] Using stale cache for ${path}`);
      return cached.data;
    }
    console.error(`[DOBITKA] football-data ${path} failed:`, err instanceof Error ? err.message : err);
    throw err;
  }
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
    return await fetchMatchesForDate(today, 60);
  } catch {
    return [];
  }
}

export async function getMatchesByDate(date: string): Promise<Match[]> {
  try {
    return await fetchMatchesForDate(date, 300);
  } catch {
    return [];
  }
}

// football-data.org single-day query (?dateFrom=X&dateTo=X) misses CUP matches.
// Workaround: fetch a 3-day range and filter to the target date.
async function fetchMatchesForDate(targetDate: string, cacheSec: number): Promise<Match[]> {
  const d = new Date(targetDate + 'T12:00:00Z');
  const prev = new Date(d); prev.setDate(d.getDate() - 1);
  const next = new Date(d); next.setDate(d.getDate() + 1);
  const from = prev.toISOString().slice(0, 10);
  const to = next.toISOString().slice(0, 10);

  const data = await fdFetch(`/matches?dateFrom=${from}&dateTo=${to}`, cacheSec);
  const all = mapMatches(data.matches ?? []);

  // Filter to only matches on the target date (UTC)
  return all.filter((m) => m.utcDate.slice(0, 10) === targetDate);
}

// ─── STANDINGS ───────────────────────────────────────────────────────────────
export async function getStandings(leagueCode: string): Promise<LeagueStandings | null> {
  return cachedFetch(`standings:${leagueCode}`, () => fetchStandingsRaw(leagueCode), 3600);
}

async function fetchStandingsRaw(leagueCode: string): Promise<LeagueStandings | null> {
  try {
    const data = await fdFetch(`/competitions/${leagueCode}/standings`);
    const table: StandingRow[] = (data.standings?.[0]?.table ?? []).map((row: Record<string, unknown>) => ({
      position: row.position as number,
      teamName: (row.team as Record<string, unknown>)?.name as string,
      teamShortName: ((row.team as Record<string, unknown>)?.shortName as string) ?? undefined,
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
  return cachedFetch(`scorers:${leagueCode}:${limit}`, () => fetchTopScorersRaw(leagueCode, limit), 3600);
}

async function fetchTopScorersRaw(leagueCode: string, limit: number): Promise<Scorer[]> {
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

// ─── SINGLE MATCH DETAILS (basic — backwards compat) ────────────────────────
export async function getMatchDetails(matchId: number): Promise<{ goals: MatchGoal[] } | null> {
  try {
    const data = await fdFetch(`/matches/${matchId}`, 300);
    const goalsRaw = (data.goals as Record<string, unknown>[]) ?? [];
    const goals: MatchGoal[] = goalsRaw.map((g) => ({
      minute: (g.minute as number) ?? 0,
      scorer: ((g.scorer as Record<string, unknown>)?.name as string) ?? 'Nieznany',
      assist: ((g.assist as Record<string, unknown>)?.name as string) ?? undefined,
      type: (g.type as MatchGoal['type']) ?? 'REGULAR',
      teamId: ((g.team as Record<string, unknown>)?.id as number) ?? 0,
    }));
    return { goals };
  } catch {
    return null;
  }
}

// ─── FULL MATCH DETAIL (match detail page) ──────────────────────────────────
export async function getMatchFull(matchId: number): Promise<MatchDetail | null> {
  try {
    const data = await fdFetch(`/matches/${matchId}`, 120);

    const homeTeamObj = data.homeTeam as Record<string, unknown>;
    const awayTeamObj = data.awayTeam as Record<string, unknown>;
    const scoreObj = data.score as Record<string, unknown> | undefined;
    const fullTime = scoreObj?.fullTime as Record<string, unknown> | undefined;
    const halfTime = scoreObj?.halfTime as Record<string, unknown> | undefined;
    const compObj = data.competition as Record<string, unknown>;

    const goalsRaw = (data.goals as Record<string, unknown>[]) ?? [];
    const goals: MatchGoal[] = goalsRaw.map((g) => ({
      minute: (g.minute as number) ?? 0,
      scorer: ((g.scorer as Record<string, unknown>)?.name as string) ?? 'Nieznany',
      assist: ((g.assist as Record<string, unknown>)?.name as string) ?? undefined,
      type: (g.type as MatchGoal['type']) ?? 'REGULAR',
      teamId: ((g.team as Record<string, unknown>)?.id as number) ?? 0,
    }));

    const refereesRaw = (data.referees as Record<string, unknown>[]) ?? [];
    const referees: Referee[] = refereesRaw.map((r) => ({
      name: (r.name as string) ?? '',
      type: (r.type as string) ?? 'REFEREE',
      nationality: (r.nationality as string) ?? undefined,
    }));

    const detail: MatchDetail = {
      id: data.id as number,
      homeTeam: (homeTeamObj?.shortName as string) ?? (homeTeamObj?.name as string) ?? '',
      awayTeam: (awayTeamObj?.shortName as string) ?? (awayTeamObj?.name as string) ?? '',
      homeTeamId: (homeTeamObj?.id as number) ?? 0,
      awayTeamId: (awayTeamObj?.id as number) ?? 0,
      homeCrest: (homeTeamObj?.crest as string) ?? undefined,
      awayCrest: (awayTeamObj?.crest as string) ?? undefined,
      homeScore: fullTime ? (fullTime.home as number | null) : null,
      awayScore: fullTime ? (fullTime.away as number | null) : null,
      halfTimeHome: halfTime ? (halfTime.home as number | null) : null,
      halfTimeAway: halfTime ? (halfTime.away as number | null) : null,
      status: data.status as MatchDetail['status'],
      minute: (data.minute as number) ?? null,
      utcDate: data.utcDate as string,
      competition: (compObj?.name as string) ?? '',
      competitionCode: (compObj?.code as string) ?? '',
      competitionEmblem: (compObj?.emblem as string) ?? undefined,
      matchday: (data.matchday as number) ?? undefined,
      venue: (data.venue as string) ?? undefined,
      goals,
      referees,
    };

    // H2H: pobierz ostatnie spotkania tych druzyn (osobny request)
    try {
      const h2hData = await fdFetch(`/matches/${matchId}/head2head?limit=5`, 3600);
      if (h2hData?.resultSet && h2hData?.matches) {
        const resultSet = h2hData.resultSet as Record<string, unknown>;
        const h2hMatches = (h2hData.matches as Record<string, unknown>[]) ?? [];

        const lastMatches: H2HMatch[] = h2hMatches.map((m) => {
          const ht = m.homeTeam as Record<string, unknown>;
          const at = m.awayTeam as Record<string, unknown>;
          const sc = m.score as Record<string, unknown>;
          const ft = sc?.fullTime as Record<string, unknown>;
          return {
            date: m.utcDate as string,
            homeTeam: (ht?.shortName as string) ?? (ht?.name as string) ?? '',
            awayTeam: (at?.shortName as string) ?? (at?.name as string) ?? '',
            homeScore: (ft?.home as number) ?? 0,
            awayScore: (ft?.away as number) ?? 0,
            competition: ((m.competition as Record<string, unknown>)?.name as string) ?? '',
          };
        });

        detail.head2head = {
          numberOfMatches: (resultSet.count as number) ?? 0,
          homeWins: (resultSet.homeTeamWins as number) ?? 0,
          awayWins: (resultSet.awayTeamWins as number) ?? 0,
          draws: (resultSet.draws as number) ?? 0,
          lastMatches,
        };
      }
    } catch {
      // H2H to bonus — nie blokuj strony jesli sie nie uda
    }

    return detail;
  } catch {
    return null;
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
      homeCrest: (homeTeamObj?.crest as string) ?? undefined,
      awayCrest: (awayTeamObj?.crest as string) ?? undefined,
      homeScore: fullTime ? (fullTime.home as number | null) : null,
      awayScore: fullTime ? (fullTime.away as number | null) : null,
      status: m.status as Match['status'],
      minute: (m.minute as number) ?? null,
      utcDate: m.utcDate as string,
      competition: (m.competition as Record<string, unknown>)?.name as string ?? '',
      competitionCode: (m.competition as Record<string, unknown>)?.code as string ?? '',
      competitionEmblem: (m.competition as Record<string, unknown>)?.emblem as string ?? undefined,
      goals,
      halfTime: htHome !== null && htAway !== null ? `${htHome}–${htAway}` : undefined,
    };
  });
}
