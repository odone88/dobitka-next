import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCodeFromSlug } from '@/config/league-slugs';
import { getLeague } from '@/config/leagues';
import { TabelaContent } from './tabela-content';

interface Props {
  params: Promise<{ league: string }>;
}

// ─── METADATA ───────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props) {
  const { league: slug } = await params;
  const code = getCodeFromSlug(slug);
  if (!code) return { title: 'Tabela - DOBITKA' };
  const leagueCfg = getLeague(code);
  const name = leagueCfg?.name ?? slug;
  return {
    title: `Tabela ${name} 2025/26 - klasyfikacja na zywo | DOBITKA`,
    description: `Pelna tabela ${name} sezonu 2025/26 - pozycje, punkty, forma, strefy pucharowe. DOBITKA.`,
    openGraph: {
      title: `Tabela ${name} 2025/26 | DOBITKA`,
      description: `Klasyfikacja ${name} na zywo`,
      siteName: 'DOBITKA',
      locale: 'pl_PL',
      type: 'website',
    },
  };
}

// ─── PAGE (server component — no data fetching) ────────────────────────────
export default async function TabelaPage({ params }: Props) {
  const { league: slug } = await params;
  const code = getCodeFromSlug(slug);
  if (!code) notFound();

  const leagueCfg = getLeague(code);
  if (!leagueCfg) notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link
            href={`/${slug}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-widest">Wstecz</span>
          </Link>
          <span className="font-display text-lg tracking-tight text-primary ml-auto">DOBITKA</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* BREADCRUMB */}
        <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Strona glowna</Link>
          <span>/</span>
          <Link href={`/${slug}`} className="hover:text-foreground transition-colors">{leagueCfg.name}</Link>
          <span>/</span>
          <span className="text-foreground">Tabela</span>
        </nav>

        {/* LEAGUE HEADER */}
        <div className="flex items-center gap-3 animate-fade-in">
          <span className="text-3xl">{leagueCfg.flag}</span>
          <div>
            <h1 className={`font-display text-2xl tracking-tight ${leagueCfg.color}`}>
              Tabela {leagueCfg.name}
            </h1>
            <p className="text-[12px] text-muted-foreground">
              {leagueCfg.country}
            </p>
          </div>
        </div>

        {/* CLIENT: data-dependent content */}
        <TabelaContent code={code} />
      </main>
    </div>
  );
}
