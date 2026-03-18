import { NextResponse } from 'next/server';
import { getUCLBracket } from '@/lib/data-sources/ucl-bracket';

export const revalidate = 1800;

export async function GET() {
  const rounds = await getUCLBracket();
  return NextResponse.json({ rounds, updatedAt: new Date().toISOString() });
}
