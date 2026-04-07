import { notFound } from 'next/navigation';
import { cache } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getCodeFromSlug } from '@/config/league-slugs';
import { getLeague } from '@/config/leagues';
import { getStandings, getTopScorers, getRecentResults, getUpcomingFixtures } from '@/lib/data-sources/football-data';
import { getZone, ZONE_BORDER } from '@/lib/zones';
import { cn } from '@/lib/utils';
import type { Match, LeagueStandings, Scorer, StandingRow } from '@/types';

export const revalidate = 300;

interface Props {
  params: Promise<{ league: string }>;
}

// ─── CACHED DATA FETCH ──────────────────────────────────────────────────────
const fetchLeagueData = cache(async (code: string) => {
  const [standings, scorers, results, fixtures] = await Promise.all([
    getStandings(code),
    getTopScorers(code, 10),
    getRecentResults(code, 5),
    getUpcomingFixtures(code, 5),
  ]);
  return { standings, scorers, results, fixtures };
});

// ─── METADATA ───────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props) {
  const { league: slug } = await params;
  const code = getCodeFromSlug(slug);
  if (!code) return { title: 'Liga - DOBITKA' };
  const leagueCfg = getLeague(code);
  const name = leagueCfg?.name ?? slug;
  return {
    title: `${name} 2025/26 - mecze, tabela, strzelcy | DOBITKA`,
    description: `${name} - wyniki, tabela, najlepsi strzelcy sezonu 2025/26. DOBITKA.`,
    openGraph: {
      title: `${name} 2025/26 | DOBITKA`,
      description: `Mecze, tabela i strzelcy ${name}`,
      siteName: 'DOBITKA',
      locale: 'pl_PL',
      type: 'website',
    },
  };
}

// ─── SECTION LABEL ──────────────────────────────────────────────────────────
function SectionLabel({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <h2 className="mb-4 flex items-center gap-3">
      <span className={cn(
        'font-display text-[15px] tracking-wide',
        accent ? 'text-primary font-bold' : 'text-foreground font-semibold'
      )}>
        {text}
      </span>
      <span className="flex-1 border-t border-border" aria-hidden="true" />
    </h2>
  );
}

// ─── MATCH ROW ──────────────────────────────────────────────────────────────
function MatchRow({ match, type }: { match: Match; type: 'result' | 'fixture' }) {
  const date = new Date(match.utcDate);
  const dateStr = date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
  const timeStr = date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

  return (
    <Link
      href={`/match/${match.id}`}
      className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors group"
    >
      <span className="text-[11px] text-muted-foreground w-10 shrink-0 tabular-nums">{dateStr}</span>

      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        {match.homeCrest && (
          <img src={match.homeCrest} alt="" className="w-4 h-4 object-contain shrink-0" loading="lazy" />
        )}
        <span className="truncate text-[13px] font-medium">{match.homeTeam}</span>
      </div>

      {type === 'result' ? (
        <span className="score-display text-[15px] font-black px-2 shrink-0">
          {match.homeScore} - {match.awayScore}
        </span>
      ) : (
        <span className="text-[12px] text-muted-foreground px-2 shrink-0 tabular-nums">{timeStr}</span>
      )}

      <div className="flex-1 min-w-0 flex items-center gap-1.5 justify-end">
        <span className="truncate text-[13px] font-medium text-right">{match.awayTeam}</span>
        {match.awayCrest && (
          <img src={match.awayCrest} alt="" className="w-4 h-4 object-contain shrink-0" loading="lazy" />
        )}
      </div>
    </Link>
  );
}

// ─── FORM CELL ──────────────────────────────────────────────────────────────
function FormCell({ form }: { form?: string }) {
  if (!form) return null;
  const chars = form.replace(/,/g, '').slice(-5).split('');
  return (
    <div className="flex gap-0.5 items-center justify-center">
      {chars.map((c, i) => (
        <span key={i} className={cn(
          'inline-flex items-center justify-center w-4 h-4 rounded-[3px] text-[9px] font-black',
          c === 'W' ? 'bg-emerald-600 text-white' : c === 'D' ? 'bg-yellow-600 text-white' : 'bg-red-700 text-white'
        )}>
          {c}
        </span>
      ))}
    </div>
  );
}

