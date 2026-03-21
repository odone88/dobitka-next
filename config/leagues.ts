export interface LeagueConfig {
  code: string;
  name: string;
  shortName: string;
  country: string;
  flag: string;
  color: string;       // tailwind color class
  bgColor: string;
  understatSlug?: string;
}

export const LEAGUES: LeagueConfig[] = [
  {
    code: 'PPL',
    name: 'Ekstraklasa',
    shortName: 'EKL',
    country: 'Polska',
    flag: '🇵🇱',
    color: 'text-red-500',
    bgColor: 'bg-red-950',
    understatSlug: undefined,
  },
  {
    code: 'CL',
    name: 'Liga Mistrzów',
    shortName: 'UCL',
    country: 'Europa',
    flag: '🏆',
    color: 'text-blue-400',
    bgColor: 'bg-blue-950',
    understatSlug: undefined,
  },
  {
    code: 'PL',
    name: 'Premier League',
    shortName: 'PL',
    country: 'Anglia',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    color: 'text-purple-400',
    bgColor: 'bg-purple-950',
    understatSlug: 'EPL',
  },
  {
    code: 'PD',
    name: 'La Liga',
    shortName: 'LaLiga',
    country: 'Hiszpania',
    flag: '🇪🇸',
    color: 'text-red-400',
    bgColor: 'bg-red-950',
    understatSlug: 'La_liga',
  },
  {
    code: 'SA',
    name: 'Serie A',
    shortName: 'SerieA',
    country: 'Włochy',
    flag: '🇮🇹',
    color: 'text-green-400',
    bgColor: 'bg-green-950',
    understatSlug: 'Serie_A',
  },
  {
    code: 'BL1',
    name: 'Bundesliga',
    shortName: 'BL',
    country: 'Niemcy',
    flag: '🇩🇪',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-950',
    understatSlug: 'Bundesliga',
  },
  {
    code: 'FL1',
    name: 'Ligue 1',
    shortName: 'L1',
    country: 'Francja',
    flag: '🇫🇷',
    color: 'text-sky-400',
    bgColor: 'bg-sky-950',
    understatSlug: 'Ligue_1',
  },
];

export function getLeague(code: string): LeagueConfig | undefined {
  return LEAGUES.find((l) => l.code === code);
}
