'use client';

import { useState, useEffect } from 'react';
import { POPULAR_TEAMS, getFavoriteIds, toggleFavorite, isFirstVisit, markOnboardingDone } from '@/lib/favorites';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onChanged: (ids: number[]) => void;
}

const LEAGUE_LABELS: Record<string, string> = {
  PL: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
  PD: '🇪🇸 La Liga',
  SA: '🇮🇹 Serie A',
  BL1: '🇩🇪 Bundesliga',
  FL1: '🇫🇷 Ligue 1',
  EKL: '🇵🇱 Polska',
};

export function FavoritesPicker({ isOpen, onClose, onChanged }: Props) {
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelected(getFavoriteIds());
    }
  }, [isOpen]);

  function handleToggle(id: number) {
    const next = toggleFavorite(id);
    setSelected(next);
    onChanged(next);
  }

  function handleDone() {
    markOnboardingDone();
    onClose();
  }

  if (!isOpen) return null;

  // Grupuj po lidze
  const byLeague = new Map<string, typeof POPULAR_TEAMS>();
  for (const team of POPULAR_TEAMS) {
    if (!byLeague.has(team.league)) byLeague.set(team.league, []);
    byLeague.get(team.league)!.push(team);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleDone} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-border">
          <h2 className="font-display text-xl text-primary">Moje druzyny</h2>
          <p className="text-[12px] text-muted-foreground mt-1">
            Wybierz ulubione — ich mecze beda zawsze na gorze.
          </p>
        </div>

        {/* Team list */}
        <div className="p-4 overflow-y-auto max-h-[55vh] space-y-4">
          {[...byLeague.entries()].map(([league, teams]) => (
            <div key={league}>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                {LEAGUE_LABELS[league] ?? league}
              </span>
              <div className="flex flex-wrap gap-2">
                {teams.map((team) => {
                  const isSelected = selected.includes(team.id);
                  return (
                    <button
                      key={team.id}
                      onClick={() => handleToggle(team.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer',
                        'border',
                        isSelected
                          ? 'bg-primary/20 border-primary/50 text-primary'
                          : 'bg-white/[0.03] border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      )}
                    >
                      {team.shortName}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {selected.length > 0 ? `${selected.length} wybranych` : 'Zadna nie wybrana'}
          </span>
          <button
            onClick={handleDone}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] font-bold hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Gotowe
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook do zarzadzania ulubionymi — BEZ auto-popup
export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    setFavoriteIds(getFavoriteIds());
  }, []);

  return {
    favoriteIds,
    showPicker,
    setShowPicker,
    handleChanged: (ids: number[]) => setFavoriteIds(ids),
  };
}
