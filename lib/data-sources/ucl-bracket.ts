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
  comment?: string;
}

export interface BracketRound {
  stage: string;
  label: string;
  matches: BracketMatch[];
}

const STAGE_LABELS: Record<string, string> = {
  LAST_16: 'Runda 1/16',
  ROUND_OF_16: '1/8 Finału',
  QUARTER_FINALS: 'Ćwierćfinały',
  SEMI_FINALS: 'Półfinały',
  FINAL: 'Finał',
  LEAGUE_PHASE: 'Faza Ligowa',
};

// Compute current UCL season year (season starts ~July)
function currentSeason(): number {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
}

function generateComment(home: string, away: string, hs: number, as_: number): string {
  const diff = hs - as_;
  if (diff === 0) return `Remis — wszystko otwarte na rewanż.`;
  const winner = diff > 0 ? home : away;
  const loser = diff > 0 ? away : home;
  if (Math.abs(diff) >= 3) return `${winner} rozkłada ${loser} — rewanż to formalność.`;
  if (Math.abs(diff) === 2) return `${winner} w dobrej pozycji. ${loser} potrzebuje przełomu.`;
  return `${winner} jedną nogą dalej, ale ${loser} wciąż żyje.`;
}

export async function getUCLBracket(): Promise<BracketRound[]> {
  const season = currentSeason();
  try {
    const res = await fetch(`${BASE}/competitions/CL/matches?season=${season}`, {
      headers: HEADERS,
      next: { revalidate: 300 }, // ← 5 min (was 30 min — too stale for live knockout)
    });
    if (!res.ok) throw new Error(`UCL ${res.status}`);
    const data = await res.json();
    const allMatches: Record<string, unknown>[] = data.matches ?? [];

    const knockoutStages = ['ROUND_OF_16', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'];
    const knockout = allMatches.filter((m) => knockoutStages.includes(m.stage as string));

    if (knockout.length > 0) {
      return groupByStage(knockout);
    }

    // Fallback: show last 8 league phase matches (most recent)
    const leaguePhase = allMatches
      .filter((m) => (m.stage as string) === 'LEAGUE_PHASE')
      .sort((a, b) => new Date(b.utcDate as string).getTime() - new Date(a.utcDate as string).getTime())
      .slice(0, 8);

    return leaguePhase.length > 0
      ? [{ stage: 'LEAGUE_PHASE', label: 'Faza Ligowa (ostatnie)', matches: mapMatches(leaguePhase) }]
      : [];
  } catch {
    return [];
  }
}

function groupByStage(matches: Record<string, unknown>[]): BracketRound[] {
  const byStage: Record<string, BracketMatch[]> = {};
  for (const m of matches) {
    const stage = m.stage as string;
    if (!byStage[stage]) byStage[stage] = [];
    byStage[stage].push(mapMatch(m));
  }

  const order = ['ROUND_OF_16', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'];
  return order
    .filter((s) => byStage[s]?.length > 0)
    .map((s) => ({ stage: s, label: STAGE_LABELS[s] ?? s, matches: byStage[s] }));
}

function mapMatches(raw: Record<string, unknown>[]): BracketMatch[] {
  return raw.map(mapMatch);
}

function mapMatch(m: Record<string, unknown>): BracketMatch {
  const hs = ((m.score as Record<string, unknown>)?.fullTime as Record<string, unknown>)?.home as number | null ?? null;
  const as_ = ((m.score as Record<string, unknown>)?.fullTime as Record<string, unknown>)?.away as number | null ?? null;
  const isFinished = m.status === 'FINISHED';
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
    // ← Comment now always generated for finished matches
    comment: isFinished && hs !== null && as_ !== null
      ? generateComment(home, away, hs, as_)
      : undefined,
  };
}
