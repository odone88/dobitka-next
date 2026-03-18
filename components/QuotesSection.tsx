import { getDailyQuotes } from '@/lib/content/quotes';

export function QuotesSection() {
  const quotes = getDailyQuotes();

  return (
    <div className="space-y-3">
      {quotes.map((q, i) => (
        <blockquote
          key={i}
          className="relative pl-4 border-l-2 border-primary/60 space-y-1"
        >
          <p className="text-[13px] text-foreground leading-relaxed font-medium">
            &ldquo;{q.text}&rdquo;
          </p>
          <footer className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground/80">{q.author}</span>
            {q.context && <span className="text-muted-foreground"> · {q.context}</span>}
            {q.date && <span className="text-muted-foreground/60"> · {q.date}</span>}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
