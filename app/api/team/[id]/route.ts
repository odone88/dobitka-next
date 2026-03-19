import { NextResponse } from 'next/server';
import { FOOTBALL_DATA_KEY } from '@/config/sources';

const BASE = 'https://api.football-data.org/v4';
const HEADERS = { 'X-Auth-Token': FOOTBALL_DATA_KEY };

export const revalidate = 86400; // 24h — dane druzyny sie rzadko zmieniaja

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const teamId = parseInt(id, 10);
  if (isNaN(teamId)) {
    return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
  }

  try {
    // Pobierz dane druzyny + najblizsze mecze rownolegle
    const [teamRes, matchesRes] = await Promise.all([
      fetch(`${BASE}/teams/${teamId}`, {
        headers: HEADERS,
        next: { revalidate: 86400 },
      }),
      fetch(`${BASE}/teams/${teamId}/matches?status=SCHEDULED&limit=3`, {
        headers: HEADERS,
        next: { revalidate: 3600 },
      }).catch(() => null),
    ]);

    if (!teamRes.ok) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const teamData = await teamRes.json();

    // Ostatnie wyniki
    let recentMatches: unknown[] = [];
    try {
      const recentRes = await fetch(`${BASE}/teams/${teamId}/matches?status=FINISHED&limit=5`, {
        headers: HEADERS,
        next: { revalidate: 3600 },
      });
      if (recentRes.ok) {
        const recentData = await recentRes.json();
        recentMatches = (recentData.matches ?? []).map((m: Record<string, unknown>) => {
          const sc = m.score as Record<string, unknown>;
          const ft = sc?.fullTime as Record<string, unknown>;
          const ht = m.homeTeam as Record<string, unknown>;
          const at = m.awayTeam as Record<string, unknown>;
          const isHome = (ht?.id as number) === teamId;
          const homeScore = (ft?.home as number) ?? 0;
          const awayScore = (ft?.away as number) ?? 0;
          const result = isHome
            ? (homeScore > awayScore ? 'W' : homeScore < awayScore ? 'L' : 'D')
            : (awayScore > homeScore ? 'W' : awayScore < homeScore ? 'L' : 'D');
          return {
            id: m.id,
            homeTeam: (ht?.shortName as string) ?? (ht?.name as string) ?? '',
            awayTeam: (at?.shortName as string) ?? (at?.name as string) ?? '',
            homeScore,
            awayScore,
            date: m.utcDate,
            competition: ((m.competition as Record<string, unknown>)?.name as string) ?? '',
            result,
          };
        });
      }
    } catch { /* silent */ }

    // Nadchodzace mecze
    let upcomingMatches: unknown[] = [];
    if (matchesRes?.ok) {
      const matchesData = await matchesRes.json();
      upcomingMatches = (matchesData.matches ?? []).slice(0, 3).map((m: Record<string, unknown>) => {
        const ht = m.homeTeam as Record<string, unknown>;
        const at = m.awayTeam as Record<string, unknown>;
        return {
          id: m.id,
          homeTeam: (ht?.shortName as string) ?? (ht?.name as string) ?? '',
          awayTeam: (at?.shortName as string) ?? (at?.name as string) ?? '',
          date: m.utcDate,
          competition: ((m.competition as Record<string, unknown>)?.name as string) ?? '',
        };
      });
    }

    // Skład drużyny
    const squad = ((teamData.squad as Record<string, unknown>[]) ?? []).map((p) => ({
      id: p.id as number,
      name: p.name as string,
      position: p.position as string,
      nationality: p.nationality as string,
      dateOfBirth: p.dateOfBirth as string,
    }));

    return NextResponse.json({
      id: teamData.id,
      name: teamData.name,
      shortName: teamData.shortName ?? teamData.tla,
      crest: teamData.crest,
      address: teamData.address,
      website: teamData.website,
      founded: teamData.founded,
      venue: teamData.venue,
      clubColors: teamData.clubColors,
      coach: teamData.coach ? {
        name: (teamData.coach as Record<string, unknown>).name,
        nationality: (teamData.coach as Record<string, unknown>).nationality,
      } : null,
      squad,
      recentMatches,
      upcomingMatches,
      competitions: ((teamData.runningCompetitions as Record<string, unknown>[]) ?? []).map((c) => ({
        name: c.name as string,
        code: c.code as string,
        emblem: c.emblem as string,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 500 });
  }
}
