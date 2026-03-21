import { MatchDetailView } from '@/components/MatchDetail';
import { getMatchFull } from '@/lib/data-sources/football-data';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const matchId = parseInt(id, 10);
  if (isNaN(matchId)) {
    return { title: 'Mecz — DOBITKA' };
  }

  const match = await getMatchFull(matchId);
  if (!match) {
    return { title: `Mecz #${id} — DOBITKA` };
  }

  return {
    title: `${match.homeTeam} vs ${match.awayTeam} — DOBITKA`,
    description: `${match.competition}${match.homeScore !== null ? ` | ${match.homeScore}:${match.awayScore}` : ''} — DOBITKA`,
  };
}

export default async function MatchPage({ params }: Props) {
  const { id } = await params;
  const matchId = parseInt(id, 10);

  // SSR fetch — match detail renders immediately, no skeleton
  const initialMatch = !isNaN(matchId) ? await getMatchFull(matchId) : null;

  // JSON-LD SportsEvent structured data for SEO
  const jsonLd = initialMatch ? {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${initialMatch.homeTeam} vs ${initialMatch.awayTeam}`,
    startDate: initialMatch.utcDate,
    location: initialMatch.venue ? {
      '@type': 'Place',
      name: initialMatch.venue,
    } : undefined,
    homeTeam: {
      '@type': 'SportsTeam',
      name: initialMatch.homeTeam,
      ...(initialMatch.homeCrest && { logo: initialMatch.homeCrest }),
    },
    awayTeam: {
      '@type': 'SportsTeam',
      name: initialMatch.awayTeam,
      ...(initialMatch.awayCrest && { logo: initialMatch.awayCrest }),
    },
    ...(initialMatch.homeScore !== null && {
      eventStatus: initialMatch.status === 'FINISHED' ? 'https://schema.org/EventCompleted' : 'https://schema.org/EventScheduled',
    }),
    description: `${initialMatch.competition} — ${initialMatch.homeTeam} vs ${initialMatch.awayTeam}`,
  } : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-widest">Wstecz</span>
          </a>
          <span className="font-display text-lg tracking-tight text-primary ml-auto">DOBITKA</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <MatchDetailView matchId={id} initialMatch={initialMatch} />
      </main>
    </div>
  );
}
