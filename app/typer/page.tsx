import { TyperClient } from './TyperClient';

export const metadata = {
  title: 'Typer - typuj wyniki meczow | DOBITKA',
  description: 'Darmowa gra w typowanie wynikow Premier League. Rywalizuj ze znajomymi!',
};

export default function TyperPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-widest">Wstecz</span>
          </a>
          <span className="font-display text-lg tracking-tight text-primary ml-auto">DOBITKA</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-bottom-nav lg:pb-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-primary">Typer</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Typuj wyniki Premier League i sprawdz, ile trafisz.
          </p>
        </div>
        <TyperClient />
      </main>
    </div>
  );
}
