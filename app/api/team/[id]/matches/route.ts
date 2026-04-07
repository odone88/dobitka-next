import { NextResponse } from 'next/server';
import { FOOTBALL_DATA_KEY } from '@/config/sources';

const BASE = 'https://api.football-data.org/v4';
const HEADERS = { 'X-Auth-Token': FOOTBALL_DATA_KEY };

export const revalidate = 1800; // 30min

interface TeamMatchResponse {
  recent: MatchSummary[];
  upcoming: MatchSummary[];
}

interface MatchSummary {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeCrest: string;
  awayCrest: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  competition: string;
  competitionEmblem: string;
  result?: string; // W/D/L — only for recent
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const teamId = parseInt(id, 10);
  if (isNaN(teamId) || teamId < 1 || teamId > 99999) {
    return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
  }

  try {
    const [recentRes, upcomingRes] = await Promise.all([
      fetch(`${BASE}/teams/${teamId}/matches?status=FINISHED&limit=5`, {
        headers: HEADERS,
        next: { revalidate: 1800 },
      }),
      fetch(`${BASE}/teams/${teamId}/matches?status=SCHEDULED&limit=5`, {
        headers: HEADERS,
        next: { revalidate: 1800 },
      }),
    ]);

    const recent: MatchSummary[] = [];
    const upcoming: MatchSummary[] = [];

    if (recentRes.ok) {
      const data = await recentRes.json();
      for (const m of data.matches ?? []) {
        const ht = m.homeTeam as Record<string, unknown>;
        const at = m.awayTeam as Record<string, unknown>;
        const sc = m.score as Record<string, unknown>;
        const ft = sc?.fullTime as Record<string, unknown>;
        const comp = m.competition as Record<string, unknown>;
        const homeScore = (ft?.home as number) ?? 0;
        const awayScore = (ft?.away as number) ?? 0;
        const isHome = (ht?.id as number) === teamId;
        const result = isHome
          ? homeScore > awayScore ? 'W' : homeScore < awayScore ? 'L' : 'D'
          : awayScore > homeScore ? 'W' : awayScore < homeScore ? 'L' : 'D';

        recent.push({
          id: m.id as number,
          homeTeam: (ht?.shortName as string) ?? (ht?.name as string) ?? '',
          awayTeam: (at?.shortName as string) ?? (at?.name as string) ?? '',
          homeCrest: (ht?.crest as string) ?? '',
          awayCrest: (at?.crest as string) ?? '',
          homeScore,
          awayScore,
          date: m.utcDate as string,
          competition: (comp?.name as string) ?? '',
          competitionEmblem: (comp?.emblem as string) ?? '',
          result,
        });
      }
    }

    if (upcomingRes.ok) {
      const data = await upcomingRes.json();
      for (const m of data.matches ?? []) {
        const ht = m.homeTeam as Record<string, unknown>;
        const at = m.awayTeam as Record<string, unknown>;
        const comp = m.competition as Record<string, unknown>;

        upcoming.push({
          id: m.id as number,
          homeTeam: (ht?.shortName as string) ?? (ht?.name as string) ?? '',
          awayTeam: (at?.shortName as string) ?? (at?.name as string) ?? '',
          homeCrest: (ht?.crest as string) ?? '',
          awayCrest: (at?.crest as string) ?? '',
          homeScore: null,
          awayScore: null,
          date: m.utcDate as string,
          competition: (comp?.name as string) ?? '',
          competitionEmblem: (comp?.emblem as string) ?? '',
        });
      }
    }

    return NextResponse.json({ recent, upcoming } satisfies TeamMatchResponse);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
