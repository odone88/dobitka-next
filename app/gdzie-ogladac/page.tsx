import type { Metadata } from 'next';
import Link from 'next/link';
import { LEAGUES } from '@/config/leagues';

export const metadata: Metadata = {
  title:
    'Gdzie ogladac pilke nozna w Polsce? Nadawcy TV i streaming 2025/26 | DOBITKA',
  description:
    'Sprawdz gdzie ogladac Ekstraklase, Premier League, La Lige, Serie A, Bundeslige i Ligue 1 w Polsce.',
  openGraph: {
    title:
      'Gdzie ogladac pilke nozna w Polsce? Nadawcy TV i streaming 2025/26 | DOBITKA',
    description:
      'Sprawdz gdzie ogladac Ekstraklase, Premier League, La Lige, Serie A, Bundeslige i Ligue 1 w Polsce.',
    siteName: 'DOBITKA',
    locale: 'pl_PL',
    type: 'website',
  },
};

const TV_DATA: { liga: string; leagueCode: string | null; flag: string; nadawca: string; platforma: string }[] = [
  { liga: 'Ekstraklasa', leagueCode: 'PPL', flag: '', nadawca: 'Canal+ Sport', platforma: 'TV + streaming' },
  { liga: 'Premier League', leagueCode: 'PL', flag: '', nadawca: 'Viaplay', platforma: 'Streaming' },
  { liga: 'La Liga', leagueCode: 'PD', flag: '', nadawca: 'Eleven Sports', platforma: 'TV + streaming' },
  { liga: 'Bundesliga', leagueCode: 'BL1', flag: '', nadawca: 'Viaplay', platforma: 'Streaming' },
  { liga: 'Serie A', leagueCode: 'SA', flag: '', nadawca: 'Eleven Sports', platforma: 'TV + streaming' },
  { liga: 'Ligue 1', leagueCode: 'FL1', flag: '', nadawca: 'Eleven Sports', platforma: 'TV + streaming' },
  { liga: 'Liga Mistrzow', leagueCode: 'CL', flag: '', nadawca: 'Canal+', platforma: 'TV + streaming' },
  { liga: 'Liga Europy', leagueCode: null, flag: '\u{1F3C6}', nadawca: 'Polsat Sport Premium', platforma: 'TV + streaming' },
  { liga: 'Liga Konferencji', leagueCode: null, flag: '\u{1F3C6}', nadawca: 'Polsat Sport Premium', platforma: 'TV + streaming' },
];

function getFlag(item: (typeof TV_DATA)[number]): string {
  if (item.leagueCode) {
    const league = LEAGUES.find((l) => l.code === item.leagueCode);
    if (league) return league.flag;
  }
  return item.flag;
}

export default function GdzieOgladacPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-widest">
              Wstecz
            </span>
          </Link>

          <span className="font-display text-lg tracking-tight text-primary ml-auto">
            DOBITKA
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-bottom-nav lg:pb-6">
        <h1 className="font-display text-2xl tracking-tight mb-1">
          Gdzie ogladac pilke nozna?
        </h1>
        <p className="text-[13px] text-muted-foreground mb-6">
          Przewodnik po nadawcach w Polsce — sezon 2025/26
        </p>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="label-retro text-left py-3 pr-4">Liga</th>
                <th className="label-retro text-left py-3 pr-4">Nadawca</th>
                <th className="label-retro text-left py-3">Platforma</th>
              </tr>
            </thead>
            <tbody>
              {TV_DATA.map((item) => (
                <tr
                  key={item.liga}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <span className="mr-2">{getFlag(item)}</span>
                    {item.liga}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {item.nadawca}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {item.platforma}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[13px] text-muted-foreground mt-6">
          Informacje aktualne na sezon 2025/26. Sprawdz u nadawcy aktualne ceny
          i dostepnosc.
        </p>
      </main>
    </div>
  );
}
