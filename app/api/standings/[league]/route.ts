import { NextResponse } from 'next/server';
import { getStandings, getTopScorers } from '@/lib/data-sources/football-data';
import { computeInsights, TOTAL_ROUNDS } from '@/lib/insights/scenarios';

export const revalidate = 3600; // 1h

const VALID_LEAGUES = new Set(['PL', 'PD', 'SA', 'BL1', 'FL1', 'BSA', 'PPL', 'DED', 'ELC', 'CL']);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ league: string }> }
) {
  const { league } = await params;

  // Validate league code to prevent arbitrary API calls
  if (!VALID_LEAGUES.has(league)) {
    return NextResponse.json({ error: 'Invalid league code' }, { status: 400 });
  }

  const [standings, scorers] = await Promise.all([
    getStandings(league),
    getTopScorers(league, 5),
  ]);

  if (!standings) {
    return NextResponse.json({ error: 'League not found' }, { status: 404 });
  }

  const insights = computeInsights(league, standings.table, TOTAL_ROUNDS[league] ?? 38);

  return NextResponse.json({ standings, scorers, insights });
}
