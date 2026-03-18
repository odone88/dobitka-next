export interface HistoricalMatch {
  month: number;
  day: number;
  year: number;
  home: string;
  away: string;
  score: string;
  competition: string;
  note: string; // one punchy sentence
  teams?: string[]; // searchable team names for contextual matching
}

const HISTORICAL: HistoricalMatch[] = [
  { month: 1,  day: 1,  year: 1872, home: 'Scotland', away: 'England',       score: '0-0', competition: 'Pierwszy mecz reprezentacji',  note: 'Pierwszy oficjalny mecz piłki nożnej w historii — 4000 widzów, 0 bramek, 100% historii.' },
  { month: 1,  day: 10, year: 2016, home: 'Barcelona', away: 'Betis',        score: '4-0', competition: 'La Liga',  note: 'Messi strzelił hat-tricka, ale wszyscy mówili tylko o asyście Suáreza — piętą, bez patrzenia.', teams: ['Barcelona', 'Betis'] },
  { month: 2,  day: 6,  year: 1958, home: 'Man United', away: '',            score: '', competition: 'Katastrofa lotnicza w Monachium', note: 'Katastrofa lotnicza zabrała 8 zawodników Manchesteru United. Futbol zatrzymał się.', teams: ['Man United', 'Manchester United'] },
  { month: 2,  day: 19, year: 2019, home: 'Barcelona', away: 'Lyon',         score: '5-1', competition: 'UCL 1/8', note: 'Messi zdemolował Lyon w 10 minut — dwa gole, asysta. Remontada z Barcelony, nie dla Barcelony.', teams: ['Barcelona', 'Lyon'] },
  { month: 3,  day: 8,  year: 2017, home: 'Barcelona', away: 'PSG',          score: '6-1', competition: 'UCL 1/8', note: 'La Remontada. 0-4 po 88 minutach → 6-1 po 95. Najbardziej szalony mecz XXI wieku.', teams: ['Barcelona', 'PSG', 'Paris'] },
  { month: 3,  day: 18, year: 2009, home: 'Man United', away: 'Inter',       score: '2-0', competition: 'UCL 1/8', note: 'Tévez i Ronaldo wysłali San Siro do domu. United szło po obronę tytułu.', teams: ['Man United', 'Manchester United', 'Inter'] },
  { month: 4,  day: 7,  year: 2015, home: 'PSG', away: 'Barcelona',          score: '2-2', competition: 'UCL ćwierćfinał', note: 'Messi 2x. Paryż miał wygrać. Wyremisował. I to starczyło Barcelonie.', teams: ['PSG', 'Paris', 'Barcelona'] },
  { month: 4,  day: 16, year: 2019, home: 'Man City', away: 'Tottenham',     score: '4-3', competition: 'UCL ćwierćfinał', note: 'City wygrało 4-3, ale VAR anulował hat-tricka Agüero. Mourinho krzyczał "You were lucky!" w studiu.', teams: ['Man City', 'Manchester City', 'Tottenham', 'Spurs'] },
  { month: 4,  day: 30, year: 2019, home: 'Barcelona', away: 'Liverpool',    score: '3-0', competition: 'UCL półfinał', note: 'Suárez, Messi (2x z FK). Liverpool musiał strzelić 4 gole bez Salacha i Firmino.', teams: ['Barcelona', 'Liverpool'] },
  { month: 5,  day: 7,  year: 2019, home: 'Liverpool', away: 'Barcelona',    score: '4-0', competition: 'UCL półfinał', note: 'Origi, Wijnaldum (2x), Origi. Shaqiri wykonał rzut rożny gdy bramkarz nie patrzył. Anfield oszalało.', teams: ['Liverpool', 'Barcelona'] },
  { month: 5,  day: 25, year: 2005, home: 'AC Milan', away: 'Liverpool',     score: '3-3 (3-2 pk)', competition: 'Final UCL Stambuł', note: 'Miracle of Istanbul. 0-3 w przerwie. Liverpool wrócił jak duch. Dudek tańczył. Sześć minut szaleństwa.', teams: ['AC Milan', 'Milan', 'Liverpool'] },
  { month: 5,  day: 26, year: 1999, home: 'Man United', away: 'Bayern',      score: '2-1', competition: 'Final UCL Barcelona', note: 'Sheringham i Solskjær w doliczonym czasie. Ferguson klęknął. Bayern płakał.', teams: ['Man United', 'Manchester United', 'Bayern'] },
  { month: 5,  day: 28, year: 2011, home: 'Barcelona', away: 'Man United',   score: '3-1', competition: 'Final UCL Wembley', note: 'Pep vs. Ferguson. Xavi, Iniesta, Messi — ten mecz to lekcja futbolu. United bez odpowiedzi.', teams: ['Barcelona', 'Man United', 'Manchester United'] },
  { month: 6,  day: 10, year: 2006, home: 'Germany', away: 'Costa Rica',     score: '4-2', competition: 'MŚ 2006 mecz otwarcia', note: 'Niemcy otworzyły swoje MŚ golem Lahma po 6 minutach. Mundial w ogniu.' },
  { month: 6,  day: 27, year: 2010, home: 'England', away: 'Germany',        score: '1-4', competition: 'MŚ 2010 1/8', note: 'Lampard trafił w poprzeczkę i... w bramkę. Sędzia nie uznał. Anglia odpadła. VAR jeszcze nie istniał.' },
  { month: 7,  day: 4,  year: 1954, home: 'Hungary', away: 'W. Germany',     score: '3-2', competition: 'Final MŚ 1954', note: 'Cud z Berna. Niemcy pokonali niepokonane Węgry 3:2. Pierwszy wielki cud MŚ.' },
  { month: 7,  day: 8,  year: 2014, home: 'Germany', away: 'Brazil',         score: '7-1', competition: 'MŚ 2014 półfinał', note: 'Mineirazo. Niemcy strzelili cztery gole w sześć minut. Brazylijczycy płakali. Cały świat w szoku.' },
  { month: 7,  day: 11, year: 2010, home: 'Netherlands', away: 'Spain',      score: '0-1', competition: 'Final MŚ 2010', note: 'Iniesta w 116. minucie. Holandia dostała 9 żółtych kartek i jeden nóż w serce.' },
  { month: 7,  day: 13, year: 2014, home: 'Germany', away: 'Argentina',      score: '1-0 pk', competition: 'Final MŚ 2014', note: 'Götze w dogrywce. Messi bez trofeum. Niemcy czwarte MŚ. Loew z zimną kawą.' },
  { month: 8,  day: 12, year: 2017, home: 'Neymar to PSG', away: '',         score: '', competition: 'Transfer sezonu',  note: '222 miliony euro. Neymar z Barcelony do PSG. Najdroższy transfer w historii. Trwa do dziś.', teams: ['PSG', 'Paris', 'Barcelona'] },
  { month: 8,  day: 26, year: 2018, home: 'Man City', away: 'Huddersfield',  score: '6-1', competition: 'Premier League', note: 'Sześć goli w pierwszej kolejce. Guardiola ostrzegał: "Musimy być lepsi." Był żart.', teams: ['Man City', 'Manchester City'] },
  { month: 9,  day: 15, year: 2010, home: 'Man United', away: 'Rangers',     score: '0-0', competition: 'UCL faza grupowa', note: 'Rok 2010. 0:0 na Old Trafford. Ferguson wyglądał jakby właśnie połknął cytrynę.', teams: ['Man United', 'Manchester United'] },
  { month: 9,  day: 16, year: 2015, home: 'Barcelona', away: 'Leverkusen',   score: '2-1', competition: 'UCL', note: 'Luis Suárez z piętą do siatki. Media przez tydzień rozmawiały tylko o tym.', teams: ['Barcelona', 'Leverkusen'] },
  { month: 10, day: 1,  year: 2016, home: 'Leicester', away: 'Porto',        score: '1-0', competition: 'UCL', note: 'Mistrz Anglii grał w Lidze Mistrzów. To był bajkowy sezon 5000:1.', teams: ['Leicester', 'Porto'] },
  { month: 10, day: 17, year: 2015, home: 'Chelsea', away: 'Arsenal',        score: '2-0', competition: 'Premier League', note: 'Costa, Hazard. Mourinho nokautuje Wengera jak zwykle. Arsenal bez odpowiedzi.', teams: ['Chelsea', 'Arsenal'] },
  { month: 11, day: 3,  year: 2010, home: 'Barcelona', away: 'Real Madrid',  score: '5-0', competition: 'El Clásico', note: 'Pep 5, Mourinho 0. Barcelona zdemolowała Real na Bernabéu. Jeden z najlepszych meczów dekady.', teams: ['Barcelona', 'Real Madrid', 'Real'] },
  { month: 11, day: 19, year: 2022, home: 'Argentina', away: 'Saudi Arabia', score: '1-2', competition: 'MŚ 2022 faza grupowa', note: 'Największa sensacja MŚ XXI wieku. Argentyna liderów, Arabia Saudyjska ją rozbiła. Messi patrzył w ziemię.' },
  { month: 12, day: 18, year: 2022, home: 'Argentina', away: 'France',       score: '3-3 (4-2 pk)', competition: 'Final MŚ 2022', note: 'Messi vs Mbappé. Messi wygrał. Hat-trick Mbappé w finale. Najlepszy finał MŚ w historii.' },
  { month: 12, day: 9,  year: 2015, home: 'Barcelona', away: 'Real Madrid',  score: '4-0', competition: 'El Clásico', note: 'Messi wbił pięć palców w powietrze — symbol 5 Złotych Piłek. Białe flagi na Bernabéu.', teams: ['Barcelona', 'Real Madrid', 'Real'] },
  // Extra team-contextual entries for UCL matching
  { month: 1, day: 1, year: 2005, home: 'Liverpool', away: 'Chelsea',        score: '1-0', competition: 'UCL półfinał 2005', note: 'Luis García, gol-widmo. Mourinho do dziś mówi, że piłka nie przekroczyła linii.', teams: ['Liverpool', 'Chelsea'] },
  { month: 1, day: 1, year: 2012, home: 'Real Madrid', away: 'Bayern',       score: '2-1', competition: 'UCL półfinał 2012', note: 'Ronaldo trafił, Kaka trafił. Ale to Bayern wygrał rewanż na karnych. Droga Real zakończona.', teams: ['Real Madrid', 'Real', 'Bayern'] },
  { month: 1, day: 1, year: 2010, home: 'Inter', away: 'Barcelona',          score: '3-1', competition: 'UCL półfinał 2010', note: 'Mourinho wyrzucił Barcelonę z LM. „Ta noc należy do nas." Inter szło po potrójną koronę.', teams: ['Inter', 'Barcelona'] },
  { month: 1, day: 1, year: 2018, home: 'Juventus', away: 'Real Madrid',     score: '0-3', competition: 'UCL ćwierćfinał 2018', note: 'Ronaldo z przewrotką na Bernabéu... nie, to był rewanż w Turynie. Standing ovation od kibiców Juventusu.', teams: ['Juventus', 'Juve', 'Real Madrid', 'Real'] },
  { month: 1, day: 1, year: 2020, home: 'Atletico', away: 'Liverpool',       score: '1-0', competition: 'UCL 1/8 2020', note: 'Saúl z golem w 4. minucie. Simeone wybiegł z ławki. Liverpool miał problem.', teams: ['Atletico', 'Atlético', 'Liverpool'] },
  { month: 1, day: 1, year: 2023, home: 'Man City', away: 'Inter',           score: '1-0', competition: 'Final UCL 2023', note: 'Rodri jedyny gol. City wreszcie z Pucharem Europy. Guardiola płakał.', teams: ['Man City', 'Manchester City', 'Inter'] },
  { month: 1, day: 1, year: 2024, home: 'Dortmund', away: 'PSG',            score: '1-0', competition: 'UCL półfinał 2024', note: 'Żółty Mur nie dał się. Dortmund w finale — Hummels jak za starych dobrych czasów.', teams: ['Dortmund', 'PSG', 'Paris'] },
  { month: 1, day: 1, year: 2022, home: 'Real Madrid', away: 'Man City',     score: '3-1', competition: 'UCL półfinał 2022', note: 'Rodrygo 2x w 90+. Benzema z karnego. Największy comeback dekady. City w szoku.', teams: ['Real Madrid', 'Real', 'Man City', 'Manchester City'] },
  { month: 1, day: 1, year: 2019, home: 'Ajax', away: 'Juventus',           score: '1-2', competition: 'UCL ćwierćfinał 2019', note: 'De Ligt, de Jong — Ajax prawie wyeliminował Juve. Ronaldo powiedział: "Nie dziś."', teams: ['Ajax', 'Juventus', 'Juve'] },
  { month: 1, day: 1, year: 2014, home: 'Bayern', away: 'Barcelona',         score: '7-0', competition: 'UCL półfinał 2013', note: 'Suma 7:0 — to nie mecz, to egzekucja. Guardiola patrzył z trybun i planował przeprowadzkę.', teams: ['Bayern', 'Barcelona'] },
  { month: 1, day: 1, year: 2021, home: 'Chelsea', away: 'Man City',         score: '1-0', competition: 'Final UCL 2021', note: 'Havertz ominął Edersona. Chelsea mistrzem Europy. Tuchel pokonał Pepę po 3 miesiącach.', teams: ['Chelsea', 'Man City', 'Manchester City'] },
  { month: 1, day: 1, year: 2006, home: 'Arsenal', away: 'Barcelona',        score: '1-2', competition: 'Final UCL 2006', note: 'Belletti zdjął Arsenalowi marzenia. Ronaldinho, Eto\'o, Deco. Wenger z jednym trofeum mniej.', teams: ['Arsenal', 'Barcelona'] },
];

