import { NextRequest, NextResponse } from 'next/server';
import { getLiveMatches, getTodayMatches, getMatchesByDate } from '@/lib/data-sources/football-data';

// ISR cache — user requests never hit football-data.org directly
export const revalidate = 30;

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get('date');

  // Validate date format (YYYY-MM-DD)
  if (dateParam && !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const isToday = !dateParam || dateParam === today;

  try {
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

    const matches = await getMatchesByDate(dateParam!);
    return NextResponse.json({ live: [], today: matches, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ live: [], today: [], updatedAt: new Date().toISOString(), error: true });
  }
}
