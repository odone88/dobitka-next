'use client';

import { FavoritesPicker, useFavorites } from '@/components/FavoritesPicker';

export function HomeClient() {
  const { favoriteIds, showPicker, setShowPicker, handleChanged } = useFavorites();

  return (
    <>
      <nav aria-label="Nawigacja główna" className="flex items-center gap-2 sm:gap-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <a href="#live"   className="tab-underline hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded transition-colors py-1 px-1">Live</a>
        <a href="#mecze"  className="tab-underline hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded transition-colors py-1 px-1">Mecze</a>
        <a href="#ucl"    className="tab-underline hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded transition-colors py-1 px-1 hidden sm:inline">UCL</a>
        <a href="#tabele" className="tab-underline hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded transition-colors py-1 px-1 hidden sm:inline">Tabele</a>
        <a href="#newsy"  className="tab-underline hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded transition-colors py-1 px-1">Newsy</a>
        <span className="text-border hidden sm:inline" aria-hidden="true">|</span>
        <a href="/archive" className="hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded transition-colors py-1 px-1 hidden sm:inline">Archiwum</a>

        {/* Favorites — dyskretny przycisk */}
        <button
          onClick={() => setShowPicker(true)}
          className="relative ml-1 p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
          title="Moje drużyny"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={favoriteIds.length > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               className={favoriteIds.length > 0 ? 'text-primary' : 'text-muted-foreground'}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
          {favoriteIds.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary text-primary-foreground rounded-full text-[8px] font-black flex items-center justify-center">
              {favoriteIds.length}
            </span>
          )}
        </button>
      </nav>

      <FavoritesPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onChanged={handleChanged}
      />
    </>
  );
}
