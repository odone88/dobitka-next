/**
 * DOBITKA Typer — free prediction game engine
 *
 * Scoring:
 * - Exact score: 3 points
 * - Correct result (1X2): 1 point
 * - Wrong: 0 points
 *
 * Storage: localStorage (MVP), Supabase later
 */

export interface TyperFixture {
  id: number;
  homeTeam: string;
  homeShort: string;
  homeCrest: string;
  awayTeam: string;
  awayShort: string;
  awayCrest: string;
  kickoff: string; // ISO date
  finished: boolean;
  homeScore: number | null;
  awayScore: number | null;
}

export interface TyperPrediction {
  fixtureId: number;
  homeScore: number;
  awayScore: number;
}

export interface TyperRound {
  gameweek: number;
  deadline: string; // ISO date
  fixtures: TyperFixture[];
}

export interface TyperEntry {
  gameweek: number;
  predictions: TyperPrediction[];
  submittedAt: string;
}

export interface TyperResult {
  fixtureId: number;
  predicted: { home: number; away: number };
  actual: { home: number; away: number } | null;
  points: number;
  type: 'exact' | 'result' | 'wrong' | 'pending';
}

export interface TyperScore {
  gameweek: number;
  results: TyperResult[];
  totalPoints: number;
  exactScores: number;
  correctResults: number;
}

// ─── Scoring ────────────────────────────────────────────────────────────────

export function scoreResult(
  predHome: number, predAway: number,
  actualHome: number, actualAway: number
): { points: number; type: 'exact' | 'result' | 'wrong' } {
  // Exact score
  if (predHome === actualHome && predAway === actualAway) {
    return { points: 3, type: 'exact' };
  }
  // Correct result (1X2)
  const predResult = predHome > predAway ? '1' : predHome < predAway ? '2' : 'X';
  const actualResult = actualHome > actualAway ? '1' : actualHome < actualAway ? '2' : 'X';
  if (predResult === actualResult) {
    return { points: 1, type: 'result' };
  }
  return { points: 0, type: 'wrong' };
}

export function calculateRoundScore(
  predictions: TyperPrediction[],
  fixtures: TyperFixture[]
): TyperScore {
  const results: TyperResult[] = predictions.map(pred => {
    const fixture = fixtures.find(f => f.id === pred.fixtureId);
    if (!fixture || fixture.homeScore === null || fixture.awayScore === null) {
      return {
        fixtureId: pred.fixtureId,
        predicted: { home: pred.homeScore, away: pred.awayScore },
        actual: null,
        points: 0,
        type: 'pending' as const,
      };
    }
    const { points, type } = scoreResult(
      pred.homeScore, pred.awayScore,
      fixture.homeScore, fixture.awayScore
    );
    return {
      fixtureId: pred.fixtureId,
      predicted: { home: pred.homeScore, away: pred.awayScore },
      actual: { home: fixture.homeScore, away: fixture.awayScore },
      points,
      type,
    };
  });

  return {
    gameweek: fixtures[0]?.id ? 0 : 0, // will be set by caller
    results,
    totalPoints: results.reduce((sum, r) => sum + r.points, 0),
    exactScores: results.filter(r => r.type === 'exact').length,
    correctResults: results.filter(r => r.type === 'result').length,
  };
}

// ─── LocalStorage persistence ───────────────────────────────────────────────

const STORAGE_KEY = 'dobitka_typer';

interface TyperStorage {
  entries: TyperEntry[];
  totalPoints: number;
  totalExact: number;
  totalCorrect: number;
  totalPredictions: number;
  nickname: string;
}

function getStorage(): TyperStorage {
  if (typeof window === 'undefined') {
    return { entries: [], totalPoints: 0, totalExact: 0, totalCorrect: 0, totalPredictions: 0, nickname: '' };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { entries: [], totalPoints: 0, totalExact: 0, totalCorrect: 0, totalPredictions: 0, nickname: '' };
  } catch {
    return { entries: [], totalPoints: 0, totalExact: 0, totalCorrect: 0, totalPredictions: 0, nickname: '' };
  }
}

function saveStorage(data: TyperStorage) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function savePredictions(gameweek: number, predictions: TyperPrediction[]) {
  const storage = getStorage();
  // Remove existing entry for this gameweek (allow re-submit before deadline)
  storage.entries = storage.entries.filter(e => e.gameweek !== gameweek);
  storage.entries.push({
    gameweek,
    predictions,
    submittedAt: new Date().toISOString(),
  });
  saveStorage(storage);
}

export function getPredictions(gameweek: number): TyperPrediction[] | null {
  const storage = getStorage();
  const entry = storage.entries.find(e => e.gameweek === gameweek);
  return entry?.predictions ?? null;
}

export function getAllEntries(): TyperEntry[] {
  return getStorage().entries;
}

export function getNickname(): string {
  return getStorage().nickname;
}

export function setNickname(name: string) {
  const storage = getStorage();
  storage.nickname = name.trim().slice(0, 20);
  saveStorage(storage);
}

export function updateTotalStats(score: TyperScore) {
  const storage = getStorage();
  storage.totalPoints += score.totalPoints;
  storage.totalExact += score.exactScores;
  storage.totalCorrect += score.correctResults;
  storage.totalPredictions += score.results.filter(r => r.type !== 'pending').length;
  saveStorage(storage);
}

export function getTotalStats() {
  const s = getStorage();
  return {
    points: s.totalPoints,
    exact: s.totalExact,
    correct: s.totalCorrect,
    predictions: s.totalPredictions,
    accuracy: s.totalPredictions > 0
      ? Math.round((s.totalCorrect + s.totalExact) / s.totalPredictions * 100)
      : 0,
  };
}

// ─── Deadline check ─────────────────────────────────────────────────────────

export function isBeforeDeadline(deadline: string): boolean {
  return new Date() < new Date(deadline);
}

export function timeUntilDeadline(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return 'Zamkniete';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}min`;
}
