export const FACTS: string[] = [
  'Ronaldo strzelił więcej bramek w La Liga niż jakikolwiek inny zawodnik urodzony poza Hiszpanią.',
  'Andrés Iniesta grał w Barcelonie przez 22 lata — od akademii La Masia do transferu do Vissel Kobe.',
  'Bayern Monachium wygrał Bundesligę 11 razy z rzędu (2013–2023) — absolutny rekord w top-5 ligach Europy.',
  'Premier League ma największą sumę wynagrodzeń ze wszystkich lig piłkarskich na świecie.',
  'Lionel Messi jest jedynym graczem z 8 nagrodami Złotej Piłki.',
  'Gianluigi Buffon rozegrał ponad 1000 meczów zawodowych — jeden z niewielu graczy w historii.',
  'Cristiano Ronaldo był pierwszym graczem, który strzelił na 5 kolejnych Mistrzostwach Świata.',
  'Manchester City ustawiło rekord PL z 100 punktami w sezonie 2017/18.',
  'Zinedine Zidane wygrał Ligę Mistrzów jako zawodnik i trzykrotnie jako trener Realu Madryt.',
  'Erling Haaland strzelił 36 bramek w swoim pierwszym sezonie w Premier League — rekord wszech czasów.',
  'Kylian Mbappé był pierwszym nastolatkiem od Pelé, który strzelił w finale MŚ.',
  'Roberto Carlos zasłynął z rzutu wolnego z 1997 roku — piłka ugięła się w locie na prawach fizyki.',
  'Neymar kosztował 222 mln euro — najdroższy transfer w historii piłki nożnej.',
  'Tiki-taka Barcelony z lat 2008–2012 zrewolucjonizowała futbol — posiadanie piłki jako broń.',
  'Leicester City wygrał Premier League w 2016 roku przy szansach 5000:1 u bukmacherów.',
  'Johan Cruyff wynalazł "obrót Cruyffa" podczas meczu na mistrzostwach świata w 1974.',
  'Chelsea wygrała Ligę Mistrzów w 2021 roku pod wodzą Thomasa Tuchela zaledwie 4 miesiące po jego powołaniu.',
  'Thierry Henry strzelił 226 bramek dla Arsenalu — rekord wszech czasów tego klubu.',
  'FC Barcelona jest jedynym klubem w historii, który wygrał dwa razy z rzędu potrójną koronę.',
  'Xavi Hernández rozegrał 767 meczów dla FC Barcelony, więcej niż jakikolwiek inny zawodnik.',
  'Paolo Maldini spędził całą karierę zawodową w AC Milan — 25 sezonów.',
  'Ronaldo Nazário strzelił 15 bramek na mistrzostwach świata — rekord do dziś niepobity.',
  'Pelé był pierwszą osobą, która zdobyła 3 tytuły mistrza świata (1958, 1962, 1970).',
  'Diego Maradona zagrał w sześciu finałach Copa del Rey dla Barcelony.',
  'Robert Lewandowski strzelił 5 bramek w 9 minut dla Bayernu Monachium w 2015 roku.',
  'Karim Benzema wygrał Złotą Piłkę w 2022 roku w wieku 34 lat — najstarszy zwycięzca od czasów Matthäusa.',
  'Vinicius Jr. rozegrał 300 meczów dla Realu Madryt, zanim skończyć 23 lata.',
  'Pepe grał w reprezentacji Portugalii w wieku 41 lat — jeden z najstarszych obrońców na ME.',
  'Wojciech Szczęsny w dniu debiutu w FC Barcelonie miał 34 lata i był bez klubu od 2 miesięcy.',
  'Lamine Yamal strzelił gola na Euro 2024 mając 17 lat — najmłodszy strzelec w historii Mistrzostw Europy.',
];

export function getDailyFacts(count = 3): string[] {
  const day = Math.floor(Date.now() / 86400000); // day index since epoch
  const start = (day * count) % FACTS.length;
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(FACTS[(start + i) % FACTS.length]);
  }
  return result;
}
