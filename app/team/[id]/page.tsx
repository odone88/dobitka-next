import { TeamDetailView } from '@/components/TeamDetail';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const teamId = parseInt(id, 10);
  if (isNaN(teamId) || teamId < 1 || teamId > 99999) {
    return { title: 'Nie znaleziono -- DOBITKA' };
  }

  return {
    title: `Druzyna #${id} -- DOBITKA`,
    description: 'Profil druzyny, sklad, wyniki, forma -- DOBITKA',
    openGraph: {
      title: `Druzyna -- DOBITKA`,
      description: 'Profil druzyny, sklad, wyniki, forma',
      siteName: 'DOBITKA',
      locale: 'pl_PL',
      type: 'website',
    },
  };
}

export default async function TeamPage({ params }: Props) {
  const { id } = await params;
  const teamId = parseInt(id, 10);

  if (isNaN(teamId) || teamId < 1 || teamId > 99999) {
    notFound();
  }

  // Breadcrumb JSON-LD (generic, no API call needed)
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
        name: `Druzyna #${id}`,
        item: `https://dobitka.pl/team/${id}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Breadcrumb JSON-LD */}
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
            Druzyna
          </li>
        </ol>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-4 pb-bottom-nav lg:pb-6">
        <TeamDetailView teamId={id} />
      </main>
    </div>
  );
}
