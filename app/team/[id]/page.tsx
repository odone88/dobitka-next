import { cache } from 'react';
import { TeamDetailView } from '@/components/TeamDetail';
import { FOOTBALL_DATA_KEY } from '@/config/sources';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

interface TeamMeta {
  name: string;
  shortName: string;
  crest: string;
  venue: string;
  founded: number;
  address: string;
}

const fetchTeamMeta = cache(async (id: string): Promise<TeamMeta | null> => {
  try {
    const res = await fetch(`https://api.football-data.org/v4/teams/${id}`, {
      headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      name: data.name ?? '',
      shortName: data.shortName ?? data.tla ?? '',
      crest: data.crest ?? '',
      venue: data.venue ?? '',
      founded: data.founded ?? 0,
      address: data.address ?? '',
    };
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const teamId = parseInt(id, 10);
  if (isNaN(teamId) || teamId < 1 || teamId > 99999) {
    return { title: 'Nie znaleziono -- DOBITKA' };
  }

  const meta = await fetchTeamMeta(id);
  const name = meta?.name;
  return {
    title: name ? `${name} -- DOBITKA` : `Druzyna #${id} -- DOBITKA`,
    description: name
      ? `${name} -- profil, skład, wyniki, forma. Portal pilkarski DOBITKA.`
      : 'Profil druzyny, skład, wyniki, forma -- DOBITKA',
    openGraph: name
      ? {
          title: `${name} -- DOBITKA`,
          description: `${name} -- profil, skład, wyniki, forma`,
          images: meta?.crest ? [{ url: meta.crest, width: 256, height: 256 }] : [],
        }
      : undefined,
  };
}

export default async function TeamPage({ params }: Props) {
  const { id } = await params;
  const teamId = parseInt(id, 10);

  if (isNaN(teamId) || teamId < 1 || teamId > 99999) {
    notFound();
  }

  const meta = await fetchTeamMeta(id);

  // JSON-LD SportsTeam schema
  const jsonLd = meta
    ? {
        '@context': 'https://schema.org',
        '@type': 'SportsTeam',
        name: meta.name,
        alternateName: meta.shortName,
        logo: meta.crest,
        url: `https://dobitka.pl/team/${id}`,
        sport: 'Football',
        location: meta.venue
          ? {
              '@type': 'StadiumOrArena',
              name: meta.venue,
              address: meta.address || undefined,
            }
          : undefined,
        foundingDate: meta.founded ? String(meta.founded) : undefined,
      }
    : null;

  // Breadcrumb JSON-LD
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'DOBITKA',
        item: 'https://dobitka.pl/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: meta?.name ?? `Druzyna #${id}`,
        item: `https://dobitka.pl/team/${id}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* JSON-LD */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors"
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
          </a>
          <a href="/" className="font-display text-lg tracking-tight text-primary ml-auto">
            DOBITKA
          </a>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="max-w-3xl mx-auto px-4 pt-3 pb-1">
        <ol className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <li>
            <a href="/" className="hover:text-foreground transition-colors">
              Strona glowna
            </a>
          </li>
          <li>
            <span className="mx-1">/</span>
          </li>
          <li className="text-foreground truncate max-w-[200px]">
            {meta?.shortName ?? meta?.name ?? `Druzyna #${id}`}
          </li>
        </ol>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-4 pb-bottom-nav lg:pb-6">
        <TeamDetailView teamId={id} />
      </main>
    </div>
  );
}
