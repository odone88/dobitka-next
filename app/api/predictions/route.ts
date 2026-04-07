import { NextResponse } from 'next/server';
import { getTodayMatches, getStandings } from '@/lib/data-sources/football-data';
import type { Match, StandingRow } from '@/types';

// ISR cache — predictions update every 2 min, never hit API directly per-user
export const revalidate = 120;

interface Prediction {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  homeCrest?: string;
  awayCrest?: string;
  utcDate: string;
  competition: string;
  competitionCode: string;
  tip: string;           // np. "Over 2.5 goli", "Wygrana gospodarzy"
  confidence: number;    // 0-100%
  reasoning: string[];   // argumenty za
  against: string[];     // argumenty przeciw
  category: 'result' | 'goals' | 'btts';
}

// Proste pozycje druzyn ze standings (cache w pamieci na czas requestu)
async function getTeamPositions(): Promise<Map<string, { pos: number; form: string; goalsFor: number; goalsAgainst: number; played: number; league: string }>> {
  // Analizujemy wszystkie dostepne ligi (football-data.org free tier)
  const leagues = ['PL', 'PD', 'SA', 'BL1', 'FL1', 'BSA', 'PPL', 'DED', 'ELC'];
  const map = new Map<string, { pos: number; form: string; goalsFor: number; goalsAgainst: number; played: number; league: string }>();

  const results = await Promise.allSettled(
    leagues.map((code) => getStandings(code))
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status !== 'fulfilled' || !result.value) continue;
    const standings = result.value;
    for (const row of standings.table) {
      const entry = {
        pos: row.position,
        form: row.form ?? '',
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        played: row.played,
        league: leagues[i],
      };
      // Indeksuj po pelnej nazwie I shortName (mecze uzywaja shortName)
      map.set(row.teamName, entry);
      if (row.teamShortName) {
        map.set(row.teamShortName, entry);
      }
    }
  }

  return map;
}

