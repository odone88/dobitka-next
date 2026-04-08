'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type {
  TyperRound,
  TyperFixture,
  TyperPrediction,
  TyperResult,
} from '@/lib/typer';
import {
  savePredictions,
  getPredictions,
  isBeforeDeadline,
  timeUntilDeadline,
  scoreResult,
  calculateRoundScore,
  getNickname,
  setNickname as saveNickname,
  getTotalStats,
  getAllEntries,
} from '@/lib/typer';

// ─── Types ──────────────────────────────────────────────────────────────────

type Tab = 'typuj' | 'wyniki' | 'statystyki';

interface TyperData {
  current: TyperRound | null;
  next: TyperRound | null;
  previous: TyperRound | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatKickoff(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${time}`;
}

// ─── Loading skeleton ───────────────────────────────────────────────────────

function TyperSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded-lg" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}

// ─── Tab button ─────────────────────────────────────────────────────────────

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 py-2.5 text-sm font-bold uppercase tracking-wider transition-all rounded-lg',
        active
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
    >
      {label}
    </button>
  );
}

// ─── Score input (single digit) ─────────────────────────────────────────────

function ScoreInput({
  value,
  onChange,
  disabled,
  side,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  side: 'home' | 'away';
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '');
    const digit = raw.slice(-1); // take last digit typed
    if (digit === '' || (Number(digit) >= 0 && Number(digit) <= 9)) {
      onChange(digit);
    }
  }

  function handleFocus() {
    inputRef.current?.select();
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      pattern="[0-9]"
      maxLength={1}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      disabled={disabled}
      className={cn(
        'w-11 h-11 text-center score-display text-xl rounded-lg',
        'bg-muted/60 border border-border',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'transition-all',
        side === 'home' ? 'mr-1' : 'ml-1'
      )}
      aria-label={side === 'home' ? 'Gole gospodarzy' : 'Gole gosci'}
    />
  );
}

// ─── Fixture row (prediction mode) ─────────────────────────────────────────

function FixtureRow({
  fixture,
  homeVal,
  awayVal,
  onHome,
  onAway,
  disabled,
  index,
}: {
  fixture: TyperFixture;
  homeVal: string;
  awayVal: string;
  onHome: (v: string) => void;
  onAway: (v: string) => void;
  disabled: boolean;
  index: number;
}) {
  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <Card size="sm">
        <CardContent className="!py-3">
          {/* Mobile: stack vertically. Desktop: single row */}
          <div className="flex items-center justify-between gap-2">
            {/* Home team */}
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <span className="text-sm font-semibold truncate text-right hidden sm:block">
                {fixture.homeTeam}
              </span>
              <span className="text-sm font-bold truncate text-right sm:hidden">
                {fixture.homeShort}
              </span>
              <Image
                src={fixture.homeCrest}
                alt={fixture.homeShort}
                width={28}
                height={28}
                className="shrink-0"
                unoptimized
              />
            </div>

            {/* Score inputs */}
            <div className="flex items-center gap-0 shrink-0">
              <ScoreInput value={homeVal} onChange={onHome} disabled={disabled} side="home" />
              <span className="score-display text-lg text-muted-foreground px-0.5">:</span>
              <ScoreInput value={awayVal} onChange={onAway} disabled={disabled} side="away" />
            </div>

            {/* Away team */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Image
                src={fixture.awayCrest}
                alt={fixture.awayShort}
                width={28}
                height={28}
                className="shrink-0"
                unoptimized
              />
              <span className="text-sm font-semibold truncate hidden sm:block">
                {fixture.awayTeam}
              </span>
              <span className="text-sm font-bold truncate sm:hidden">
                {fixture.awayShort}
              </span>
            </div>
          </div>

          {/* Kickoff time */}
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            {formatKickoff(fixture.kickoff)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Result row ─────────────────────────────────────────────────────────────

function ResultRow({
  fixture,
  result,
  index,
}: {
  fixture: TyperFixture;
  result: TyperResult | null;
  index: number;
}) {
  const pointsColor =
    result?.type === 'exact'
      ? 'bg-primary/20 text-primary'
      : result?.type === 'result'
        ? 'bg-amber/20 text-amber'
        : 'bg-destructive/10 text-destructive';

  const pointsIcon =
    result?.type === 'exact'
      ? '//' // checkmark
      : result?.type === 'result'
        ? '~'
        : 'X';

  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <Card size="sm">
        <CardContent className="!py-3 space-y-2">
          {/* Teams + actual result */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <span className="text-sm font-bold truncate text-right sm:hidden">
                {fixture.homeShort}
              </span>
              <span className="text-sm font-semibold truncate text-right hidden sm:block">
                {fixture.homeTeam}
              </span>
              <Image
                src={fixture.homeCrest}
                alt={fixture.homeShort}
                width={28}
                height={28}
                className="shrink-0"
                unoptimized
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="score-display text-xl w-8 text-center">
                {fixture.homeScore ?? '-'}
              </span>
              <span className="score-display text-lg text-muted-foreground">:</span>
              <span className="score-display text-xl w-8 text-center">
                {fixture.awayScore ?? '-'}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Image
                src={fixture.awayCrest}
                alt={fixture.awayShort}
                width={28}
                height={28}
                className="shrink-0"
                unoptimized
              />
              <span className="text-sm font-bold truncate sm:hidden">
                {fixture.awayShort}
              </span>
              <span className="text-sm font-semibold truncate hidden sm:block">
                {fixture.awayTeam}
              </span>
            </div>
          </div>

          {/* User prediction + points */}
          {result ? (
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="text-xs text-muted-foreground">
                Twoj typ:{' '}
                <span className="score-display text-foreground">
                  {result.predicted.home}:{result.predicted.away}
                </span>
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold counter-animate',
                  pointsColor
                )}
              >
                <span>{pointsIcon === '//' ? '++' : pointsIcon}</span>
                {result.points} pkt
              </span>
            </div>
          ) : (
            <div className="border-t border-border pt-2">
              <span className="text-xs text-muted-foreground">Nie typowano</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Stats card ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="!py-3 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="score-display text-2xl text-primary counter-animate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Main client component ──────────────────────────────────────────────────

export function TyperClient() {
  const [data, setData] = useState<TyperData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('typuj');
  const [scores, setScores] = useState<Record<number, { home: string; away: string }>>({});
  const [saved, setSaved] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [nickname, setNicknameState] = useState('');

  // Fetch data
  useEffect(() => {
    fetch('/api/typer')
      .then((r) => r.json())
      .then((d: TyperData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Load saved predictions + nickname
  useEffect(() => {
    if (!data) return;
    const round = getPredictionRound(data);
    if (round) {
      const existing = getPredictions(round.gameweek);
      if (existing) {
        const map: Record<number, { home: string; away: string }> = {};
        for (const p of existing) {
          map[p.fixtureId] = {
            home: String(p.homeScore),
            away: String(p.awayScore),
          };
        }
        setScores(map);
      }
    }
    setNicknameState(getNickname());
  }, [data]);

  // Countdown timer
  useEffect(() => {
    if (!data) return;
    const round = getPredictionRound(data);
    if (!round) return;

    function tick() {
      setCountdown(timeUntilDeadline(round!.deadline));
    }
    tick();
    const iv = setInterval(tick, 30_000);
    return () => clearInterval(iv);
  }, [data]);

  // Which round to predict on?
  function getPredictionRound(d: TyperData): TyperRound | null {
    // Prefer next, fall back to current if not finished
    if (d.next) return d.next;
    if (d.current && !d.current.fixtures.every((f) => f.finished)) return d.current;
    return null;
  }

  // Which round to show results for?
  function getResultsRound(d: TyperData): TyperRound | null {
    // Current if finished, otherwise previous
    if (d.current && d.current.fixtures.some((f) => f.finished)) return d.current;
    if (d.previous) return d.previous;
    return null;
  }

  // Handle score input
  const handleScore = useCallback(
    (fixtureId: number, side: 'home' | 'away', value: string) => {
      setScores((prev) => ({
        ...prev,
        [fixtureId]: {
          ...prev[fixtureId],
          [side]: value,
        },
      }));
      setSaved(false);
    },
    []
  );

  // Save predictions
  function handleSave() {
    if (!data) return;
    const round = getPredictionRound(data);
    if (!round) return;
    if (!isBeforeDeadline(round.deadline)) return;

    const predictions: TyperPrediction[] = [];
    for (const f of round.fixtures) {
      const s = scores[f.id];
      if (s?.home !== '' && s?.home !== undefined && s?.away !== '' && s?.away !== undefined) {
        predictions.push({
          fixtureId: f.id,
          homeScore: Number(s.home),
          awayScore: Number(s.away),
        });
      }
    }

    if (predictions.length === 0) return;

    savePredictions(round.gameweek, predictions);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // Handle nickname
  function handleNickname(name: string) {
    setNicknameState(name);
    saveNickname(name);
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <TyperSkeleton />;

  if (!data || (!data.current && !data.next && !data.previous)) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Brak danych o kolejkach. Sprobuj pozniej.
          </p>
        </CardContent>
      </Card>
    );
  }

  const predictionRound = getPredictionRound(data);
  const resultsRound = getResultsRound(data);
  const canSubmit = predictionRound ? isBeforeDeadline(predictionRound.deadline) : false;

  // Count filled predictions
  const filledCount = predictionRound
    ? predictionRound.fixtures.filter((f) => {
        const s = scores[f.id];
        return s?.home !== '' && s?.home !== undefined && s?.away !== '' && s?.away !== undefined;
      }).length
    : 0;

  // Calculate results
  const resultsData = (() => {
    if (!resultsRound) return null;
    const existing = getPredictions(resultsRound.gameweek);
    if (!existing) return null;
    return calculateRoundScore(existing, resultsRound.fixtures);
  })();

  // Stats
  const stats = getTotalStats();
  const entries = getAllEntries();
  const bestGw = (() => {
    let best = 0;
    for (const entry of entries) {
      // We'd need fixtures to calculate, so use a simple heuristic:
      // max possible = predictions * 3
      // This is a display feature, exact scoring requires fixture data
      best = Math.max(best, entry.predictions.length * 3); // placeholder
    }
    return best;
  })();

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
        <TabButton active={tab === 'typuj'} label="Typuj" onClick={() => setTab('typuj')} />
        <TabButton active={tab === 'wyniki'} label="Wyniki" onClick={() => setTab('wyniki')} />
        <TabButton
          active={tab === 'statystyki'}
          label="Statystyki"
          onClick={() => setTab('statystyki')}
        />
      </div>

      {/* ─── TAB: Typuj ──────────────────────────────────────────────────── */}
      {tab === 'typuj' && (
        <div className="animate-fade-in space-y-3">
          {predictionRound ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg">
                    Kolejka {predictionRound.gameweek}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {filledCount}/{predictionRound.fixtures.length} meczow wytypowanych
                  </p>
                </div>
                <div className="text-right">
                  {canSubmit ? (
                    <Badge variant="outline" className="text-xs">
                      Do zamkniecia: {countdown}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      Czas minal
                    </Badge>
                  )}
                </div>
              </div>

              {/* Fixture rows */}
              <div className="space-y-2">
                {predictionRound.fixtures.map((f, i) => (
                  <FixtureRow
                    key={f.id}
                    fixture={f}
                    homeVal={scores[f.id]?.home ?? ''}
                    awayVal={scores[f.id]?.away ?? ''}
                    onHome={(v) => handleScore(f.id, 'home', v)}
                    onAway={(v) => handleScore(f.id, 'away', v)}
                    disabled={!canSubmit}
                    index={i}
                  />
                ))}
              </div>

              {/* Save button */}
              {canSubmit && (
                <button
                  onClick={handleSave}
                  disabled={filledCount === 0}
                  className={cn(
                    'w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all',
                    'bg-primary text-primary-foreground',
                    'hover:bg-primary/90 active:scale-[0.98]',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    saved && 'bg-primary/80 ring-2 ring-primary/40'
                  )}
                >
                  {saved ? '++ Typy zapisane!' : 'Zapisz typy'}
                </button>
              )}

              {/* Save confirmation */}
              {saved && (
                <div className="animate-fade-in text-center">
                  <p className="text-sm text-primary font-medium">
                    Zapisano {filledCount} typow dla kolejki {predictionRound.gameweek}
                  </p>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Brak otwartej kolejki do typowania.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ─── TAB: Wyniki ─────────────────────────────────────────────────── */}
      {tab === 'wyniki' && (
        <div className="animate-fade-in space-y-3">
          {resultsRound ? (
            <>
              {/* Summary card */}
              {resultsData ? (
                <Card className="border-primary/30">
                  <CardContent className="!py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-display text-lg">
                          Kolejka {resultsRound.gameweek}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {resultsData.results.filter((r) => r.type !== 'pending').length}{' '}
                          meczow rozliczonych
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="score-display text-3xl text-primary counter-animate">
                          {resultsData.totalPoints}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          punktow
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3 pt-3 border-t border-border">
                      <div className="text-center flex-1">
                        <p className="score-display text-lg text-primary">
                          {resultsData.exactScores}
                        </p>
                        <p className="text-[10px] text-muted-foreground">trafionych</p>
                      </div>
                      <div className="text-center flex-1">
                        <p className="score-display text-lg text-amber">
                          {resultsData.correctResults}
                        </p>
                        <p className="text-[10px] text-muted-foreground">wynik 1X2</p>
                      </div>
                      <div className="text-center flex-1">
                        <p className="score-display text-lg text-destructive">
                          {resultsData.results.filter((r) => r.type === 'wrong').length}
                        </p>
                        <p className="text-[10px] text-muted-foreground">pudla</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="!py-6 text-center">
                    <p className="text-muted-foreground text-sm">
                      Nie typowales kolejki {resultsRound.gameweek}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Result rows */}
              <div className="space-y-2">
                {resultsRound.fixtures.map((f, i) => {
                  const result =
                    resultsData?.results.find((r) => r.fixtureId === f.id) ?? null;
                  return (
                    <ResultRow key={f.id} fixture={f} result={result} index={i} />
                  );
                })}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Brak wynikow do wyswietlenia.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ─── TAB: Statystyki ─────────────────────────────────────────────── */}
      {tab === 'statystyki' && (
        <div className="animate-fade-in space-y-4">
          {/* Nickname input */}
          <Card size="sm">
            <CardContent className="!py-3">
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
                Twoj pseudonim
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => handleNickname(e.target.value)}
                placeholder="Wpisz nick..."
                maxLength={20}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg',
                  'bg-muted/60 border border-border',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
                  'placeholder:text-muted-foreground/50',
                  'transition-all'
                )}
              />
            </CardContent>
          </Card>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="Punkty"
              value={stats.points}
            />
            <StatCard
              label="Celnosc"
              value={`${stats.accuracy}%`}
              sub={`${stats.exact + stats.correct}/${stats.predictions}`}
            />
            <StatCard
              label="Trafione wyniki"
              value={stats.exact}
              sub="dokladne"
            />
            <StatCard
              label="Trafione 1X2"
              value={stats.correct}
              sub="sam wynik"
            />
          </div>

          {/* Played gameweeks */}
          <Card size="sm">
            <CardContent className="!py-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Rozegrane kolejki
              </p>
              {entries.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {entries
                    .sort((a, b) => a.gameweek - b.gameweek)
                    .map((e) => (
                      <Badge key={e.gameweek} variant="secondary" className="text-xs">
                        GW{e.gameweek} ({e.predictions.length} typow)
                      </Badge>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Jeszcze nie grales. Przejdz do zakladki Typuj!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <Card size="sm" className="border-primary/20">
            <CardContent className="!py-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-primary font-bold">3 pkt</span> za trafiony wynik,{' '}
                <span className="text-amber font-bold">1 pkt</span> za trafienie 1X2,{' '}
                <span className="text-destructive font-bold">0 pkt</span> za pudlo.
                Dane zapisywane lokalnie w przegladarce.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
