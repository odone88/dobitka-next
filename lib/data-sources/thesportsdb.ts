import type { FeaturedTeam } from '@/types';

const BASE = 'https://www.thesportsdb.com/api/v1/json/3';

export async function getFeaturedTeam(teamId: string): Promise<FeaturedTeam | null> {
  try {
    const res = await fetch(`${BASE}/lookupteam.php?id=${teamId}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const t = data.teams?.[0];
    if (!t) return null;
    return {
      name: t.strTeam,
      badge: t.strTeamBadge,
      banner: t.strTeamBanner ?? t.strTeamJersey,
      bio: t.strDescriptionEN ?? '',
      formed: t.intFormedYear,
      stadium: t.strStadium,
      country: t.strCountry,
      website: t.strWebsite,
    };
  } catch {
    return null;
  }
}

// Rotating list of well-known club IDs from TheSportsDB
export const FEATURED_TEAM_IDS: Record<string, string> = {
  'Barcelona': '133739',
  'Real Madrid': '133604',
  'Manchester City': '133613',
  'Liverpool': '133602',
  'Chelsea': '133610',
  'Arsenal': '133612',
  'Juventus': '133547',
  'Bayern Munich': '133661',
  'PSG': '133724',
  'AC Milan': '133549',
  'Atletico Madrid': '133906',
  'Borussia Dortmund': '133668',
  'Napoli': '133538',
  'Inter Milan': '133541',
};

export function getTodayFeaturedTeamId(): string {
  const keys = Object.keys(FEATURED_TEAM_IDS);
  const dayOfMonth = new Date().getDate();
  const key = keys[dayOfMonth % keys.length];
  return FEATURED_TEAM_IDS[key];
}