// Scoring engine — prosty ale efektywny
function scorePredictions(matches: Match[], positions: Map<string, { pos: number; form: string; goalsFor: number; goalsAgainst: number; played: number; league: string }>): Prediction[] {
  const predictions: Prediction[] = [];

  for (const match of matches) {
    if (match.status !== 'SCHEDULED' && match.status !== 'TIMED') continue;

    const home = positions.get(match.homeTeam);
    const away = positions.get(match.awayTeam);

    // Jesli brak standings — generuj prosty tip "przewaga gospodarza"
    if (!home || !away) {
      predictions.push({
        matchId: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeCrest: match.homeCrest,
        awayCrest: match.awayCrest,
        utcDate: match.utcDate,
        competition: match.competition,
        competitionCode: match.competitionCode,
        tip: `${match.homeTeam} nie przegra (1X)`,
        confidence: 55,
        reasoning: [
          'Przewaga własnego boiska',
          'Gospodarze statystycznie wygrywają ~46% meczów',
        ],
        against: [
          'Brak danych o formie — niska pewność',
        ],
        category: 'result',
      });
      continue;
    }

    const homePos = home.pos;
    const awayPos = away.pos;
    const posDiff = awayPos - homePos; // >0 = gospodarz wyżej

    // Srednia goli — uzywamy faktycznej liczby meczow z tabeli
    const homeGamesPlayed = Math.max(1, home.played);
    const awayGamesPlayed = Math.max(1, away.played);
    const homeGoalsPerGame = home.goalsFor / homeGamesPlayed;
    const awayGoalsPerGame = away.goalsFor / awayGamesPlayed;
    const homeConcedePerGame = home.goalsAgainst / homeGamesPlayed;
    const awayConcedePerGame = away.goalsAgainst / awayGamesPlayed;

    const expectedGoals = (homeGoalsPerGame + awayConcedePerGame + awayGoalsPerGame + homeConcedePerGame) / 2;

    // Forma (ostatnie 5 meczow z form string: W,D,L)
    const formScore = (form: string) => {
      if (!form) return 0;
      return form.split(',').reduce((acc, r) => acc + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0);
    };
    const homeForm = formScore(home.form);
    const awayForm = formScore(away.form);

    // Przewaga gospodarza (+5% bazowa)
    const homeAdvantage = 5;

    // --- PREDICTION: Over 2.5 ---
    if (expectedGoals > 2.5) {
      const conf = Math.min(85, Math.round(50 + (expectedGoals - 2.5) * 20));
      const reasoning = [];
      const against = [];

      if (homeGoalsPerGame > 1.5) reasoning.push(`${match.homeTeam} strzela sr. ${homeGoalsPerGame.toFixed(1)} gola/mecz`);
      if (awayGoalsPerGame > 1.5) reasoning.push(`${match.awayTeam} strzela sr. ${awayGoalsPerGame.toFixed(1)} gola/mecz`);
      if (homeConcedePerGame > 1.2) reasoning.push(`${match.homeTeam} traci sr. ${homeConcedePerGame.toFixed(1)} gola/mecz`);
      if (awayConcedePerGame > 1.2) reasoning.push(`${match.awayTeam} traci sr. ${awayConcedePerGame.toFixed(1)} gola/mecz`);
      if (reasoning.length === 0) reasoning.push('Wysoka średnia goli obu drużyn');

      if (homeForm < 5) against.push(`${match.homeTeam} w słabej formie`);
      if (awayForm < 5) against.push(`${match.awayTeam} w słabej formie`);
      if (against.length === 0) against.push('Obie drużyny mogą grać zachowawczo');

      predictions.push({
        matchId: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeCrest: match.homeCrest,
        awayCrest: match.awayCrest,
        utcDate: match.utcDate,
        competition: match.competition,
        competitionCode: match.competitionCode,
        tip: `Over 2.5 goli`,
        confidence: conf,
        reasoning,
        against,
        category: 'goals',
      });
    }

    // --- PREDICTION: Wynik meczu (silna przewaga) ---
    if (Math.abs(posDiff) >= 5) {
      const favoriteIsHome = posDiff > 0;
      const favorite = favoriteIsHome ? match.homeTeam : match.awayTeam;
      const underdog = favoriteIsHome ? match.awayTeam : match.homeTeam;
      const favForm = favoriteIsHome ? homeForm : awayForm;
      const undForm = favoriteIsHome ? awayForm : homeForm;

      let conf = Math.min(80, Math.round(45 + Math.abs(posDiff) * 2 + (favoriteIsHome ? homeAdvantage : 0)));
      if (favForm >= 10) conf = Math.min(85, conf + 5);
      if (undForm <= 4) conf = Math.min(85, conf + 3);

      const reasoning = [];
      const against = [];

      reasoning.push(`${favorite} jest ${Math.abs(posDiff)} pozycji wyżej w tabeli`);
      if (favoriteIsHome) reasoning.push('Przewaga własnego boiska');
      if (favForm >= 10) reasoning.push(`${favorite} w dobrej formie (${favForm}/15 pkt)`);

      if (undForm >= 10) against.push(`${underdog} też w dobrej formie`);
      if (!favoriteIsHome) against.push(`${favorite} gra na wyjeździe`);
      if (against.length === 0) against.push('Piłka jest okrągła');

      predictions.push({
        matchId: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeCrest: match.homeCrest,
        awayCrest: match.awayCrest,
        utcDate: match.utcDate,
        competition: match.competition,
        competitionCode: match.competitionCode,
        tip: `Wygrana ${favorite}`,
        confidence: conf,
        reasoning,
        against,
        category: 'result',
      });
    }

    // --- PREDICTION: BTTS (obie strzelaja) ---
    if (homeGoalsPerGame > 1.2 && awayGoalsPerGame > 1.2 && homeConcedePerGame > 0.8 && awayConcedePerGame > 0.8) {
      const conf = Math.min(78, Math.round(50 + (homeGoalsPerGame + awayGoalsPerGame - 2.4) * 15));
      predictions.push({
        matchId: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeCrest: match.homeCrest,
        awayCrest: match.awayCrest,
        utcDate: match.utcDate,
        competition: match.competition,
        competitionCode: match.competitionCode,
        tip: 'Obie drużyny strzelą (BTTS)',
        confidence: conf,
        reasoning: [
          `${match.homeTeam}: ${homeGoalsPerGame.toFixed(1)} gola/mecz`,
          `${match.awayTeam}: ${awayGoalsPerGame.toFixed(1)} gola/mecz`,
          'Obie drużyny regularnie tracą bramki',
        ],
        against: [
          Math.abs(posDiff) > 8 ? 'Duża różnica klas może zamknąć mecz' : 'Takie mecze bywaja tez 1-0',
        ],
        category: 'btts',
      });
    }
  }

  // Sortuj po confidence, ogranicz do 5 najlepszych
  return predictions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}

export async function GET() {
  try {
    const [matches, positions] = await Promise.all([
      getTodayMatches(),
      getTeamPositions(),
    ]);

    const predictions = scorePredictions(matches, positions);

    return NextResponse.json({
      predictions,
      generatedAt: new Date().toISOString(),
      matchesAnalyzed: matches.filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED').length,
    });
  } catch {
    return NextResponse.json({ predictions: [], generatedAt: new Date().toISOString(), matchesAnalyzed: 0 });
  }
}