export function getTodayHistoricalMatch(): HistoricalMatch | null {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const matches = HISTORICAL.filter((h) => h.month === m && h.day === d);
  if (matches.length === 0) return null;
  return matches[now.getFullYear() % matches.length];
}

export function getFallbackHistoricalMatch(): HistoricalMatch {
  const day = Math.floor(Date.now() / 86400000);
  return HISTORICAL[day % HISTORICAL.length];
}

/**
 * Find a historical match involving one of today's UCL teams.
 * Returns the match + a contextual framing line, or null.
 */
export function getTeamContextualMatch(todayTeams: string[]): { match: HistoricalMatch; framing: string } | null {
  if (todayTeams.length === 0) return null;

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
  const teamSet = todayTeams.map(normalize);

  // Find matches that involve any of today's teams
  const contextual = HISTORICAL.filter((h) => {
    if (!h.teams) return false;
    return h.teams.some((t) => teamSet.some((tt) => normalize(t).includes(tt) || tt.includes(normalize(t))));
  });

  if (contextual.length === 0) return null;

  // Pick deterministically based on day
  const day = Math.floor(Date.now() / 86400000);
  const match = contextual[day % contextual.length];

  // Find which of today's teams is in this match
  const involvedTeam = todayTeams.find((tt) =>
    match.teams?.some((mt) => normalize(mt).includes(normalize(tt)) || normalize(tt).includes(normalize(mt)))
  ) ?? todayTeams[0];

  const framing = `Dziś ${involvedTeam} gra w Lidze Mistrzów — historia mówi:`;
  return { match, framing };
}
