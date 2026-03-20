import { Skeleton } from '@/components/ui/skeleton';
import { TeamDetailView } from '@/components/TeamDetail';
import { FOOTBALL_DATA_KEY } from '@/config/sources';

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchTeamName(id: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.football-data.org/v4/teams/${id}`, {
      headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.name ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const name = await fetchTeamName(id);
  return {
    title: name ? `${name} — DOBITKA` : `Druzyna #${id} — DOBITKA`,
    description: name
      ? `${name} — profil, sklad, wyniki, forma — DOBITKA`
      : 'Profil druzyny, sklad, wyniki, forma — DOBITKA',
  };
}

export default async function TeamPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-widest">Wstecz</span>
          </a>
          <span className="font-display text-lg tracking-tight text-primary ml-auto">DOBITKA</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <TeamDetailView teamId={id} />
      </main>
    </div>
  );
}
