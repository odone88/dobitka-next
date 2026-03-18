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
  leg: number;
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
};

// One-liner editorial comments per result type
function generateComment(home: string, away: string, hs: number, as_: number): string {
  const diff = hs - as_;
  const winner = diff > 0 ? home : diff < 0 ? away : null;
  const loser = diff > 0 ? away : diff < 0 ? home : null;
  if (!winner) return `Remis — wszystko zostaje otwarte na rewanż.`;
  if (Math.abs(diff) >= 3) return `${winner} rozbił ${loser} — rewanż to formalność.`;
  if (Math.abs(diff) === 2) return `${winner} kontroluje — ${loser} potrzebuje przełomu.`;
  return `${winner} jedną nogą dalej, ale ${loser} wciąż żyje.`;
}

export async function getUCLBracket(): Promise<BracketRound[]> {
  try {
    const res = await fetch(`${BASE}/competitions/CL/matches?season=2024`, {
      headers: HEADERS,
      next: { revalidate: 1800 },
    });
    if (!res.ok) throw new Error(`UCL matches: ${res.status}`);
    const data = await res.json();
    const allMatches: Record<string, unknown>[] = data.matches ?? [];

    // Filter knockout stages only
    const knockoutStages = ['ROUND_OF_16', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'];
    const knockout = allMatches.filter((m) =>
      knockoutStages.includes(m.stage as string)
    );

    if (knockout.length === 0) {
      // Fallback: show last league phase matches
      const leaguePhase = allMatches
        .filter((m) => (m.stage as string) === 'LEAGUE_PHASE')
        .slice(-16);
      return groupByStage(leaguePhase, 'LEAGUE_PHASE');
    }

    return groupByStage(knockout);
  } catch {
    return [];
  }
}

function groupByStage(matches: Record<string, unknown>[], forceStage?: string): BracketRound[] {
  const byStage: Record<string, BracketMatch[]> = {};

  for (const m of matches) {
    const stage = forceStage ?? (m.stage as string);
    if (!byStage[stage]) byStage[stage] = [];

    const hs = ((m.score as Record<string, unknown>)?.fullTime as Record<string, unknown>)?.home as number | null ?? null;
    const as_ = ((m.score as Record<string, unknown>)?.fullTime as Record<string, unknown>)?.away as number | null ?? null;
    const isFinished = m.status === 'FINISHED';

    const bm: BracketMatch = {
      id: m.id as number,
      stage,
      homeTeam: ((m.homeTeam as Record<string, unknown>)?.shortName ?? (m.homeTeam as Record<string, unknown>)?.name ?? '?') as string,
      awayTeam: ((m.awayTeam as Record<string, unknown>)?.shortName ?? (m.awayTeam as Record<string, unknown>)?.name ?? '?') as string,
      homeCrest: (m.homeTeam as Record<string, unknown>)?.crest as string,
      awayCrest: (m.awayTeam as Record<string, unknown>)?.crest as string,
      homeScore: hs,
      awayScore: as_,
      status: m.status as Match['status'],
      utcDate: m.utcDate as string,
      leg: (m.matchday as number) ?? 1,
      comment: isFinished && hs !== null && as_ !== null
        ? generateComment(
            ((m.homeTeam as Record<string, unknown>)?.shortName ?? '') as string,
            ((m.awayTeam as Record<string, unknown>)?.shortName ?? '') as string,
            hs, as_
          )
        : undefined,
    };
    byStage[stage].push(bm);
  }

  const order = ['ROUND_OF_16', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL', 'LEAGUE_PHASE'];
  return order
    .filter((s) => byStage[s])
    .map((s) => ({
      stage: s,
      label: STAGE_LABELS[s] ?? s,
      matches: byStage[s],
    }));
}
