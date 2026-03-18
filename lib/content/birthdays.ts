interface Birthday {
  month: number;
  day: number;
  name: string;
  year: number;
  desc: string;
}

const BIRTHDAYS: Birthday[] = [
  { month: 2,  day: 5,  name: 'Cristiano Ronaldo',  year: 1985, desc: 'pięciokrotny zdobywca Złotej Piłki, rekordowy strzelec w historii futbolu' },
  { month: 6,  day: 24, name: 'Lionel Messi',        year: 1987, desc: 'ośmiokrotny zwycięzca Złotej Piłki, mistrz świata 2022' },
  { month: 5,  day: 20, name: 'Robert Lewandowski',  year: 1988, desc: 'najlepszy polski piłkarz w historii, rekordowy strzelec Bundesligi' },
  { month: 6,  day: 20, name: 'Erling Haaland',      year: 2000, desc: 'norweski napastnik, maszyna bramkowa Man City' },
  { month: 12, day: 20, name: 'Kylian Mbappé',       year: 1998, desc: 'kapitan Francji, gwiazdor Realu Madryt' },
  { month: 2,  day: 7,  name: 'Vinicius Jr.',         year: 2000, desc: 'brazylijski skrzydłowy Realu, zwycięzca UCL 2024' },
  { month: 5,  day: 13, name: 'Lamine Yamal',         year: 2007, desc: 'cud natury Barcelony, najmłodszy strzelec na ME' },
  { month: 4,  day: 22, name: 'Jude Bellingham',     year: 2003, desc: 'angielski pomocnik Realu Madryt' },
  { month: 9,  day: 5,  name: 'Pedri',                year: 2002, desc: 'środkowy pomocnik FC Barcelony' },
  { month: 3,  day: 17, name: 'Thierry Henry',        year: 1977, desc: 'legenda Arsenalu i reprezentacji Francji, 228 bramek dla Gunners' },
  { month: 5,  day: 5,  name: 'Carlos Tevez',         year: 1984, desc: 'argentyński napastnik, ikona Man United i Man City' },
  { month: 9,  day: 19, name: 'Zlatan Ibrahimović',   year: 1981, desc: 'szwedzki napastnik, mistrz 12 lig w 6 krajach' },
  { month: 3,  day: 31, name: 'Andriy Shevchenko',   year: 1976, desc: 'ukraiński napastnik, Złota Piłka 2004' },
  { month: 7,  day: 19, name: 'Bernardo Silva',       year: 1994, desc: 'portugalski playmaker Man City' },
  { month: 8,  day: 7,  name: 'David Villa',          year: 1981, desc: 'rekordowy strzelec reprezentacji Hiszpanii' },
  { month: 10, day: 3,  name: 'Luka Modrić',          year: 1985, desc: 'Złota Piłka 2018, kapitan Chorwacji' },
  { month: 11, day: 2,  name: 'Ruud van Nistelrooy',  year: 1976, desc: 'holenderski napastnik, legenda Man United' },
  { month: 1,  day: 27, name: 'Pep Guardiola',        year: 1971, desc: 'trener, który zrewolucjonizował futbol w Barcelonie i Man City' },
  { month: 6,  day: 14, name: 'Didier Drogba',        year: 1978, desc: 'ikona Chelsea, najlepszy środkowy napastnik swojego pokolenia' },
  { month: 4,  day: 14, name: 'Cesc Fàbregas',        year: 1987, desc: 'hiszpański pomocnik, wychowanek Arsenalu i Barcelony' },
  { month: 7,  day: 24, name: 'Lionel Messi',         year: 1987, desc: '' }, // backup check — remove duplicate
  { month: 2,  day: 23, name: 'Marc-André ter Stegen',year: 1992, desc: 'bramkarz FC Barcelony i Niemiec' },
  { month: 12, day: 8,  name: 'Diego Forlan',         year: 1979, desc: 'urugwajski napastnik, Złota Piłka MŚ 2010' },
  { month: 8,  day: 14, name: 'Theo Hernández',       year: 1997, desc: 'lewy obrońca AC Milan i Francji' },
  { month: 3,  day: 5,  name: 'Granit Xhaka',         year: 1992, desc: 'szwajcarski pomocnik Bayeru Leverkusen' },
  { month: 1,  day: 5,  name: 'Xabi Alonso',          year: 1981, desc: 'mistrz świata 2010, trener Bayeru Leverkusen' },
];

// Remove duplicates (keep first occurrence per name)
const seen = new Set<string>();
const UNIQUE_BIRTHDAYS = BIRTHDAYS.filter((b) => {
  if (!b.desc || seen.has(b.name)) return false;
  seen.add(b.name);
  return true;
});

export function getTodayBirthdays(): Birthday[] {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  return UNIQUE_BIRTHDAYS.filter((b) => b.month === m && b.day === d);
}

export function getAge(year: number): number {
  const now = new Date();
  return now.getFullYear() - year;
}
