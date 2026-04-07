import { notFound } from 'next/navigation';
import { cache } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getCodeFromSlug } from '@/config/league-slugs';
import { getLeague } from '@/config/leagues';
import { getStandings, getTopScorers } from '@/lib/data-sources/football-data';
import { ZONES, getZone, ZONE_BORDER_THICK as ZONE_BORDER, LEGEND_ITEMS } from '@/lib/zones';
import { cn } from '@/lib/utils';
import type { StandingRow } from '@/types';

export const revalidate = 300;

interface Props {
  params: Promise<{ league: string }>;
}

// ─── CACHED DATA ────────────────────────────────────────────────────────────
const fetchData = cache(async (code: string) => {
  const [standings, scorers] = await Promise.all([
    getStandings(code),
    getTopScorers(code, 5),
  ]);
  return { standings, scorers };
});

// ─── METADATA ───────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props) {
  const { league: slug } = await params;
  const code = getCodeFromSlug(slug);
  if (!code) return { title: 'Tabela - DOBITKA' };
  const leagueCfg = getLeague(code);
  const name = leagueCfg?.name ?? slug;
  return {
    title: `Tabela ${name} 2025/26 - klasyfikacja na zywo | DOBITKA`,
    description: `Pelna tabela ${name} sezonu 2025/26 - pozycje, punkty, forma, strefy pucharowe. DOBITKA.`,
    openGraph: {
      title: `Tabela ${name} 2025/26 | DOBITKA`,
      description: `Klasyfikacja ${name} na zywo`,
      siteName: 'DOBITKA',
      locale: 'pl_PL',
      type: 'website',
    },
  };
}

