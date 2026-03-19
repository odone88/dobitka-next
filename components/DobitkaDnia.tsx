'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Prediction {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  utcDate: string;
  competition: string;
  competitionCode: string;
  tip: string;
  confidence: number;
  reasoning: string[];
  against: string[];
  category: 'result' | 'goals' | 'btts';
}

const CATEGORY_ICON: Record<string, string> = {
  result: '🏆',
  goals: '⚽',
  btts: '🎯',
};

const CATEGORY_GRADIENT: Record<string, string> = {
  result: 'from-primary/20 to-primary/5',
  goals: 'from-amber/20 to-amber/5',
  btts: 'from-blue-500/20 to-blue-500/5',
};

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            value >= 70 ? 'bg-primary' : value >= 55 ? 'bg-amber' : 'bg-muted-foreground/50'
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={cn(
        'score-display text-[11px] font-black',
        value >= 70 ? 'text-primary' : value >= 55 ? 'text-amber' : 'text-muted-foreground/60'
      )}>
        {value}%
      </span>
    </div>
  );
}

function PredictionCard({ prediction, index }: { prediction: Prediction; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const time = new Date(prediction.utcDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={cn(
        'rounded-xl border border-border/20 overflow-hidden card-elevated cursor-pointer transition-all',
        'bg-gradient-to-br',
        CATEGORY_GRADIENT[prediction.category],
        'animate-fade-in'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4 space-y-3">
        {/* Mecz + czas */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">{CATEGORY_ICON[prediction.category]}</span>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-foreground truncate">
                {prediction.homeTeam} vs {prediction.awayTeam}
              </div>
              <div className="text-[10px] text-muted-foreground/50">
                {prediction.competition} · {time}
              </div>
            </div>
          </div>
          <a
            href={`/match/${prediction.matchId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[9px] text-primary/50 hover:text-primary transition-colors uppercase tracking-widest font-bold flex-shrink-0"
          >
            Mecz →
          </a>
        </div>

        {/* TIP — glowna predykcja */}
        <div className="flex items-center gap-3">
          <span className={cn(
            'text-[18px] sm:text-[22px] font-black font-display leading-tight',
            prediction.confidence >= 70 ? 'text-primary' : 'text-foreground'
          )}>
            {prediction.tip}
          </span>
        </div>

        {/* Confidence bar */}
        <ConfidenceBar value={prediction.confidence} />

        {/* Argumenty — expandable */}
        {expanded && (
          <div className="space-y-2 pt-1 animate-fade-in">
            {prediction.reasoning.length > 0 && (
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60 block mb-1">Za</span>
                {prediction.reasoning.map((r, i) => (
                  <p key={i} className="text-[11px] text-foreground/70 leading-relaxed">+ {r}</p>
                ))}
              </div>
            )}
            {prediction.against.length > 0 && (
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-destructive/60 block mb-1">Przeciw</span>
                {prediction.against.map((r, i) => (
                  <p key={i} className="text-[11px] text-muted-foreground/60 leading-relaxed">- {r}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function DobitkaDnia() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzed, setAnalyzed] = useState(0);

  useEffect(() => {
    fetch('/api/predictions')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.predictions) {
          setPredictions(data.predictions);
          setAnalyzed(data.matchesAnalyzed ?? 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="rounded-xl border border-border/20 bg-card p-6 text-center">
        <p className="text-[14px] font-display text-muted-foreground/50">Brak predykcji na dzis</p>
        <p className="text-[11px] text-muted-foreground/30 mt-1">
          {analyzed > 0
            ? `Przeanalizowano ${analyzed} meczow — za malo danych na pewne typy.`
            : 'Brak zaplanowanych meczow w znanych ligach.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">
            {predictions.length} typow · {analyzed} meczow przeanalizowanych
          </span>
        </div>
      </div>

      {/* Prediction cards */}
      {predictions.map((p, i) => (
        <PredictionCard key={p.matchId + p.category} prediction={p} index={i} />
      ))}

      {/* Disclaimer */}
      <p className="text-[9px] text-muted-foreground/20 text-center">
        Predykcje oparte o pozycje w tabeli, forme i statystyki. Nie stanowia porady bukmacherskiej.
      </p>
    </div>
  );
}