// ─── SHORTENED TABLE ────────────────────────────────────────────────────────
function ShortenedTable({ table, code, slug }: { table: StandingRow[]; code: string; slug: string }) {
  const top = table.slice(0, 6);
  const bottom = table.slice(-3);
  const maxPoints = table[0]?.points ?? 1;
  const hasGap = table.length > 9;

  const renderRow = (row: StandingRow) => {
    const zone = getZone(row.position, code);
    return (
      <tr key={row.position} className={cn('hover:bg-accent/50 transition-colors', ZONE_BORDER[zone])}>
        <td className="py-1.5 pl-2">
          <span className="tabular-nums text-muted-foreground w-5 inline-block text-center">{row.position}</span>
        </td>
        <td className="py-1.5 pr-2 max-w-[140px]">
          <div className="flex items-center gap-1.5 min-w-0">
            {row.teamCrest && (
              <img src={row.teamCrest} alt={row.teamName} className="w-4 h-4 object-contain shrink-0" loading="lazy" />
            )}
            <span className="truncate text-foreground font-medium leading-tight">{row.teamName}</span>
          </div>
        </td>
        <td className="py-1.5 text-center text-muted-foreground hidden sm:table-cell">{row.played}</td>
        <td className="py-1.5 text-center tabular-nums text-muted-foreground">
          {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
        </td>
        <td className="py-1.5 text-center relative">
          <div
            className="absolute inset-y-0.5 left-0 bg-primary/[0.12] rounded-r"
            style={{ width: `${(row.points / maxPoints) * 100}%` }}
          />
          <span className="relative score-display font-black text-[15px] text-foreground">{row.points}</span>
        </td>
        <td className="py-1.5 text-center hidden md:table-cell">
          <FormCell form={row.form} />
        </td>
      </tr>
    );
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px]" style={{ fontSize: '13px' }}>
          <thead>
            <tr className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider border-b border-border">
              <th className="w-7 text-left pb-1.5 pl-2">#</th>
              <th className="text-left pb-1.5">Druzyna</th>
              <th className="text-center pb-1.5 w-7 hidden sm:table-cell">M</th>
              <th className="text-center pb-1.5 w-9">+/-</th>
              <th className="text-center pb-1.5 w-10 text-foreground">Pkt</th>
              <th className="text-center pb-1.5 w-24 hidden md:table-cell">Forma</th>
            </tr>
          </thead>
          <tbody>
            {top.map(renderRow)}
            {hasGap && (
              <tr>
                <td colSpan={6} className="py-1 text-center">
                  <span className="text-[11px] text-muted-foreground tracking-widest">...</span>
                </td>
              </tr>
            )}
            {hasGap && bottom.map(renderRow)}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <Link
          href={`/${slug}/tabela`}
          className="text-[12px] text-primary hover:text-primary/80 font-bold uppercase tracking-wider transition-colors"
        >
          Pelna tabela →
        </Link>
      </div>
    </div>
  );
}

// ─── PAGE ───────────────────────────────────────────────────────────────────
export default async function LeaguePage({ params }: Props) {
  const { league: slug } = await params;
  const code = getCodeFromSlug(slug);
  if (!code) notFound();

  const leagueCfg = getLeague(code);
  if (!leagueCfg) notFound();

  const { standings, scorers, results, fixtures } = await fetchLeagueData(code);
  const season = standings?.season
    ? `${standings.season}/${(parseInt(standings.season, 10) + 1).toString().slice(-2)}`
    : '2025/26';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-widest">Wstecz</span>
          </Link>
          <span className="font-display text-lg tracking-tight text-primary ml-auto">DOBITKA</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Strona glowna</Link>
          <span>/</span>
          <span className="text-foreground">{leagueCfg.name}</span>
        </nav>

        {/* LEAGUE HEADER */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{leagueCfg.flag}</span>
            <div>
              <h1 className={cn('font-display text-2xl tracking-tight', leagueCfg.color)}>
                {leagueCfg.name}
              </h1>
              <p className="text-[12px] text-muted-foreground">
                {leagueCfg.country} &middot; Sezon {season}
              </p>
            </div>
          </div>
        </div>

        {/* 1. MECZE */}
        <section className="animate-fade-in">
          <SectionLabel text="Mecze" accent />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ostatnie wyniki */}
            <Card>
              <CardContent className="pt-4">
                <p className="label-retro mb-2">Ostatnie wyniki</p>
                {results.length > 0 ? (
                  <div className="divide-y divide-border">
                    {results.map((m) => <MatchRow key={m.id} match={m} type="result" />)}
                  </div>
                ) : (
                  <p className="text-[12px] text-muted-foreground py-3">Brak wynikow</p>
                )}
              </CardContent>
            </Card>

            {/* Nadchodzace */}
            <Card>
              <CardContent className="pt-4">
                <p className="label-retro mb-2">Nadchodzace mecze</p>
                {fixtures.length > 0 ? (
                  <div className="divide-y divide-border">
                    {fixtures.map((m) => <MatchRow key={m.id} match={m} type="fixture" />)}
                  </div>
                ) : (
                  <p className="text-[12px] text-muted-foreground py-3">Brak zaplanowanych meczow</p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 2. TABELA (skrocona) */}
        {standings && standings.table.length > 0 && (
          <section className="animate-fade-in">
            <SectionLabel text="Tabela" />
            <Card>
              <CardContent className="pt-4">
                <ShortenedTable table={standings.table} code={code} slug={slug} />
              </CardContent>
            </Card>
          </section>
        )}

        {/* 3. STRZELCY (top 10) */}
        {scorers.length > 0 && (
          <section className="animate-fade-in">
            <SectionLabel text="Strzelcy" accent />
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-1.5">
                  {scorers.map((s, i) => (
                    <div
                      key={`${s.playerName}-${s.teamName}`}
                      className={cn(
                        'flex items-center gap-3 py-2 px-3 rounded-lg transition-colors',
                        i < 3 ? 'bg-accent/30' : 'hover:bg-accent/20'
                      )}
                    >
                      <span className={cn(
                        'text-[13px] w-6 tabular-nums text-right font-bold',
                        i === 0 ? 'text-amber-400' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-orange-600' : 'text-muted-foreground'
                      )}>
                        {i + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[14px] text-foreground font-medium truncate block">{s.playerName}</span>
                        <span className="text-[11px] text-muted-foreground truncate block">{s.teamName}</span>
                      </div>
                      {s.assists !== undefined && s.assists > 0 && (
                        <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                          {s.assists} ast.
                        </span>
                      )}
                      <Badge variant="secondary" className="text-[13px] h-6 px-2 font-black score-display shrink-0">
                        {s.goals}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

      </main>
    </div>
  );
}
