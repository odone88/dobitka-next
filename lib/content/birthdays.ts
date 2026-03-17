interface Birthday {
  month: number;
  day: number;
  name: string;
  year: number;
  desc: string;
}

const BIRTHDAYS: Birthday[] = [
  { month: 2, day: 5, name: 'Cristiano Ronaldo', year: 1985, desc: 'pięciokrotny zdobywca Złotej Piłki, rekordowy strzelec w historii piłki' },
  { month: 6, day: 24, name: 'Lionel Messi', year: 1987, desc: 'ośmiokrotny zwycięzca Złotej Piłki, mistrz świata 2022' },
  { month: 5, day: 20, name: 'Robert Lewandowski', year: 1988, desc: 'najlepszy polski piłkarz w historii, rekordowy strzelec Bundesliga' },
  { month: 6, day: 20, name: 'Erling Haaland', year: 2000, desc: 'norweski napastnik, maszyna bramkowa Manchesteru City' },
  { month: 12, day: 20, name: 'Kylian Mbappé', year: 1998, desc: 'kapitan reprezentacji Francji, gwiazdor Realu Madryt' },
  { month: 2, day: 7, name: 'Vinicius Jr.', year: 2000, desc: 'brazylijski skrzydłowy Realu Madryt, zwycięzca UCL 2024' },
  { month: 5, day: 13, name: 'Lamine Yamal', year: 2007, desc: 'cud natury Barcelony, najmłodszy strzelec na ME' },
  { month: 4, day: 22, name: 'Jude Bellingham', year: 2003, desc: 'angielski pomocnik Realu Madryt' },
  { month: 9, day: 5, name: 'Pedri', year: 2002, desc: 'środkowy pomocnik FC Barcelony, następca Xaviego' },
  { month: 11, day: 19, name: 'Pedri (urodziny?)', year: 2002, desc: '' },
  { month: 3, day: 17, name: 'Thierry Henry', year: 1977, desc: 'legenda Arsenalu i reprezentacji Francji' },
  { month: 5, day: 5, name: 'Carlos Tevez', year: 1984, desc: 'argentyński napastnik, ikona Manchesteru United i City' },
  { month: 9, day: 19, name: 'Zlatan Ibrahimovic', year: 1981, desc: 'szwedzki napastnik, mistrz 12 lig w 6 krajach' },
  { month: 3, day: 31, name: 'Andriy Shevchenko', year: 1976, desc: 'ukraiński napastnik, Złota Piłka 2004' },
  { month: 4, day: 11, name: 'Masimiliano Allegri', year: 1967, desc: 'włoski trener, 5x mistrz Włoch z Juventusem' },
  { month: 7, day: 19, name: 'Bernardo Silva', year: 1994, desc: 'portugalski playmaker Manchesteru City' },
  { month: 8, day: 7, name: 'David Villa', year: 1981, desc: 'rekordowy strzelec reprezentacji Hiszpanii' },
  { month: 10, day: 3, name: 'Luka Modric', year: 1985, desc: 'Złota Piłka 2018, kapitan Chorwacji' },
  { month: 11, day: 2, name: 'Ruud van Nistelrooy', year: 1976, desc: 'holenderski napastnik, legenda Manchesteru United' },
  { month: 12, day: 14, name: 'Thierry Henry', year: 1977, desc: 'wielokrotnie mylone daty' },
  { month: 1, day: 27, name: 'Pep Guardiola', year: 1971, desc: 'trener, który zrewolucjonizował futbol w Barcelonie i Manchesterze City' },
];

export function getTodayBirthdays(): Birthday[] {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  return BIRTHDAYS.filter((b) => b.month === m && b.day === d);
}
