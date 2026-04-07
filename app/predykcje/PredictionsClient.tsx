'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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

interface PredictionResponse {
  predictions: Prediction[];
  generatedAt: string;
  matchesAnalyzed: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  result: 'Wynik',
  goals: 'Gole',
  btts: 'BTTS',
};

const CATEGORY_COLORS: Record<string, string> = {
  result: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  goals: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  btts: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 70 ? 'bg-emerald-500' : value >= 55 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="score-display text-[13px] font-bold text-foreground min-w-[36px] text-right">
        {value}%
      </span>
    </div>
  );
}

export function PredictionsClient() {
  const [data, setData] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/predictions')
      .then(r => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then(setData)
      .catch(() => setData({ predictions: [], generatedAt: '', matchesAnalyzed: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data || data.predictions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-[16px] font-display text-muted-foreground">
            Brak predykcji na dzis
          </p>
          <p className="text-[13px] text-muted-foreground mt-2">
            Predykcje pojawiaja sie gdy sa zaplanowane mecze z danymi o formie druzyn.
          </p>
          <a href="/" className="text-[13px] text-primary hover:underline mt-3 inline-block">
            ← Wstecz
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
        <span>Przeanalizowano {data.matchesAnalyzed} meczow</span>
        <span className="text-border">|</span>
        <span>Top {data.predictions.length} predykcji</span>
      </div>

      {data.predictions.map((pred) => {
        const time = new Date(pred.utcDate).toLocaleTimeString('pl-PL', {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <Card key={`${pred.matchId}-${pred.category}`} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Match header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {pred.homeCrest && (
                    <img src={pred.homeCrest} alt="" className="w-5 h-5 object-contain" loading="lazy" />
                  )}
                  <span className="text-[13px] font-bold text-foreground truncate">{pred.homeTeam}</span>
                </div>
                <span className="text-[12px] font-bold text-muted-foreground">{time}</span>
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <span className="text-[13px] font-bold text-foreground truncate text-right">{pred.awayTeam}</span>
                  {pred.awayCrest && (
                    <img src={pred.awayCrest} alt="" className="w-5 h-5 object-contain" loading="lazy" />
                  )}
                </div>
              </div>

              {/* Prediction body */}
              <div className="px-4 py-3 space-y-3">
                {/* Tip + category */}
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border',
                    CATEGORY_COLORS[pred.category]
                  )}>
                    {CATEGORY_LABELS[pred.category]}
                  </span>
                  <span className="text-[15px] font-black text-foreground">{pred.tip}</span>
                </div>

                {/* Confidence */}
                <ConfidenceBar value={pred.confidence} />

                {/* Reasoning */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                  <div>
                    <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider block mb-1">Za</span>
                    <ul className="space-y-0.5">
                      {pred.reasoning.map((r, i) => (
                        <li key={i} className="text-muted-foreground flex gap-1.5">
                          <span className="text-emerald-500 flex-shrink-0">+</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-red-400 font-bold text-[10px] uppercase tracking-wider block mb-1">Przeciw</span>
                    <ul className="space-y-0.5">
                      {pred.against.map((a, i) => (
                        <li key={i} className="text-muted-foreground flex gap-1.5">
                          <span className="text-red-500 flex-shrink-0">-</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Link to match */}
                <a
                  href={`/match/${pred.matchId}`}
                  className="text-[11px] text-primary/70 hover:text-primary transition-colors"
                >
                  Szczegoly meczu →
                </a>
              </div>

              {/* Competition footer */}
              <div className="px-4 py-2 bg-white/[0.02] border-t border-border">
                <span className="text-[10px] text-muted-foreground">{pred.competition}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center pt-2">
        Predykcje oparte na danych statystycznych. Nie stanowia porad bukmacherskich.
      </p>
    </div>
  );
}
