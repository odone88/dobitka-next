/**
 * DailyBlocks — retention-boosting sidebar content
 * Replaces the old DailyFactsStrip with richer, visually distinct blocks
 */
import { getDailyFacts } from '@/lib/content/facts';
import { getTodayBirthdays, getAge } from '@/lib/content/birthdays';
import { getTodayHistoricalMatch, getFallbackHistoricalMatch, getTeamContextualMatch } from '@/lib/content/historical-matches';
import { getTodayUCLTeams } from '@/lib/data-sources/ucl-bracket';
import { getOnThisDay } from '@/lib/data-sources/wikipedia';

function BlockHeader({ label, icon }: { label: string; icon?: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-2">
      {icon && <span className="text-sm">{icon}</span>}
      <span className="label-retro text-primary">{label}</span>
    </div>
  );
}

export function BirthdayBlock() {
  const birthdays = getTodayBirthdays();
  if (birthdays.length === 0) return null;

  return (
    <div className="p-4 rounded-xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-amber-500/[0.02]">
      <BlockHeader label="Urodziny dnia" icon="🎂" />
      <div className="space-y-2">
        {birthdays.map((b) => (
          <div key={b.name}>
            <p className="text-[15px] font-bold text-amber-300 leading-tight">
              {b.name} — {getAge(b.year)} lat
            </p>
            {b.desc && (
              <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">{b.desc}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export async function HistoricalMatchBlock() {
  // Try UCL-contextual match first
  let framing: string | null = null;
  let match = getTodayHistoricalMatch();

  try {
    const todayTeams = await getTodayUCLTeams();
    if (todayTeams.length > 0) {
      const contextual = getTeamContextualMatch(todayTeams);
      if (contextual) {
        match = contextual.match;
        framing = contextual.framing;
      }
    }
  } catch { /* fallback to regular match */ }

  if (!match) match = getFallbackHistoricalMatch();

  const hasScore = match.score && match.score !== '';

  return (
    <div className="p-4 rounded-xl border border-border bg-gradient-to-br from-card to-accent/20">
      {framing ? (
        <div className="mb-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-1">
            Kontekst meczu
          </p>
          <p className="text-[12px] text-muted-foreground italic leading-relaxed">{framing}</p>
        </div>
      ) : (
        <BlockHeader label={match.score ? 'Mecz historyczny' : 'Wydarzenie dnia'} icon="📜" />
      )}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full tabular-nums">{match.year}</span>
          {hasScore && (
            <>
              <span className="text-[14px] font-bold text-foreground">{match.home}</span>
              <span className="score-display text-[20px] font-black text-primary">{match.score}</span>
              <span className="text-[14px] font-bold text-foreground">{match.away}</span>
            </>
          )}
          {!hasScore && (
            <span className="text-[14px] font-bold text-foreground">{match.home || match.competition}</span>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {match.competition}
        </span>
        <p className="text-[12px] text-muted-foreground leading-relaxed">{match.note}</p>
        <span className="text-[9px] text-muted-foreground italic">źródło: archiwum DOBITKA</span>
      </div>
    </div>
  );
}

export async function FactsBlock() {
  let wikiEvents: { year: number; text: string }[] = [];
  try {
    wikiEvents = await getOnThisDay();
  } catch { /* fallback to static */ }

  const facts = getDailyFacts(2);

  return (
    <div className="space-y-2">
      {wikiEvents.length > 0 ? (
        <>
          <BlockHeader label="Tego dnia w piłce" icon="📅" />
          {wikiEvents.map((e, i) => (
            <div key={i} className="text-[13px] text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
              <p>
                <span className="text-primary font-bold tabular-nums">{e.year}</span>{' '}
                {e.text}
              </p>
              <span className="text-[9px] text-muted-foreground italic">źródło: Wikipedia</span>
            </div>
          ))}
        </>
      ) : (
        <>
          <BlockHeader label="Wiedza dnia" icon="💡" />
          {facts.map((fact, i) => (
            <p key={i} className="text-[13px] text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
              {fact}
            </p>
          ))}
        </>
      )}
    </div>
  );
}
