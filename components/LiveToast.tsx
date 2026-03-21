'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Match, MatchGoal } from '@/types';
import { cn } from '@/lib/utils';

interface GoalEvent {
  id: string;
  scorer: string;
  minute: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  type: MatchGoal['type'];
}

// Toast z golem — slide-in z prawej, auto-dismiss po 5s
function Toast({ event, onDismiss }: { event: GoalEvent; onDismiss: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 300);
    }, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-primary/30 shadow-lg glow-primary',
        'max-w-sm w-full',
        exiting ? 'animate-[slideOutRight_300ms_ease-in_forwards]' : 'animate-[slideInRight_300ms_ease-out]'
      )}
    >
      <span className="text-2xl">⚽</span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-foreground truncate">
          {event.scorer}
          <span className="score-display text-primary ml-1">{event.minute}&apos;</span>
          {event.type === 'PENALTY' && <span className="text-amber text-[10px] ml-1">(k)</span>}
          {event.type === 'OWN_GOAL' && <span className="text-destructive text-[10px] ml-1">(sam.)</span>}
        </div>
        <div className="text-[11px] text-muted-foreground">
          {event.homeTeam} <span className="score-display font-bold text-foreground">{event.homeScore}–{event.awayScore}</span> {event.awayTeam}
        </div>
      </div>
    </div>
  );
}

// Kontener na toasty — monitoruje /api/live i emituje eventy o golach
export function LiveToastContainer() {
  const [toasts, setToasts] = useState<GoalEvent[]>([]);
  const prevGoalsRef = useRef<Map<number, number>>(new Map());
  const prevMatchesRef = useRef<Match[]>([]);

  const checkForGoals = useCallback(async () => {
    try {
      const res = await fetch('/api/live');
      if (!res.ok) return;
      const d = await res.json();
      const matches: Match[] = d.today ?? [];

      const liveMatches = matches.filter(
        (m) => m.status === 'LIVE' || m.status === 'IN_PLAY' || m.status === 'PAUSED'
      );

      for (const m of liveMatches) {
        const totalGoals = (m.homeScore ?? 0) + (m.awayScore ?? 0);
        const prevTotal = prevGoalsRef.current.get(m.id);

        if (prevTotal !== undefined && totalGoals > prevTotal) {
          // Nowy gol! Znajdz strzelca z goals array jesli dostepny
          const prevMatch = prevMatchesRef.current.find((pm) => pm.id === m.id);
          const newGoals = m.goals.filter((g) => {
            if (!prevMatch) return true;
            return !prevMatch.goals.some(
              (pg) => pg.scorer === g.scorer && pg.minute === g.minute && pg.teamId === g.teamId
            );
          });

          const goalInfo = newGoals.length > 0 ? newGoals[newGoals.length - 1] : null;

          const event: GoalEvent = {
            id: `${m.id}-${totalGoals}-${Date.now()}`,
            scorer: goalInfo?.scorer ?? 'GOL',
            minute: goalInfo?.minute ?? m.minute ?? 0,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            homeScore: m.homeScore ?? 0,
            awayScore: m.awayScore ?? 0,
            type: goalInfo?.type ?? 'REGULAR',
          };

          setToasts((prev) => [...prev.slice(-2), event]); // Max 3 toasty
        }

        prevGoalsRef.current.set(m.id, totalGoals);
      }

      prevMatchesRef.current = matches;
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    // Pierwsze wywolanie nie emituje toastow (inicjalizacja)
    const init = async () => {
      try {
        const res = await fetch('/api/live');
        if (!res.ok) return;
        const d = await res.json();
        const matches: Match[] = d.today ?? [];
        for (const m of matches) {
          prevGoalsRef.current.set(m.id, (m.homeScore ?? 0) + (m.awayScore ?? 0));
        }
        prevMatchesRef.current = matches;
      } catch { /* silent */ }
    };

    init();
    const id = setInterval(checkForGoals, 90_000);
    return () => clearInterval(id);
  }, [checkForGoals]);

  function dismissToast(eventId: string) {
    setToasts((prev) => prev.filter((t) => t.id !== eventId));
  }

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-[100] space-y-2">
      {toasts.map((event) => (
        <Toast key={event.id} event={event} onDismiss={() => dismissToast(event.id)} />
      ))}
    </div>
  );
}
