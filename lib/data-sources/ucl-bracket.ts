import type { Match } from '@/types';
import { FOOTBALL_DATA_KEY } from '@/config/sources';

const BASE = 'https://api.football-data.org/v4';
const HEADERS = { 'X-Auth-Token': FOOTBALL_DATA_KEY };

export interface BracketMatch {
  id: number;
  stage: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  homeCrest?: string;
  awayCrest?: string;
  status: Match['status'];
  utcDate: string;
  halfTime?: string;
}

export interface BracketTie {
  team1: string;
  team2: string;
  crest1?: string;
  crest2?: string;
  leg1?: BracketMatch;
  leg2?: BracketMatch;
  agg1: number;
  agg2: number;
  winner?: string; // team name or undefined if not decided
  isLive: boolean;
}

export interface BracketRound {
  stage: string;
  label: string;
  matches: BracketMatch[];
  ties: BracketTie[];
}

const STAGE_LABELS: Record<string, string> = {
  LAST_16: '1/8 Finału',
  ROUND_OF_16: '1/8 Finału',
  QUARTER_FINALS: 'Ćwierćfinały',
  SEMI_FINALS: 'Półfinały',
  FINAL: 'Finał',
  LEAGUE_PHASE: 'Faza Ligowa',
};

const STAGE_ORDER = ['ROUND_OF_16', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'];

function currentSeason(): number {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
}

/**
 * Returns today's UCL team names (short names) for context features.
 */
export async function getTodayUCLTeams(): Promise<string[]> {
  const season = currentSeason();
  const today = new Date().toISOString().slice(0, 10);
  try {
    const res = await fetch(
      `${BASE}/competitions/CL/matches?season=${season}&dateFrom=${today}&dateTo=${today}`,
      { headers: HEADERS, next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const teams: string[] = [];
    for (const m of data.matches ?? []) {
      const h = (m.homeTeam as Record<string, unknown>)?.shortName ?? (m.homeTeam as Record<string, unknown>)?.name;
      const a = (m.awayTeam as Record<string, unknown>)?.shortName ?? (m.awayTeam as Record<string, unknown>)?.name;
      if (h) teams.push(h as string);
      if (a) teams.push(a as string);
    }
    return teams;
  } catch {
    return [];
  }
}

export async function getUCLBracket(): Promise<{ rounds: BracketRound[]; defaultIdx: number; todayTeams: string[]; subtitle: string }> {
  const season = currentSeason();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Fetch ±3 days window to find "current" action
  const from = new Date(today.getTime() - 3 * 86400000).toISOString().slice(0, 10);
  const to = new Date(today.getTime() + 3 * 86400000).toISOString().slice(0, 10);

  try {
    const res = await fetch(`${BASE}/competitions/CL/matches?season=${season}`, {
      headers: HEADERS,
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`UCL ${res.status}`);
    const data = await res.json();
    const allMatches: Record<string, unknown>[] = data.matches ?? [];

    const knockout = allMatches.filter((m) => STAGE_ORDER.includes(m.stage as string));

    if (knockout.length === 0) {
      // fallback: last 8 league phase matches
      const lp = allMatches
        .filter((m) => (m.stage as string) === 'LEAGUE_PHASE')
        .sort((a, b) => new Date(b.utcDate as string).getTime() - new Date(a.utcDate as string).getTime())
        .slice(0, 8);
      const lpMapped = mapMatches(lp);
      return {
        rounds: lp.length > 0 ? [{ stage: 'LEAGUE_PHASE', label: 'Faza Ligowa (ostatnie)', matches: lpMapped, ties: groupIntoTies(lpMapped, false) }] : [],
        defaultIdx: 0,
        todayTeams: [],
        subtitle: '',
      };
    }

    const rounds = groupByStage(knockout);

    // Determine which round to show by default:
    // 1. Round with live/today matches
    // 2. Round with closest upcoming matches (within ±3 days)
    // 3. Round with most recent finished matches
    // 4. Last round
    let defaultIdx = rounds.length - 1;
    const todayTeams: string[] = [];
    let subtitle = '';

    // Check each round for today/live/nearby matches
    for (let i = 0; i < rounds.length; i++) {
      const round = rounds[i];
      const hasLive = round.matches.some((m) => m.status === 'LIVE' || m.status === 'IN_PLAY' || m.status === 'PAUSED');
      const todayMatches = round.matches.filter((m) => m.utcDate.slice(0, 10) === todayStr);
      const nearbyScheduled = round.matches.filter((m) => {
        const d = m.utcDate.slice(0, 10);
        return d >= from && d <= to && (m.status === 'SCHEDULED' || m.status === 'TIMED');
      });

      if (hasLive) {
        defaultIdx = i;
        todayMatches.forEach((m) => { todayTeams.push(m.homeTeam, m.awayTeam); });
        const liveCount = round.matches.filter((m) => m.status === 'LIVE' || m.status === 'IN_PLAY').length;
        subtitle = `${liveCount} ${liveCount === 1 ? 'mecz na żywo' : 'mecze na żywo'} — ${round.label}`;
        break;
      }
      if (todayMatches.length > 0) {
        defaultIdx = i;
        todayMatches.forEach((m) => { todayTeams.push(m.homeTeam, m.awayTeam); });
        const scheduled = todayMatches.filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED');
        const finished = todayMatches.filter((m) => m.status === 'FINISHED');
        if (scheduled.length > 0) {
          subtitle = `Dziś ${round.label.toLowerCase()} — ${scheduled.length} ${scheduled.length === 1 ? 'mecz' : 'mecze'} do rozegrania`;
        } else if (finished.length > 0) {
          subtitle = `${round.label} — wyniki z dziś`;
        }
        break;
      }
      if (nearbyScheduled.length > 0) {
        defaultIdx = i;
        const nextDate = nearbyScheduled.sort((a, b) => a.utcDate.localeCompare(b.utcDate))[0];
        const dayLabel = new Date(nextDate.utcDate).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
        subtitle = `Najbliższe mecze ${round.label.toLowerCase()} — ${dayLabel}`;
        break;
      }
    }

    // If no nearby matches found, show round with most recent finished matches
    if (subtitle === '') {
      for (let i = rounds.length - 1; i >= 0; i--) {
        const hasFinished = rounds[i].matches.some((m) => m.status === 'FINISHED');
        if (hasFinished) {
          defaultIdx = i;
          const total = rounds[i].matches.length;
          const finished = rounds[i].matches.filter((m) => m.status === 'FINISHED').length;
          subtitle = `${rounds[i].label} — ${finished}/${total} meczów rozegranych`;
          break;
        }
      }
    }

    return { rounds, defaultIdx, todayTeams, subtitle };
  } catch {
    return { rounds: [], defaultIdx: 0, todayTeams: [], subtitle: '' };
  }
}

function groupByStage(matches: Record<string, unknown>[]): BracketRound[] {
  const byStage: Record<string, BracketMatch[]> = {};
  for (const m of matches) {
    const stage = m.stage as string;
    if (!byStage[stage]) byStage[stage] = [];
    byStage[stage].push(mapMatch(m));
  }
  return STAGE_ORDER
    .filter((s) => byStage[s]?.length > 0)
    .map((s) => ({
      stage: s,
      label: STAGE_LABELS[s] ?? s,
      matches: byStage[s],
      ties: groupIntoTies(byStage[s], s === 'FINAL'),
    }));
}

function groupIntoTies(matches: BracketMatch[], isFinal: boolean): BracketTie[] {
  if (isFinal) {
    // Final is a single match, not a two-leg tie
    return matches.map((m) => ({
      team1: m.homeTeam,
      team2: m.awayTeam,
      crest1: m.homeCrest,
      crest2: m.awayCrest,
      leg1: m,
      agg1: m.homeScore ?? 0,
      agg2: m.awayScore ?? 0,
      winner: m.status === 'FINISHED'
        ? (m.homeScore! > m.awayScore! ? m.homeTeam : m.awayScore! > m.homeScore! ? m.awayTeam : undefined)
        : undefined,
      isLive: m.status === 'LIVE' || m.status === 'IN_PLAY' || m.status === 'PAUSED',
    }));
  }

  // Group by team pair — in a two-leg tie, team A hosts leg 1, team B hosts leg 2
  const tieMap = new Map<string, BracketMatch[]>();
  for (const m of matches) {
    const key = [m.homeTeam, m.awayTeam].sort().join('|');
    if (!tieMap.has(key)) tieMap.set(key, []);
    tieMap.get(key)!.push(m);
  }

  const ties: BracketTie[] = [];
  for (const [, legs] of tieMap) {
    legs.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
    const leg1 = legs[0];
    const leg2 = legs[1];

    // team1 = home team of leg 1
    const team1 = leg1.homeTeam;
    const team2 = leg1.awayTeam;
    const crest1 = leg1.homeCrest;
    const crest2 = leg1.awayCrest;

    // Aggregate: team1 scored at home in leg1 + away in leg2
    const agg1 = (leg1.homeScore ?? 0) + (leg2 ? (leg2.awayScore ?? 0) : 0);
    const agg2 = (leg1.awayScore ?? 0) + (leg2 ? (leg2.homeScore ?? 0) : 0);

    const bothFinished = leg1.status === 'FINISHED' && (!leg2 || leg2.status === 'FINISHED');
    const isLive = legs.some((l) => l.status === 'LIVE' || l.status === 'IN_PLAY' || l.status === 'PAUSED');

    let winner: string | undefined;
    if (bothFinished && leg2) {
      winner = agg1 > agg2 ? team1 : agg2 > agg1 ? team2 : undefined; // penalties not tracked
    }

    ties.push({ team1, team2, crest1, crest2, leg1, leg2, agg1, agg2, winner, isLive });
  }

  return ties;
}

function mapMatches(raw: Record<string, unknown>[]): BracketMatch[] {
  return raw.map(mapMatch);
}

function mapMatch(m: Record<string, unknown>): BracketMatch {
  const hs = ((m.score as Record<string, unknown>)?.fullTime as Record<string, unknown>)?.home as number | null ?? null;
  const as_ = ((m.score as Record<string, unknown>)?.fullTime as Record<string, unknown>)?.away as number | null ?? null;
  const htHome = ((m.score as Record<string, unknown>)?.halfTime as Record<string, unknown>)?.home as number | null ?? null;
  const htAway = ((m.score as Record<string, unknown>)?.halfTime as Record<string, unknown>)?.away as number | null ?? null;
  const home = ((m.homeTeam as Record<string, unknown>)?.shortName ?? (m.homeTeam as Record<string, unknown>)?.name ?? '?') as string;
  const away = ((m.awayTeam as Record<string, unknown>)?.shortName ?? (m.awayTeam as Record<string, unknown>)?.name ?? '?') as string;

  return {
    id: m.id as number,
    stage: m.stage as string,
    homeTeam: home,
    awayTeam: away,
    homeCrest: (m.homeTeam as Record<string, unknown>)?.crest as string | undefined,
    awayCrest: (m.awayTeam as Record<string, unknown>)?.crest as string | undefined,
    homeScore: hs,
    awayScore: as_,
    status: m.status as Match['status'],
    utcDate: m.utcDate as string,
    halfTime: htHome !== null && htAway !== null ? `${htHome}–${htAway}` : undefined,
  };
}
