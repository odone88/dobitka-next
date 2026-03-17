import { NextResponse } from 'next/server';
import { getStandings, getTopScorers } from '@/lib/data-sources/football-data';
import { computeInsights, TOTAL_ROUNDS } from '@/lib/insights/scenarios';

export const revalidate = 3600; // 1h

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ league: string }> }
) {
  const { league } = await params;
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
