'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Prediction {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  homeCrest?: string;
  awayCrest?: string;
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
  result: '\uD83C\uDFC6',
  goals: '\u26BD',
  btts: '\uD83C\uDFAF',
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

function Crest({ src, name, size = 20 }: { src?: string; name: string; size?: number }) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} width={size} height={size} className="object-contain flex-shrink-0" loading="lazy" />
  );
}

function PredictionCard({ prediction, index }: { prediction: Prediction; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const time = new Date(prediction.utcDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={cn(
        'rounded-xl border border-border overflow-hidden card-elevated cursor-pointer transition-all',
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
            <div className="flex items-center gap-1.5 min-w-0">
              <Crest src={prediction.homeCrest} name={prediction.homeTeam} />
              <span className="text-[13px] font-bold text-foreground truncate">
                {prediction.homeTeam}
              </span>
              <span className="text-[11px] text-muted-foreground">vs</span>
              <span className="text-[13px] font-bold text-foreground truncate">
                {prediction.awayTeam}
              </span>
              <Crest src={prediction.awayCrest} name={prediction.awayTeam} />
            </div>
          </div>
          <a
            href={`/match/${prediction.matchId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[9px] text-primary/50 hover:text-primary transition-colors uppercase tracking-widest font-bold flex-shrink-0"
          >
            Mecz &rarr;
          </a>
        </div>

        {/* Competition + time */}
        <div className="text-[10px] text-muted-foreground -mt-1">
          {prediction.competition} &middot; {time}
        </div>

        {/* TIP */}
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

  useEffect(() => {
    fetch('/api/predictions')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.predictions) {
          setPredictions(data.predictions);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || predictions.length === 0) return null;

  return (
    <section id="dobitka" className="scroll-mt-16 space-y-3">
      <h2 className="flex items-center gap-3">
        <span className="font-display text-[13px] font-normal tracking-wide text-primary">Dobitka dnia</span>
        <span className="flex-1 border-t border-border" aria-hidden="true" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          {predictions.length} typow
        </span>
      </h2>

      {predictions.map((p, i) => (
        <PredictionCard key={p.matchId + p.category} prediction={p} index={i} />
      ))}

      <p className="text-[9px] text-muted-foreground text-center">
        Predykcje oparte o pozycje w tabeli, forme i statystyki. Nie stanowia porady bukmacherskiej.
      </p>
    </section>
  );
}
