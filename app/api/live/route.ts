import { NextRequest, NextResponse } from 'next/server';
import { getLiveMatches, getTodayMatches, getMatchesByDate, enrichMatchesWithGoals } from '@/lib/data-sources/football-data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get('date');
  const today = new Date().toISOString().slice(0, 10);
  const isToday = !dateParam || dateParam === today;

  if (isToday) {
    const [live, todayAll] = await Promise.all([getLiveMatches(), getTodayMatches()]);
    const seen = new Set<number>();
    const merged = [...live, ...todayAll].filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
    const enriched = await enrichMatchesWithGoals(merged);
    return NextResponse.json({ live, today: enriched, updatedAt: new Date().toISOString() });
  }

  const matches = await getMatchesByDate(dateParam!);
  const enriched = await enrichMatchesWithGoals(matches);
  return NextResponse.json({ live: [], today: enriched, updatedAt: new Date().toISOString() });
}
