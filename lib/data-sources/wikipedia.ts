interface WikiEvent {
  year: number;
  text: string;
}

const FOOTBALL_KEYWORDS = [
  'football', 'soccer', 'FIFA', 'UEFA', 'World Cup', 'Champions League',
  'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
  'goal', 'match', 'cup final', 'stadium', 'derby', 'league',
  'FC ', ' FC', ' CF', 'Real Madrid', 'Barcelona', 'Manchester', 'Liverpool',
  'Arsenal', 'Chelsea', 'Bayern', 'Juventus', 'Milan', 'Inter',
  'Pelé', 'Maradona', 'Messi', 'Ronaldo', 'Beckham', 'Zidane',
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

    // Filter for football-related events
    const footballEvents = events.filter((e) =>
      FOOTBALL_KEYWORDS.some((kw) => e.text.toLowerCase().includes(kw.toLowerCase()))
    );

    return footballEvents.slice(0, 3).map((e) => ({
      year: e.year,
      text: e.text,
    }));
  } catch {
    return [];
  }
}
