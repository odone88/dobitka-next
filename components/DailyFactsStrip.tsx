import { getDailyFacts } from '@/lib/content/facts';
import { getTodayBirthdays } from '@/lib/content/birthdays';

export function DailyFactsStrip() {
  const facts = getDailyFacts(2);
  const birthdays = getTodayBirthdays();

  return (
    <div className="space-y-2">
      {birthdays.map((b) => (
        <div key={b.name} className="flex items-start gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-950/20">
          <span className="text-lg flex-shrink-0">🎂</span>
          <div>
            <p className="text-sm font-medium text-amber-300">
              {b.name} kończy dziś {new Date().getFullYear() - b.year} lat
            </p>
            {b.desc && <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>}
          </div>
        </div>
      ))}
      {facts.map((fact, i) => (
        <div key={i} className="flex items-start gap-2 p-3 rounded-lg border border-border bg-card">
          <span className="text-sm flex-shrink-0 mt-0.5">⚡</span>
          <p className="text-xs text-muted-foreground leading-relaxed">{fact}</p>
        </div>
      ))}
    </div>
  );
}
