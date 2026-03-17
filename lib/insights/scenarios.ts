import type { StandingRow, LeagueInsights, ScenarioInsight } from '@/types';

/**
 * Simple Bayesian-style probability estimates based on:
 * - Current points gap
 * - Games remaining
 * - Form (last 5)
 * Uses logistic function to convert point gaps to probabilities.
 * This is an approximation — not a Monte Carlo simulation.
 * Clearly labeled as estimates.
 */

interface StandingWithGames extends StandingRow {
  gamesRemaining: number;
}

function formPoints(form: string): number {
  if (!form) return 0;
  let pts = 0;
  for (const ch of form.replace(/,/g, '')) {
    if (ch === 'W') pts += 3;
    else if (ch === 'D') pts += 1;
  }
  return pts;
}

function logistic(x: number, scale = 0.15): number {
  return 1 / (1 + Math.exp(-scale * x));
}

function normalize(probs: number[]): number[] {
  const sum = probs.reduce((a, b) => a + b, 0);
  if (sum === 0) return probs.map(() => 0);
  return probs.map((p) => Math.round((p / sum) * 100));
}

export function computeInsights(
  leagueCode: string,
  table: StandingRow[],
  totalRounds: number
): LeagueInsights {
  if (table.length === 0) {
    return { leagueCode, titleRace: [], relegationZone: [], euroSpots: [] };
  }

  const played = table[0].played;
  const remaining = Math.max(0, totalRounds - played);

  const rows: StandingWithGames[] = table.map((r) => ({
    ...r,
    gamesRemaining: remaining,
  }));

  const leader = rows[0];

  // Title race: top 4
  const titleCandidates = rows.slice(0, Math.min(4, rows.length));
  const titleScores = titleCandidates.map((r) => {
    const gap = r.points - leader.points; // negative for non-leaders
    const form = formPoints(r.form ?? '');
    const maxCatchable = remaining * 3;
    if (r.points < leader.points - maxCatchable) return 0.01;
    return logistic(gap * 2 + form * 0.5);
  });
  const titleProbs = normalize(titleScores);
  const titleRace: ScenarioInsight[] = titleCandidates.map((r, i) => ({
    teamName: r.teamName,
    probability: titleProbs[i],
    label: `${titleProbs[i]}% szans na tytuł`,
    color: titleProbs[i] > 50 ? 'green' : titleProbs[i] > 25 ? 'amber' : 'red',
  }));

  // Relegation zone: bottom 3 (or bottom 2 for smaller leagues)
  const n = rows.length;
  const relegZone = 3;
  const safeTeam = rows[n - relegZone - 1];
  const relegCandidates = rows.slice(Math.max(0, n - relegZone - 2));
  const relegScores = relegCandidates.map((r) => {
    const gap = safeTeam ? safeTeam.points - r.points : 0;
    const form = formPoints(r.form ?? '');
    return logistic(gap - form * 0.3, 0.2);
  });
  const relegProbs = relegScores.map((s) => Math.round(s * 100));
  const relegationZone: ScenarioInsight[] = relegCandidates.map((r, i) => ({
    teamName: r.teamName,
    probability: relegProbs[i],
    label: `${relegProbs[i]}% ryzyka spadku`,
    color: relegProbs[i] > 60 ? 'red' : relegProbs[i] > 35 ? 'amber' : 'green',
  }));

  // Euro spots: positions 2-4 (UCL), 5-6 (UEL)
  const euroRange = rows.slice(1, 6);
  const euroInsights: ScenarioInsight[] = euroRange.map((r, i) => {
    const targetPos = i < 3 ? 4 : 6; // UCL top 4, UEL top 6
    const gap = rows[targetPos - 1]?.points ?? r.points;
    const diff = r.points - gap;
    const prob = Math.round(logistic(diff * 1.5 + formPoints(r.form ?? '') * 0.3) * 100);
    return {
      teamName: r.teamName,
      probability: prob,
      label: i < 3 ? `${prob}% → UCL` : `${prob}% → UEL`,
      color: prob > 60 ? 'blue' : prob > 35 ? 'amber' : 'red',
    };
  });

  return { leagueCode, titleRace, relegationZone, euroSpots: euroInsights };
}

// Default total rounds per competition
export const TOTAL_ROUNDS: Record<string, number> = {
  PL: 38,
  PD: 38,
  SA: 38,
  BL1: 34,
  FL1: 34,
  CL: 8, // league phase
};
