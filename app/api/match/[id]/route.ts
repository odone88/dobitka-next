import { NextResponse } from 'next/server';
import { getMatchFull } from '@/lib/data-sources/football-data';

// Cache match detail for 2 min — prevents rate limiting
export const revalidate = 120;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const matchId = parseInt(id, 10);
  if (isNaN(matchId) || matchId < 1 || matchId > 9999999) {
    return NextResponse.json({ error: 'Invalid match ID' }, { status: 400 });
  }

  const data = await getMatchFull(matchId);
  if (!data) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
