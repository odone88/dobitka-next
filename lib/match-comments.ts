/**
 * Match commentary generator — seeded by matchId for stable rendering.
 * Used by both UCL bracket comments and MatchHero editorial lines.
 */

type CommentFn = (winner: string, loser: string) => string;

// ─── FINISHED MATCH VARIANTS ────────────────────────────────────────────────

const MASSACRE: CommentFn[] = [
  (w, l) => `Rzeź. ${l} nawet nie zabrudziło butów.`,
  (w, l) => `${w} przyszło, zobaczyło, zniszczyło. ${l} już żałuje, że przyjechało.`,
  (w, l) => `Pogrzeb. ${l} kopało grób przez 90 minut — ${w} tylko zasypywało.`,
  (w, l) => `Mecz poza dyskusją. ${w} mogło grać z zamkniętymi oczami.`,
  (w, l) => `${l} wróci z tego meczu z traumą. ${w} bez litości.`,
  (w, l) => `Demolka. ${w} nie miało rywala — ${l} podpisało kapitulację po przerwie.`,
];

const BIG_WIN: CommentFn[] = [
  (w, l) => `${w} przyszło, zobaczyło, rozjechało. Rewanż to formalność na papierze.`,
  (w, l) => `Brutalnie skuteczne. ${w} zamknęło mecz w pierwszej połowie, ${l} szukało powietrza.`,
  (w, l) => `Klasa. ${w} grało swoje, ${l} grało w obronie. Łatwo zgadnąć, kto wygrał.`,
  (w, l) => `${w} dominowało od pierwszego gwizdka. ${l} miało tyle z gry, co kibice z cen biletów.`,
  (w, l) => `Lekcja futbolu. ${w} uczyło, ${l} robiło notatki i przegrywało.`,
  (w, l) => `Pełna kontrola. ${w} zarządziło tym meczem jak firma swoim budżetem.`,
];

const NARROW_WIN: CommentFn[] = [
  (w, l) => `Cienka przewaga. Rewanż będzie wojną.`,
  (w, l) => `${w} prowadzi, ale ${l} oddycha mu w kark. To się jeszcze może odwrócić.`,
  (w, l) => `Minimalna różnica, maksymalna emocja. ${l} ma broń, żeby to odrobić.`,
  (w, l) => `${w} z nosem z przodu, ale ${l} nie złożyło broni.`,
  (w, l) => `Wygrany mecz, nie wygrana dwumecz. ${l} jedzie na rewanż z nożem w zębach.`,
  (w, l) => `Jeden gol różnicy — nic pewnego. ${l} wie, co musi zrobić.`,
];

const DRAW: CommentFn[] = [
  (h, a) => `Sprawiedliwy wynik dla niesprawiedliwego meczu. Nikt nie zasłużył na trzy punkty.`,
  (h, a) => `Remis, który smakuje jak porażka dla obu. Rewanż będzie inny.`,
  (h, a) => `Honory wyrównane. ${h} i ${a} spotkają się ponownie i wtedy ktoś musi odpaść.`,
  (h, a) => `Nic nie rozstrzygnięte. Obaj trenerzy patrzą na rewanż z mieszanymi uczuciami.`,
  (h, a) => `Podział punktów, ale nie emocji. To był mecz godny Ligi Mistrzów.`,
  (h, a) => `Remis — ale nie nudny. Obaj zaryzykowali i obaj wyszli z jednym punktem.`,
];

// ─── LIVE MATCH VARIANTS ────────────────────────────────────────────────────

const LIVE_DRAW: CommentFn[] = [
  () => `Nikt nie chce wygrać. Albo obaj chcą za bardzo.`,
  () => `Patowa sytuacja na żywo. Ktoś musi zaryzykować.`,
  (h, a) => `${h} i ${a} trzymają się za gardła. Na razie remis.`,
  () => `Równowaga sił. Ale w każdej minucie może się zawalić.`,
  () => `Na razie po zero ryzyka. Ale cisza przed burzą bywa głośna.`,
];

const LIVE_LEADING: CommentFn[] = [
  (w, l) => `${w} prowadzi. ${l} szuka odpowiedzi — na razie bez skutku.`,
  (w, l) => `Przewaga ${w}. ${l} musi zaatakować albo wracać do domu.`,
  (w, l) => `${w} z kontrolą, ${l} goni wynik. Zegar nie jest po stronie goniących.`,
  (w, l) => `Tablica wyników mówi jasno: ${w} na koniu. ${l} pod presją.`,
  (w, l) => `${w} dyktuje tempo. ${l} potrzebuje momentu olśnienia.`,
];

// ─── UPCOMING / PAUSED VARIANTS ─────────────────────────────────────────────

const UPCOMING: ((time: string) => string)[] = [
  (t) => `Początek o ${t}. Jeden z meczów, które warto obejrzeć.`,
  (t) => `Start o ${t}. Kto lepiej przygotowany, ten wygra.`,
  (t) => `O ${t} piłka ruszy. To może być historia.`,
  (t) => `Gwizdek o ${t}. Bukmacherzy zacierają ręce.`,
  (t) => `Mecz dnia? O ${t} się przekonamy.`,
];

const PAUSED: string[] = [
  'Przerwa. Oba zespoły liczą straty i planują drugą połowę.',
  'Szatnie. Trenerzy rysują nowe strzałki na tablicy.',
  'Przerwa — czas na herbatę i korektę taktyki.',
  'Połowa za nami. Druga może wyglądać zupełnie inaczej.',
  'Break. Kto wyjdzie z szatni z lepszym planem?',
];

// ─── SEEDED SELECTION ───────────────────────────────────────────────────────

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

// ─── PUBLIC API ─────────────────────────────────────────────────────────────

/**
 * Generate a bracket/UCL match comment for finished matches.
 * Seed by matchId for stable renders.
 */
export function getMatchComment(
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number,
  matchId: number,
): string {
  const diff = homeScore - awayScore;
  const winner = diff > 0 ? homeTeam : awayTeam;
  const loser = diff > 0 ? awayTeam : homeTeam;
  const absDiff = Math.abs(diff);

  if (diff === 0) return pick(DRAW, matchId)(homeTeam, awayTeam);
  if (absDiff >= 5) return pick(MASSACRE, matchId)(winner, loser);
  if (absDiff >= 3) return pick(BIG_WIN, matchId)(winner, loser);
  return pick(NARROW_WIN, matchId)(winner, loser);
}

/**
 * Generate an editorial line for the MatchHero component.
 * Handles all match states: live, paused, finished, upcoming.
 */
export function getEditorialLine(
  homeTeam: string,
  awayTeam: string,
  homeScore: number | null,
  awayScore: number | null,
  status: string,
  utcDate: string,
  matchId: number,
): string {
  if (status === 'LIVE' || status === 'IN_PLAY') {
    if (homeScore === awayScore) return pick(LIVE_DRAW, matchId)(homeTeam, awayTeam);
    const leading = homeScore! > awayScore! ? homeTeam : awayTeam;
    const trailing = homeScore! > awayScore! ? awayTeam : homeTeam;
    return pick(LIVE_LEADING, matchId)(leading, trailing);
  }

  if (status === 'PAUSED') return pick(PAUSED, matchId);

  if (status === 'FINISHED' && homeScore !== null && awayScore !== null) {
    return getMatchComment(homeTeam, awayTeam, homeScore, awayScore, matchId);
  }

  const time = new Date(utcDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  return pick(UPCOMING, matchId)(time);
}
