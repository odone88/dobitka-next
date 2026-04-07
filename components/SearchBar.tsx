'use client';

import { useState, useRef, useEffect } from 'react';
import { POPULAR_TEAMS } from '@/lib/favorites';
import { LEAGUES } from '@/config/leagues';
import { cn } from '@/lib/utils';

interface SearchResult {
  type: 'team' | 'league';
  id: string;
  name: string;
  shortName: string;
  meta: string;
  href: string;
}

// Build search index from teams and leagues
const SEARCH_INDEX: SearchResult[] = [
  ...POPULAR_TEAMS.map((t) => ({
    type: 'team' as const,
    id: String(t.id),
    name: t.name.toLowerCase(),
    shortName: t.shortName,
    meta: t.league,
    href: `/team/${t.id}`,
  })),
  ...LEAGUES.map((l) => ({
    type: 'league' as const,
    id: l.code,
    name: `${l.name} ${l.country}`.toLowerCase(),
    shortName: l.name,
    meta: l.country,
    href: `/#tabele`,
  })),
];

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.length >= 2
    ? SEARCH_INDEX.filter((r) =>
        r.name.includes(query.toLowerCase()) ||
        r.shortName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Keyboard shortcut: / to open
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && !open && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
        title="Szukaj (nacisnij /)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground flex-shrink-0">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj druzyny..."
          className="bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none w-28 sm:w-40"
        />
        <kbd className="hidden sm:inline text-[9px] text-muted-foreground border border-border rounded px-1">Esc</kbd>
      </div>

      {/* Results dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-2xl z-[100] overflow-hidden animate-fade-in">
          {results.map((r) => (
            <a
              key={`${r.type}-${r.id}`}
              href={r.href}
              onClick={() => { setOpen(false); setQuery(''); }}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent/50 transition-colors border-b border-border last:border-0"
            >
              <span className={cn(
                'w-5 h-5 rounded flex items-center justify-center text-[9px] font-black flex-shrink-0',
                r.type === 'team' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                {r.type === 'team' ? 'T' : 'L'}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] text-foreground font-medium truncate block">{r.shortName}</span>
                <span className="text-[10px] text-muted-foreground">{r.meta}</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-2xl z-[100] p-4 text-center animate-fade-in">
          <p className="text-[12px] text-muted-foreground">Brak wynikow dla &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
