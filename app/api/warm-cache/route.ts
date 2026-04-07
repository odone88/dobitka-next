import { NextResponse } from 'next/server';
import { getStandings, getTopScorers } from '@/lib/data-sources/football-data';

// Warm Redis cache for all leagues — call on deploy or via cron
// This endpoint staggers requests to stay under 10 req/min rate limit
export const dynamic = 'force-dynamic';

const LEAGUES = ['PPL', 'PL', 'PD', 'SA', 'BL1', 'FL1', 'CL'];

export async function GET(request: Request) {
  // Simple auth check — only allow with secret header
  const auth = request.headers.get('x-warm-secret');
  if (auth !== process.env.WARM_CACHE_SECRET && process.env.WARM_CACHE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, string> = {};

  // Stagger: fetch one league every 8 seconds (stays under 10/min with 2 calls per league)
  for (const code of LEAGUES) {
    try {
      await getStandings(code);
      await getTopScorers(code, 5);
      results[code] = 'ok';
    } catch (e) {
      results[code] = `error: ${e instanceof Error ? e.message : 'unknown'}`;
    }
    // Wait 8s between leagues to respect rate limit
    if (code !== LEAGUES[LEAGUES.length - 1]) {
      await new Promise(r => setTimeout(r, 8000));
    }
  }

  return NextResponse.json({
    warmed: Object.keys(results).filter(k => results[k] === 'ok').length,
    total: LEAGUES.length,
    results,
    timestamp: new Date().toISOString()
  });
}
