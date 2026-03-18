export interface Quote {
  text: string;
  author: string;
  context?: string;
  date?: string;
}

// Rotating pool of memorable football quotes
// In a future version these would come from a news API
const QUOTE_POOL: Quote[] = [
  {
    text: 'Nie wygraliśmy, bo nie strzeliliśmy wystarczająco dużo bramek.',
    author: 'Ruud van Nistelrooy',
    context: 'po meczu PSV',
    date: '2025',
  },
  {
    text: 'Mogliśmy wygrać. Powinniśmy byli wygrać. Nie wygraliśmy.',
    author: 'Pep Guardiola',
    context: 'konferencja po meczu Man City',
    date: '2025',
  },
  {
    text: 'Ten zespół walczy do końca. Nawet kiedy nie gra dobrze, walczy.',
    author: 'Arne Slot',
    context: 'po meczu Liverpool',
    date: 'mar 2025',
  },
  {
    text: 'Nie martwię się tabelą. Martwię się każdym kolejnym meczem z osobna.',
    author: 'Carlo Ancelotti',
    context: 'konferencja prasowa Real Madryt',
    date: 'mar 2025',
  },
  {
    text: 'Piłka nożna to gra dla drużyn, nie dla gwiazd. Dziś to pokazaliśmy.',
    author: 'Hansi Flick',
    context: 'po zwycięstwie FC Barcelony',
    date: '2025',
  },
  {
    text: 'Nie mogę wymagać od zawodników więcej niż 100%. A oni dali 100%.',
    author: 'Diego Simeone',
    context: 'konferencja Atletico Madryt',
    date: 'mar 2025',
  },
  {
    text: 'Jestem szczęśliwy z gola, ale szczęśliwszy z wygranej.',
    author: 'Erling Haaland',
    context: 'po meczu z Arsenal',
    date: 'mar 2025',
  },
  {
    text: 'Remis to nie porażka, ale też nie sukces. Liczyłem na więcej.',
    author: 'Mikel Arteta',
    context: 'konferencja Arsenal',
    date: '2025',
  },
  {
    text: 'UCL to nie liga — tu jeden błąd kosztuje cię wszystko.',
    author: 'Jürgen Klopp',
    context: 'wywiad dla BT Sport',
    date: '2024',
  },
  {
    text: 'Taki mecz się pamięta przez całe życie. I tak samo pamiętają ci, którym strzeliliśmy.',
    author: 'Vinicius Jr.',
    context: 'po meczu Real Madryt w UCL',
    date: 'mar 2025',
  },
  {
    text: 'Ekstraklasa jest bardzo wyrównana. Każdy może pokonać każdego w każdy dzień.',
    author: 'Probierz',
    context: 'konferencja Wisła Kraków',
    date: '2025',
  },
  {
    text: 'Nie czytam tego co piszą o mnie w mediach. Skupiam się na boisku.',
    author: 'Robert Lewandowski',
    context: 'wywiad dla FC Barcelona TV',
    date: '2025',
  },
];

export function getDailyQuotes(count = 4): Quote[] {
  const day = Math.floor(Date.now() / 86400000);
  const start = (day * count) % QUOTE_POOL.length;
  const result: Quote[] = [];
  for (let i = 0; i < count; i++) {
    result.push(QUOTE_POOL[(start + i) % QUOTE_POOL.length]);
  }
  return result;
}
