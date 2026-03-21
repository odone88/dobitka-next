interface WikiEvent {
  year: number;
  text: string;
}

// Strict keywords — avoid false positives like "international", "intervention", city names
const FOOTBALL_KEYWORDS = [
  'football', 'soccer', 'FIFA', 'UEFA', 'World Cup', 'Champions League',
  'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
  'Ekstraklasa', 'Eredivisie', 'Primeira Liga',
  'cup final', 'football stadium', 'football club',
  'FC ', ' FC', ' CF ',
  'Real Madrid', 'Manchester United', 'Manchester City', 'Liverpool FC',
  'Arsenal FC', 'Chelsea FC', 'Bayern Munich', 'Juventus FC', 'AC Milan',
  'Inter Milan', 'FC Barcelona', 'Legia Warszawa', 'Lech Poznań',
  'Pelé', 'Maradona', 'Messi', 'Ronaldo', 'Beckham', 'Zidane',
  'Robert Lewandowski', 'Zbigniew Boniek',
  'goalkeeper', 'footballer', 'penalty kick',
];

// Exclude American football / NFL events
const AMERICAN_FOOTBALL_KEYWORDS = [
  'NFL', 'National Football League', 'Super Bowl', 'touchdown',
  'quarterback', 'wide receiver', 'running back', 'tight end',
  'gridiron', 'American football', 'AFL',
  'Rams', 'Patriots', 'Cowboys', 'Packers', 'Steelers', 'Eagles',
  '49ers', 'Bears', 'Broncos', 'Chiefs', 'Saints', 'Seahawks',
  'Cardinals', 'Bengals', 'Chargers', 'Colts', 'Dolphins', 'Falcons',
  'Giants', 'Jaguars', 'Jets', 'Lions', 'Panthers', 'Raiders',
  'Ravens', 'Texans', 'Titans', 'Vikings', 'Commanders',
  'CFL', 'Canadian Football',
];

export async function getOnThisDay(): Promise<WikiEvent[]> {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`,
      {
        headers: { 'User-Agent': 'dobitka/1.0 (football dashboard)' },
        next: { revalidate: 86400 },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const events = (data.events ?? []) as Array<{ year: number; text: string }>;

    // Filter for football-related events, excluding American football / NFL
    const footballEvents = events.filter((e) => {
      const text = e.text.toLowerCase();
      const isFootball = FOOTBALL_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
      const isAmericanFootball = AMERICAN_FOOTBALL_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
      return isFootball && !isAmericanFootball;
    });

    return footballEvents.slice(0, 3).map((e) => ({
      year: e.year,
      text: e.text,
    }));
  } catch {
    return [];
  }
}
