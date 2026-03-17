import { NextResponse } from 'next/server';
import { getFeaturedTeam, getTodayFeaturedTeamId } from '@/lib/data-sources/thesportsdb';

export const revalidate = 86400; // 24h

export async function GET() {
  const teamId = getTodayFeaturedTeamId();
  const team = await getFeaturedTeam(teamId);
  return NextResponse.json({ team });
}
