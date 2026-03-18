import { NextResponse } from 'next/server';
import { getUCLBracket } from '@/lib/data-sources/ucl-bracket';

export const revalidate = 300;

export async function GET() {
  const { rounds, defaultIdx, todayTeams, subtitle } = await getUCLBracket();
  return NextResponse.json({ rounds, defaultIdx, todayTeams, subtitle, updatedAt: new Date().toISOString() });
}
