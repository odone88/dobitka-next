// ─── MATCHES ────────────────────────────────────────────────────────────────
export type MatchStatus = 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'SCHEDULED' | 'TIMED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  minute?: number | null;
  utcDate: string;
  competition: string;
  competitionCode: string;
}

// ─── STANDINGS ───────────────────────────────────────────────────────────────
export interface StandingRow {
  position: number;
  teamName: string;
  teamCrest?: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form?: string; // "WWDLL"
  xG?: number | null;
  xGA?: number | null;
}

export interface LeagueStandings {
  leagueCode: string;
  leagueName: string;
  season: string;
  table: StandingRow[];
  updatedAt: string;
}

// ─── SCORERS ────────────────────────────────────────────────────────────────
export interface Scorer {
  playerName: string;
  teamName: string;
  goals: number;
  assists?: number;
  nationality?: string;
}

// ─── NEWS / FEEDS ────────────────────────────────────────────────────────────
export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: 'reddit' | 'youtube' | 'weszlo' | 'editorial' | 'bbc' | 'guardian';
  subreddit?: string;
  score?: number;
  comments?: number;
  publishedAt: string;
  thumbnail?: string;
  isHot?: boolean;
  description?: string;
}

// ─── TRANSFERS ──────────────────────────────────────────────────────────────
export type TransferStatus = 'confirmed' | 'rumour' | 'loan' | 'done';

export interface Transfer {
  player: string;
  fromClub: string;
  toClub: string;
  status: TransferStatus;
  fee?: string;
  source: string;
  publishedAt: string;
}

// ─── INSIGHTS ────────────────────────────────────────────────────────────────
export interface ScenarioInsight {
  teamName: string;
  probability: number; // 0-100
  label: string;
  color: 'green' | 'amber' | 'red' | 'blue';
}

export interface LeagueInsights {
  leagueCode: string;
  titleRace: ScenarioInsight[];
  relegationZone: ScenarioInsight[];
  euroSpots: ScenarioInsight[];
}

// ─── FEATURED TEAM ──────────────────────────────────────────────────────────
export interface FeaturedTeam {
  name: string;
  badge?: string;
  banner?: string;
  bio?: string;
  formed?: string;
  stadium?: string;
  country?: string;
  website?: string;
}

// ─── DAILY FACTS ────────────────────────────────────────────────────────────
export interface DailyFact {
  text: string;
  source?: string;
}

// ─── API RESPONSE WRAPPERS ──────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  cachedAt?: string;
}
