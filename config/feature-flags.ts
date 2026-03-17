export const FLAGS = {
  // Experimental: xG overlay on standings table
  xgTable: process.env.NEXT_PUBLIC_FLAG_XG_TABLE === 'true',

  // Experimental: title/relegation probability bars
  scenarioEngine: process.env.NEXT_PUBLIC_FLAG_SCENARIOS !== 'false', // on by default

  // "Tryb nerd" — methodology cards, confidence intervals
  nerdMode: process.env.NEXT_PUBLIC_FLAG_NERD === 'true',

  // Transfer tracker section
  transfers: process.env.NEXT_PUBLIC_FLAG_TRANSFERS !== 'false',

  // Reddit feed
  reddit: process.env.NEXT_PUBLIC_FLAG_REDDIT !== 'false',

  // Club radar mini-dashboards
  clubRadar: process.env.NEXT_PUBLIC_FLAG_RADARS !== 'false',

  // Weszło RSS integration
  weszlo: process.env.NEXT_PUBLIC_FLAG_WESZLO !== 'false',
} as const;