// ─── FORM CIRCLES ───────────────────────────────────────────────────────────
function FormCircles({ form }: { form?: string }) {
  if (!form) return null;
  const chars = form.replace(/,/g, '').slice(-5).split('');
  return (
    <div className="flex gap-1 items-center justify-center">
      {chars.map((c, i) => (
        <span
          key={i}
          className={cn(
            'w-[18px] h-[18px] rounded-full inline-flex items-center justify-center text-[9px] font-black',
            c === 'W' ? 'bg-emerald-600 text-white' : c === 'D' ? 'bg-zinc-600 text-white' : 'bg-red-700 text-white'
          )}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

// ─── TABLE ROW ──────────────────────────────────────────────────────────────
function StandingsRow({ row, code, maxPoints }: { row: StandingRow; code: string; maxPoints: number }) {
  const zone = getZone(row.position, code);
  return (
    <tr className={cn('hover:bg-accent/50 transition-colors', ZONE_BORDER[zone])}>
      {/* # */}
      <td className="py-2 pl-2.5 w-8">
        <span className="tabular-nums text-muted-foreground font-semibold">{row.position}</span>
      </td>
      {/* Druzyna */}
      <td className="py-2 pr-2">
        <div className="flex items-center gap-2 min-w-0">
          {row.teamCrest && (
            <img src={row.teamCrest} alt="" className="w-5 h-5 object-contain shrink-0" loading="lazy" />
          )}
          <span className="truncate text-foreground font-medium text-[13px]">{row.teamName}</span>
        </div>
      </td>
      {/* M - hidden on mobile */}
      <td className="py-2 text-center text-muted-foreground hidden md:table-cell tabular-nums">{row.played}</td>
      {/* W */}
      <td className="py-2 text-center text-emerald-400 font-semibold hidden sm:table-cell tabular-nums">{row.won}</td>
      {/* R */}
      <td className="py-2 text-center text-muted-foreground hidden sm:table-cell tabular-nums">{row.draw}</td>
      {/* P */}
      <td className="py-2 text-center text-red-400 hidden sm:table-cell tabular-nums">{row.lost}</td>
      {/* BZ - hidden on mobile */}
      <td className="py-2 text-center text-muted-foreground hidden md:table-cell tabular-nums">{row.goalsFor}</td>
      {/* BS - hidden on mobile */}
      <td className="py-2 text-center text-muted-foreground hidden md:table-cell tabular-nums">{row.goalsAgainst}</td>
      {/* +/- */}
      <td className="py-2 text-center tabular-nums text-muted-foreground font-medium">
        {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
      </td>
      {/* Pkt */}
      <td className="py-2 text-center relative w-14">
        <div
          className="absolute inset-y-0.5 left-0 bg-primary/[0.12] rounded-r"
          style={{ width: `${(row.points / maxPoints) * 100}%` }}
        />
        <span className="relative score-display font-black text-[16px] text-foreground">{row.points}</span>
      </td>
      {/* Forma */}
      <td className="py-2 text-center hidden sm:table-cell">
        <FormCircles form={row.form} />
      </td>
    </tr>
  );
}

// ─── PAGE ───────────────────────────────────────────────────────────────────
export default async function TabelaPage({ params }: Props) {
  const { league: slug } = await params;
  const code = getCodeFromSlug(slug);
  if (!code) notFound();

  const leagueCfg = getLeague(code);
  if (!leagueCfg) notFound();

  const { standings, scorers } = await fetchData(code);

  if (!standings || standings.table.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Brak danych tabeli dla {leagueCfg.name}</p>
      </div>
    );
  }

  const season = standings.season
    ? `${standings.season}/${(parseInt(standings.season, 10) + 1).toString().slice(-2)}`
    : '2025/26';

  const maxPoints = standings.table[0]?.points ?? 1;
  const zonesConfig = ZONES[code];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link
            href={`/${slug}`}
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

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Strona glowna</Link>
          <span>/</span>
          <Link href={`/${slug}`} className="hover:text-foreground transition-colors">{leagueCfg.name}</Link>
          <span>/</span>
          <span className="text-foreground">Tabela</span>
        </nav>

        {/* LEAGUE HEADER */}
        <div className="flex items-center gap-3 animate-fade-in">
          <span className="text-3xl">{leagueCfg.flag}</span>
          <div>
            <h1 className={cn('font-display text-2xl tracking-tight', leagueCfg.color)}>
              Tabela {leagueCfg.name}
            </h1>
            <p className="text-[12px] text-muted-foreground">
              {leagueCfg.country} &middot; Sezon {season}
            </p>
          </div>
        </div>

        {/* FULL TABLE */}
        <Card className="animate-fade-in">
          <CardContent className="pt-4 px-0 sm:px-4">
            <div className="overflow-x-auto">
              <table className="w-full" style={{ fontSize: '13px' }}>
                <thead className="sticky top-14 z-10 bg-card">
                  <tr className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider border-b border-border">
                    <th className="w-8 text-left pb-2 pl-2.5">#</th>
                    <th className="text-left pb-2">Druzyna</th>
                    <th className="text-center pb-2 w-8 hidden md:table-cell">M</th>
                    <th className="text-center pb-2 w-7 hidden sm:table-cell">W</th>
                    <th className="text-center pb-2 w-7 hidden sm:table-cell">R</th>
                    <th className="text-center pb-2 w-7 hidden sm:table-cell">P</th>
                    <th className="text-center pb-2 w-8 hidden md:table-cell">BZ</th>
                    <th className="text-center pb-2 w-8 hidden md:table-cell">BS</th>
                    <th className="text-center pb-2 w-9">+/-</th>
                    <th className="text-center pb-2 w-14 text-foreground">Pkt</th>
                    <th className="text-center pb-2 w-28 hidden sm:table-cell">Forma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {standings.table.map((row) => (
                    <StandingsRow key={row.position} row={row} code={code} maxPoints={maxPoints} />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ZONE LEGEND */}
        {zonesConfig && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 px-1">
            {LEGEND_ITEMS
              .filter(({ zone }) => {
                if (zone === 'ucl_q' && !zonesConfig.ucl_q) return false;
                if (zone === 'uecl' && !zonesConfig.uecl) return false;
                if (zone === 'playoff' && !zonesConfig.playoff) return false;
                return true;
              })
              .map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={cn('w-3 h-3 rounded-sm', color)} />
                  <span className="text-[11px] text-muted-foreground">{label}</span>
                </div>
              ))}
          </div>
        )}

        {/* TOP 5 SCORERS */}
        {scorers.length > 0 && (
          <section className="animate-fade-in">
            <h2 className="mb-4 flex items-center gap-3">
              <span className="font-display text-[15px] tracking-wide text-primary font-bold">
                Strzelcy
              </span>
              <span className="flex-1 border-t border-border" aria-hidden="true" />
            </h2>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-1">
                  {scorers.map((s, i) => (
                    <div
                      key={`${s.playerName}-${s.teamName}`}
                      className={cn(
                        'flex items-center gap-3 py-2 px-3 rounded-lg',
                        i < 3 ? 'bg-accent/30' : ''
                      )}
                    >
                      <span className={cn(
                        'text-[13px] w-6 tabular-nums text-right font-bold',
                        i === 0 ? 'text-amber-400' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-orange-600' : 'text-muted-foreground'
                      )}>
                        {i + 1}.
                      </span>
                      <span className="flex-1 text-[14px] text-foreground font-medium truncate">{s.playerName}</span>
                      <span className="text-[11px] text-muted-foreground truncate max-w-[80px] shrink-0">{s.teamName}</span>
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

        {/* LAST UPDATED */}
        <p className="text-[10px] text-muted-foreground text-center tabular-nums">
          Aktualizacja: {new Date(standings.updatedAt).toLocaleString('pl-PL')}
        </p>

      </main>
    </div>
  );
}
