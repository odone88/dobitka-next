import { NextResponse } from 'next/server';
import { getLiveMatches, getTodayMatches } from '@/lib/data-sources/football-data';

export const revalidate = 60; // refresh every 60s

export async function GET() {
  const [live, today] = await Promise.all([getLiveMatches(), getTodayMatches()]);

  // Merge: live matches take priority, dedup by id
  const seen = new Set<number>();
  const merged = [...live, ...today].filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  return NextResponse.json({ live, today: merged, updatedAt: new Date().toISOString() });
}
