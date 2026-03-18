export interface HistoricalMatch {
  month: number;
  day: number;
  year: number;
  home: string;
  away: string;
  score: string;
  competition: string;
  note: string; // one punchy sentence
}

const HISTORICAL: HistoricalMatch[] = [
  { month: 1,  day: 1,  year: 1872, home: 'Scotland', away: 'England',       score: '0-0', competition: 'Pierwszy mecz reprezentacji',  note: 'Pierwszy oficjalny mecz piłki nożnej w historii — 4000 widzów, 0 bramek, 100% historii.' },
  { month: 1,  day: 10, year: 2016, home: 'Barcelona', away: 'Betis',        score: '4-0', competition: 'La Liga',  note: 'Messi strzelił hat-tricka, ale wszyscy mówili tylko o asyście Suáreza — piętą, bez patrzenia.' },
  { month: 2,  day: 6,  year: 1958, home: 'Man United', away: '',            score: '', competition: 'Katastrofa lotnicza w Monachium', note: 'Katastrofa lotnicza zabrała 8 zawodników Manchesteru United. Futbol zatrzymał się.' },
  { month: 2,  day: 19, year: 2019, home: 'Barcelona', away: 'Lyon',         score: '5-1', competition: 'UCL 1/8', note: 'Messi zdemolował Lyon w 10 minut — dwa gole, asysta. Remontada z Barcelony, nie dla Barcelony.' },
  { month: 3,  day: 8,  year: 2017, home: 'Barcelona', away: 'PSG',          score: '6-1', competition: 'UCL 1/8', note: 'La Remontada. 0-4 po 88 minutach → 6-1 po 95. Najbardziej szalony mecz XXI wieku.' },
  { month: 3,  day: 18, year: 2009, home: 'Man United', away: 'Inter',       score: '2-0', competition: 'UCL 1/8', note: 'Tévez i Ronaldo wysłali San Siro do domu. United szło po obronę tytułu.' },
  { month: 4,  day: 7,  year: 2015, home: 'PSG', away: 'Barcelona',          score: '2-2', competition: 'UCL ćwierćfinał', note: 'Messi 2x. Paryż miał wygrać. Wyremisował. I to starczyło Barcelonie.' },
  { month: 4,  day: 16, year: 2019, home: 'Man City', away: 'Tottenham',     score: '4-3', competition: 'UCL ćwierćfinał', note: 'City wygrało 4-3, ale VAR anulował hat-tricka Agüero. Mourinho krzyczał "You were lucky!" w studiu.' },
  { month: 4,  day: 30, year: 2019, home: 'Barcelona', away: 'Liverpool',    score: '3-0', competition: 'UCL półfinał', note: 'Suárez, Messi (2x z FK). Liverpool musiał strzelić 4 gole bez Salacha i Firmino.' },
  { month: 5,  day: 7,  year: 2019, home: 'Liverpool', away: 'Barcelona',    score: '4-0', competition: 'UCL półfinał', note: 'Origi, Wijnaldum (2x), Origi. Shaqiri wykonał rzut rożny gdy bramkarz nie patrzył. Anfield oszalało.' },
  { month: 5,  day: 25, year: 2005, home: 'AC Milan', away: 'Liverpool',     score: '3-3 (3-2 pk)', competition: 'Final UCL Stambuł', note: 'Miracle of Istanbul. 0-3 w przerwie. Liverpool wrócił jak duch. Dudek tańczył. Sześć minut szaleństwa.' },
  { month: 5,  day: 26, year: 1999, home: 'Man United', away: 'Bayern',      score: '2-1', competition: 'Final UCL Barcelona', note: 'Sheringham i Solskjær w doliczonym czasie. Ferguson klęknął. Bayern płakał.' },
  { month: 5,  day: 28, year: 2011, home: 'Barcelona', away: 'Man United',   score: '3-1', competition: 'Final UCL Wembley', note: 'Pep vs. Ferguson. Xavi, Iniesta, Messi — ten mecz to lekcja futbolu. United bez odpowiedzi.' },
  { month: 6,  day: 10, year: 2006, home: 'Germany', away: 'Costa Rica',     score: '4-2', competition: 'MŚ 2006 mecz otwarcia', note: 'Niemcy otworzyły swoje MŚ golem Lahma po 6 minutach. Mundial w ogniu.' },
  { month: 6,  day: 27, year: 2010, home: 'England', away: 'Germany',        score: '1-4', competition: 'MŚ 2010 1/8', note: 'Lampard trafił w poprzeczkę i... w bramkę. Sędzia nie uznał. Anglia odpadła. VAR jeszcze nie istniał.' },
  { month: 7,  day: 4,  year: 1954, home: 'Hungary', away: 'W. Germany',     score: '3-2', competition: 'Final MŚ 1954', note: 'Cud z Berna. Niemcy pokonali niepokonane Węgry 3:2. Pierwszy wielki cud MŚ.' },
  { month: 7,  day: 8,  year: 2014, home: 'Germany', away: 'Brazil',         score: '7-1', competition: 'MŚ 2014 półfinał', note: 'Mineirazo. Niemcy strzelili cztery gole w sześć minut. Brazylijczycy płakali. Cały świat w szoku.' },
  { month: 7,  day: 11, year: 2010, home: 'Netherlands', away: 'Spain',      score: '0-1', competition: 'Final MŚ 2010', note: 'Iniesta w 116. minucie. Holandia dostała 9 żółtych kartek i jeden nóż w serce.' },
  { month: 7,  day: 13, year: 2014, home: 'Germany', away: 'Argentina',      score: '1-0 pk', competition: 'Final MŚ 2014', note: 'Götze w dogrywce. Messi bez trofeum. Niemcy czwarte MŚ. Loew z zimną kawą.' },
  { month: 8,  day: 12, year: 2017, home: 'Neymar to PSG', away: '',         score: '', competition: 'Transfer sezonu',  note: '222 miliony euro. Neymar z Barcelony do PSG. Najdroższy transfer w historii. Trwa do dziś.' },
  { month: 8,  day: 26, year: 2018, home: 'Man City', away: 'Huddersfield',  score: '6-1', competition: 'Premier League', note: 'Sześć goli w pierwszej kolejce. Guardiola ostrzegał: "Musimy być lepsi." Był żart.' },
  { month: 9,  day: 15, year: 2010, home: 'Man United', away: 'Rangers',     score: '0-0', competition: 'UCL faza grupowa', note: 'Rok 2010. 0:0 na Old Trafford. Ferguson wyglądał jakby właśnie połknął cytrynę.' },
  { month: 9,  day: 16, year: 2015, home: 'Barcelona', away: 'Leverkusen',   score: '2-1', competition: 'UCL', note: 'Luis Suárez z piętą do siatki. Media przez tydzień rozmawiały tylko o tym.' },
  { month: 10, day: 1,  year: 2016, home: 'Leicester', away: 'Porto',        score: '1-0', competition: 'UCL', note: 'Mistrz Anglii grał w Lidze Mistrzów. To był bajkowy sezon 5000:1.' },
  { month: 10, day: 17, year: 2015, home: 'Chelsea', away: 'Arsenal',        score: '2-0', competition: 'Premier League', note: 'Costa, Hazard. Mourinho nokautuje Wengera jak zwykle. Arsenal bez odpowiedzi.' },
  { month: 11, day: 3,  year: 2010, home: 'Barcelona', away: 'Real Madrid',  score: '5-0', competition: 'El Clásico', note: 'Pep 5, Mourinho 0. Barcelona zdemolowała Real na Bernabéu. Jeden z najlepszych meczów dekady.' },
  { month: 11, day: 19, year: 2022, home: 'Argentina', away: 'Saudi Arabia', score: '1-2', competition: 'MŚ 2022 faza grupowa', note: 'Największa sensacja MŚ XXI wieku. Argentyna liderów, Arabia Saudyjska ją rozbiła. Messi patrzył w ziemię.' },
  { month: 12, day: 18, year: 2022, home: 'Argentina', away: 'France',       score: '3-3 (4-2 pk)', competition: 'Final MŚ 2022', note: 'Messi vs Mbappé. Messi wygrał. Hat-trick Mbappé w finale. Najlepszy finał MŚ w historii.' },
  { month: 12, day: 9,  year: 2015, home: 'Barcelona', away: 'Real Madrid',  score: '4-0', competition: 'El Clásico', note: 'Messi wbił pięć palców w powietrze — symbol 5 Złotych Piłek. Białe flagi na Bernabéu.' },
];

export function getTodayHistoricalMatch(): HistoricalMatch | null {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const matches = HISTORICAL.filter((h) => h.month === m && h.day === d);
  if (matches.length === 0) return null;
  // Pick randomly but deterministically based on year
  return matches[now.getFullYear() % matches.length];
}

export function getFallbackHistoricalMatch(): HistoricalMatch {
  // Return a "classic" match when no match for today's date
  const day = Math.floor(Date.now() / 86400000);
  return HISTORICAL[day % HISTORICAL.length];
}
