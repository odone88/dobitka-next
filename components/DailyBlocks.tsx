/**
 * DailyBlocks — retention-boosting sidebar content
 * Replaces the old DailyFactsStrip with richer, visually distinct blocks
 */
import { getDailyFacts } from '@/lib/content/facts';
import { getTodayBirthdays, getAge } from '@/lib/content/birthdays';
import { getTodayHistoricalMatch, getFallbackHistoricalMatch, getTeamContextualMatch } from '@/lib/content/historical-matches';
import { getTodayUCLTeams } from '@/lib/data-sources/ucl-bracket';

function BlockHeader({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-base leading-none">{emoji}</span>
      <span className="label-retro text-primary">{label}</span>
    </div>
  );
}

export function BirthdayBlock() {
  const birthdays = getTodayBirthdays();
  if (birthdays.length === 0) return null;

  return (
    <div className="p-3 rounded-lg border border-amber-500/25 bg-amber-500/5">
      <BlockHeader emoji="🎂" label="Urodziny dnia" />
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
    <div className="p-3 rounded-lg border border-border/60 bg-white/[0.02]">
      {framing ? (
        <div className="mb-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400/80 mb-1">
            ⚡ Kontekst meczu
          </p>
          <p className="text-[12px] text-muted-foreground/90 italic leading-relaxed">{framing}</p>
        </div>
      ) : (
        <BlockHeader emoji="📅" label={match.score ? 'Mecz historyczny' : 'Wydarzenie dnia'} />
      )}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-bold text-primary/80 tabular-nums">{match.year}</span>
          {hasScore && (
            <>
              <span className="text-[13px] font-bold text-foreground">{match.home}</span>
              <span className="score-display text-[15px] font-black text-primary">{match.score}</span>
              <span className="text-[13px] font-bold text-foreground">{match.away}</span>
            </>
          )}
          {!hasScore && (
            <span className="text-[13px] font-bold text-foreground">{match.home || match.competition}</span>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          {match.competition}
        </span>
        <p className="text-[12px] text-muted-foreground leading-relaxed">{match.note}</p>
      </div>
    </div>
  );
}

export function FactsBlock() {
  const facts = getDailyFacts(2);
  return (
    <div className="space-y-2">
      <BlockHeader emoji="⚡" label="Wiedza dnia" />
      {facts.map((fact, i) => (
        <p key={i} className="text-[13px] text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
          {fact}
        </p>
      ))}
    </div>
  );
}
