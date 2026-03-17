export interface DataSource {
  id: string;
  name: string;
  baseUrl: string;
  requiresKey: boolean;
  legalBasis: string;
  rateLimit: string;
  refreshPolicy: string;
  fallback: string;
}

export const SOURCES: DataSource[] = [
  {
    id: 'football-data',
    name: 'football-data.org',
    baseUrl: 'https://api.football-data.org/v4',
    requiresKey: true,
    legalBasis: 'Free tier personal/non-commercial use, attribution required',
    rateLimit: '10 req/min',
    refreshPolicy: 'Standings: 2h, Live: 60s, Fixtures: 30min',
    fallback: 'Last known data shown with stale indicator',
  },
  {
    id: 'thesportsdb',
    name: 'TheSportsDB',
    baseUrl: 'https://www.thesportsdb.com/api/v1/json/3',
    requiresKey: false,
    legalBasis: 'Free public API, open data',
    rateLimit: 'Unspecified, polite use',
    refreshPolicy: 'Team/player data: 24h',
    fallback: 'Generic team placeholder',
  },
  {
    id: 'reddit',
    name: 'Reddit (r/soccer, r/ekstraklasa)',
    baseUrl: 'https://www.reddit.com',
    requiresKey: false,
    legalBasis: 'Public JSON API, no auth required for read',
    rateLimit: 'Polite: max 1 req/min per subreddit',
    refreshPolicy: '15min',
    fallback: 'Last 5 cached posts',
  },
  {
    id: 'youtube-rss',
    name: 'YouTube Atom RSS (Tifo Football)',
    baseUrl: 'https://www.youtube.com/feeds/videos.xml',
    requiresKey: false,
    legalBasis: 'Public RSS feed',
    rateLimit: 'Polite use',
    refreshPolicy: '2h',
    fallback: 'Last 3 cached videos',
  },
  {
    id: 'weszlo',
    name: 'Weszło.com RSS',
    baseUrl: 'https://weszlo.com/feed/',
    requiresKey: false,
    legalBasis: 'Public RSS feed',
    rateLimit: 'Polite use',
    refreshPolicy: '30min',
    fallback: 'Last cached articles',
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia REST API',
    baseUrl: 'https://en.wikipedia.org/api/rest_v1',
    requiresKey: false,
    legalBasis: 'CC BY-SA, public API',
    rateLimit: 'Polite: max 200 req/s',
    refreshPolicy: '24h',
    fallback: 'No bio shown',
  },
];

export const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_KEY ?? '';
export const TIFO_CHANNEL_ID = 'UCNAf1k0yIjyGu3k9BwAg3lg';
