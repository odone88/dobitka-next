export interface Quote {
  text: string;
  author: string;
  context?: string;
  date?: string;
  tags: string[];
}

const QUOTE_POOL: Quote[] = [
  {
    text: 'UCL to nie liga — tu jeden błąd kosztuje cię wszystko.',
    author: 'Jürgen Klopp',
    context: 'wywiad BT Sport',
    tags: ['ucl', 'presja', 'eliminacja'],
  },
  {
    text: 'Rewanż to osobny mecz. To co było, nie istnieje.',
    author: 'Carlo Ancelotti',
    context: 'przed rewanżem UCL',
    tags: ['rewanz', 'ucl', 'presja'],
  },
  {
    text: 'W Lidze Mistrzów nie masz prawa do złego dnia. Każdy dostaje dokładnie tyle szans, na ile zasłużył.',
    author: 'Pep Guardiola',
    context: 'konferencja Man City',
    tags: ['ucl', 'presja'],
  },
  {
    text: 'Kiedy słyszę hymn Ligi Mistrzów, włosy stają mi na karku. Po 20 latach tak samo.',
    author: 'Zinédine Zidane',
    context: 'wywiad Canal+',
    tags: ['ucl', 'emocje'],
  },
  {
    text: 'Taki mecz się pamięta przez całe życie. I tak samo pamiętają ci, którym strzeliliśmy.',
    author: 'Vinicius Jr.',
    context: 'po meczu Real Madryt w UCL',
    tags: ['ucl', 'zwyciestwo'],
  },
  {
    text: 'Drużyna, która boi się przegrać, nigdy nie wygra.',
    author: 'Johan Cruyff',
    tags: ['mentalnosc', 'zwyciestwo'],
  },
  {
    text: 'Futbol to gra prosty. 22 ludzi goni piłkę przez 90 minut, a na końcu wygrywają Niemcy.',
    author: 'Gary Lineker',
    tags: ['humor', 'klasyka'],
  },
  {
    text: 'Nie chodzi o pieniądze. Chodzi o puchary. Wygląda na to, że jest też o pieniądze.',
    author: 'Samuel Eto\'o',
    context: 'wywiad po transferze do Interu',
    tags: ['transfer', 'humor'],
  },
  {
    text: 'Presja? Presja to brak tlenu na szczycie K2. To jest tylko futbol.',
    author: 'Rafael Benítez',
    context: 'konferencja przed finałem w Stambule',
    tags: ['presja', 'ucl', 'mentalnosc'],
  },
  {
    text: 'Mogliśmy wygrać. Powinniśmy byli wygrać. Nie wygraliśmy.',
    author: 'Pep Guardiola',
    context: 'konferencja po meczu Man City',
    tags: ['porazka', 'presja'],
  },
  {
    text: 'Piłka nożna to gra dla drużyn, nie dla gwiazd. Dziś to pokazaliśmy.',
    author: 'Hansi Flick',
    context: 'po zwycięstwie FC Barcelony',
    tags: ['druzyna', 'zwyciestwo'],
  },
  {
    text: 'W tym klubie nie ma małych meczów. Są mecze i są finały.',
    author: 'Diego Simeone',
    context: 'konferencja Atletico',
    tags: ['mentalnosc', 'presja'],
  },
  {
    text: 'Jestem szczęśliwy z gola, ale szczęśliwszy z wygranej.',
    author: 'Erling Haaland',
    context: 'po meczu z Arsenal',
    tags: ['zwyciestwo', 'druzyna'],
  },
  {
    text: 'Nikt cię nie pamięta za to, jak pięknie przegrywałeś.',
    author: 'Cristiano Ronaldo',
    context: 'wywiad po zdobyciu Ligi Mistrzów',
    tags: ['ucl', 'zwyciestwo', 'mentalnosc'],
  },
  {
    text: 'W drugiej połowie zmieniliśmy styl. Bo w pierwszej nie mieliśmy żadnego.',
    author: 'Thomas Tuchel',
    context: 'konferencja Chelsea',
    tags: ['humor', 'taktyka'],
  },
  {
    text: 'Kiedy masz Messiego, masz plan A, plan B i plan C. Reszta to szczegóły.',
    author: 'Luis Enrique',
    context: 'wywiad po sezonie potrójnej korony',
    tags: ['taktyka', 'klasyka'],
  },
  {
    text: 'Nie czytam tego co piszą o mnie w mediach. Skupiam się na boisku.',
    author: 'Robert Lewandowski',
    context: 'wywiad dla FC Barcelona TV',
    tags: ['mentalnosc', 'polska'],
  },
  {
    text: 'Remis na wyjeździe to nie porażka. Ale wracamy do domu głodni.',
    author: 'Arne Slot',
    context: 'po meczu Liverpool w UCL',
    tags: ['ucl', 'rewanz', 'mentalnosc'],
  },
  {
    text: 'Przeciwnik miał plan. My mieliśmy lepszy plan. I Mbappé.',
    author: 'Didier Deschamps',
    context: 'konferencja po meczu Francji',
    tags: ['taktyka', 'zwyciestwo'],
  },
  {
    text: 'Każdy finał Ligi Mistrzów to osobna historia. Nie ma faworytów po pierwszym gwizdku.',
    author: 'Sir Alex Ferguson',
    context: 'wywiad ESPN',
    tags: ['ucl', 'presja', 'klasyka'],
  },
  {
    text: 'Gramy dla kibiców. Oni tu nie przyszli oglądać remisu.',
    author: 'Jürgen Klopp',
    context: 'po meczu na Anfield',
    tags: ['emocje', 'kibice'],
  },
  {
    text: 'Mówią, że jestem defensywny. Nie. Jestem skuteczny.',
    author: 'José Mourinho',
    context: 'konferencja Chelsea',
    tags: ['taktyka', 'humor', 'mentalnosc'],
  },
  {
    text: 'Trzy gole przewagi to najniebezpieczniejszy wynik w piłce. Pytajcie Barcelonę.',
    author: 'Jamie Carragher',
    context: 'komentarz po remontadzie',
    tags: ['ucl', 'rewanz', 'humor'],
  },
  {
    text: 'Wygrywamy jako drużyna, przegrywamy jako drużyna. Indywidualności zostawiamy szatnię.',
    author: 'Mikel Arteta',
    context: 'konferencja Arsenal',
    tags: ['druzyna', 'mentalnosc'],
  },
];

/**
 * Pick quotes for today with optional tag-based priority.
 * priorityTags: if UCL day, pass ['ucl','rewanz','presja'] etc.
 */
export function getDailyQuotes(count = 4, priorityTags: string[] = []): Quote[] {
  const day = Math.floor(Date.now() / 86400000);

  if (priorityTags.length > 0) {
    // Score quotes by tag overlap
    const scored = QUOTE_POOL.map((q, idx) => {
      const overlap = q.tags.filter((t) => priorityTags.includes(t)).length;
      return { q, idx, overlap };
    });
    // Sort: highest overlap first, then deterministic shuffle
    scored.sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return ((a.idx + day) % QUOTE_POOL.length) - ((b.idx + day) % QUOTE_POOL.length);
    });
    return scored.slice(0, count).map((s) => s.q);
  }

  // Default: rotate through pool
  const start = (day * count) % QUOTE_POOL.length;
  const result: Quote[] = [];
  for (let i = 0; i < count; i++) {
    result.push(QUOTE_POOL[(start + i) % QUOTE_POOL.length]);
  }
  return result;
}
