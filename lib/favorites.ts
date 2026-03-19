// Lista popularnych druzyn do wyboru w onboardingu
// ID z football-data.org
export interface FavoriteTeam {
  id: number;
  name: string;
  shortName: string;
  crest?: string;
  league: string;
}

export const POPULAR_TEAMS: FavoriteTeam[] = [
  // Premier League
  { id: 57, name: 'Arsenal FC', shortName: 'Arsenal', league: 'PL' },
  { id: 65, name: 'Manchester City FC', shortName: 'Man City', league: 'PL' },
  { id: 64, name: 'Liverpool FC', shortName: 'Liverpool', league: 'PL' },
  { id: 61, name: 'Chelsea FC', shortName: 'Chelsea', league: 'PL' },
  { id: 66, name: 'Manchester United FC', shortName: 'Man United', league: 'PL' },
  { id: 73, name: 'Tottenham Hotspur FC', shortName: 'Tottenham', league: 'PL' },
  { id: 58, name: 'Aston Villa FC', shortName: 'Aston Villa', league: 'PL' },
  { id: 67, name: 'Newcastle United FC', shortName: 'Newcastle', league: 'PL' },

  // La Liga
  { id: 81, name: 'FC Barcelona', shortName: 'Barcelona', league: 'PD' },
  { id: 86, name: 'Real Madrid CF', shortName: 'Real Madrid', league: 'PD' },
  { id: 78, name: 'Club Atletico de Madrid', shortName: 'Atletico', league: 'PD' },

  // Serie A
  { id: 108, name: 'FC Internazionale Milano', shortName: 'Inter', league: 'SA' },
  { id: 98, name: 'AC Milan', shortName: 'Milan', league: 'SA' },
  { id: 109, name: 'Juventus FC', shortName: 'Juventus', league: 'SA' },
  { id: 113, name: 'SSC Napoli', shortName: 'Napoli', league: 'SA' },

  // Bundesliga
  { id: 5, name: 'FC Bayern Munchen', shortName: 'Bayern', league: 'BL1' },
  { id: 4, name: 'Borussia Dortmund', shortName: 'Dortmund', league: 'BL1' },
  { id: 721, name: 'RB Leipzig', shortName: 'Leipzig', league: 'BL1' },

  // Ligue 1
  { id: 524, name: 'Paris Saint-Germain FC', shortName: 'PSG', league: 'FL1' },
  { id: 516, name: 'Olympique de Marseille', shortName: 'Marseille', league: 'FL1' },

  // Polska (ID szacowane — football-data moze nie miec)
  { id: 5765, name: 'Legia Warszawa', shortName: 'Legia', league: 'EKL' },
  { id: 5764, name: 'Lech Poznan', shortName: 'Lech', league: 'EKL' },
];

const STORAGE_KEY = 'dobitka_favorites';

export function getFavoriteIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setFavoriteIds(ids: number[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function toggleFavorite(id: number): number[] {
  const current = getFavoriteIds();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  setFavoriteIds(next);
  return next;
}

export function isFavorite(id: number): boolean {
  return getFavoriteIds().includes(id);
}

// Sprawdz czy mecz dotyczy ulubionej druzyny
export function matchInvolvesFavorite(homeTeamId: number, awayTeamId: number, favoriteIds: number[]): boolean {
  return favoriteIds.includes(homeTeamId) || favoriteIds.includes(awayTeamId);
}

// Sprawdz czy to pierwszy raz (nie ma ustawionych ulubionych)
export function isFirstVisit(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === null;
}

export function markOnboardingDone() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(STORAGE_KEY) === null) {
    localStorage.setItem(STORAGE_KEY, '[]');
  }
}
