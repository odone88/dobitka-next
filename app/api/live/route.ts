import { NextRequest, NextResponse } from 'next/server';
import { getLiveMatches, getTodayMatches, getMatchesByDate } from '@/lib/data-sources/football-data';

export const revalidate = 60;

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
    return NextResponse.json({ live, today: merged, updatedAt: new Date().toISOString() });
  }

  // Historical/future date
  const matches = await getMatchesByDate(dateParam!);
  return NextResponse.json({ live: [], today: matches, updatedAt: new Date().toISOString() });
}
