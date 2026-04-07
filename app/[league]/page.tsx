import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCodeFromSlug } from '@/config/league-slugs';
import { getLeague } from '@/config/leagues';
import { LeagueContent } from './league-content';

interface Props {
  params: Promise<{ league: string }>;
}

// ─── METADATA ───────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props) {
  const { league: slug } = await params;
  const code = getCodeFromSlug(slug);
  if (!code) return { title: 'Liga - DOBITKA' };
  const leagueCfg = getLeague(code);
  const name = leagueCfg?.name ?? slug;
  return {
    title: `${name} 2025/26 - mecze, tabela, strzelcy | DOBITKA`,
    description: `${name} - wyniki, tabela, najlepsi strzelcy sezonu 2025/26. DOBITKA.`,
    openGraph: {
      title: `${name} 2025/26 | DOBITKA`,
      description: `Mecze, tabela i strzelcy ${name}`,
      siteName: 'DOBITKA',
      locale: 'pl_PL',
      type: 'website',
    },
  };
}

// ─── PAGE (server component — no data fetching) ────────────────────────────
export default async function LeaguePage({ params }: Props) {
  const { league: slug } = await params;
  const code = getCodeFromSlug(slug);
  if (!code) notFound();

  const leagueCfg = getLeague(code);
  if (!leagueCfg) notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link
            href="/"
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

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* BREADCRUMB */}
        <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Strona glowna</Link>
          <span>/</span>
          <span className="text-foreground">{leagueCfg.name}</span>
        </nav>

        {/* LEAGUE HEADER */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{leagueCfg.flag}</span>
            <div>
              <h1 className={`font-display text-2xl tracking-tight ${leagueCfg.color}`}>
                {leagueCfg.name}
              </h1>
              <p className="text-[12px] text-muted-foreground">
                {leagueCfg.country}
              </p>
            </div>
          </div>
        </div>

        {/* CLIENT: data-dependent content */}
        <LeagueContent code={code} slug={slug} />
      </main>
    </div>
  );
}
