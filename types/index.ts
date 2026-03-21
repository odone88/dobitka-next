// ─── MATCHES ────────────────────────────────────────────────────────────────
export type MatchStatus = 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'SCHEDULED' | 'TIMED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export interface MatchGoal {
  minute: number;
  scorer: string;
  assist?: string;
  type: 'REGULAR' | 'OWN_GOAL' | 'PENALTY';
  teamId: number;
}

export interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number;
  awayTeamId: number;
  homeCrest?: string;
  awayCrest?: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  minute?: number | null;
  utcDate: string;
  competition: string;
  competitionCode: string;
  competitionEmblem?: string;
  goals: MatchGoal[];
  halfTime?: string;
  // Future enrichment — TV broadcast & odds
  tvBroadcast?: string[];       // e.g. ['Canal+', 'Eleven Sports']
  odds?: { home: number; draw: number; away: number };
}

// ─── STANDINGS ───────────────────────────────────────────────────────────────
export interface StandingRow {
  position: number;
  teamName: string;
  teamShortName?: string;
  teamCrest?: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form?: string;
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
  source: 'reddit' | 'youtube' | 'weszlo' | 'editorial' | 'bbc' | 'guardian' | 'tvpsport' | 'sportpl';
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
  probability: number;
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

// ─── MATCH DETAIL ───────────────────────────────────────────────────────────
export interface MatchDetail {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number;
  awayTeamId: number;
  homeCrest?: string;
  awayCrest?: string;
  homeScore: number | null;
  awayScore: number | null;
  halfTimeHome: number | null;
  halfTimeAway: number | null;
  status: MatchStatus;
  minute?: number | null;
  utcDate: string;
  competition: string;
  competitionCode: string;
  competitionEmblem?: string;
  matchday?: number;
  venue?: string;
  goals: MatchGoal[];
  referees: Referee[];
  head2head?: H2HData;
}

export interface Referee {
  name: string;
  type: string;
  nationality?: string;
}

export interface H2HData {
  numberOfMatches: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  lastMatches: H2HMatch[];
}

export interface H2HMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition: string;
}

// ─── API RESPONSE WRAPPERS ──────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  cachedAt?: string;
}
