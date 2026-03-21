'use client';

import { useEffect, useState } from 'react';
import type { Quote } from '@/lib/content/quotes';

export function QuotesSection() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    // Fetch UCL data for contextual tags
    fetch('/api/ucl-bracket')
      .then((r) => r.json())
      .then((d) => {
        const todayTeams: string[] = d.todayTeams ?? [];
        const priorityTags = todayTeams.length > 0 ? ['ucl', 'rewanz', 'presja'] : [];

        // Import and call getDailyQuotes dynamically to keep it server-safe
        import('@/lib/content/quotes').then(({ getDailyQuotes }) => {
          const all = getDailyQuotes(6, priorityTags);

          // Dedup with sessionStorage (try-catch for private/restricted mode)
          let seen: string[] = [];
          const seenKey = 'dobitka_seen_quotes';
          try { seen = JSON.parse(sessionStorage.getItem(seenKey) ?? '[]'); } catch {}
          const fresh = all.filter((q) => !seen.includes(q.text));
          const picked = fresh.length >= 4 ? fresh.slice(0, 4) : all.slice(0, 4);

          // Save shown quotes
          try {
            const newSeen = [...seen, ...picked.map((q) => q.text)].slice(-20);
            sessionStorage.setItem(seenKey, JSON.stringify(newSeen));
          } catch {}

          setQuotes(picked);
        });
      })
      .catch(() => {
        import('@/lib/content/quotes').then(({ getDailyQuotes }) => {
          setQuotes(getDailyQuotes(4));
        });
      });
  }, []);

  if (quotes.length === 0) return null;

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
            <span className="font-semibold text-foreground">{q.author}</span>
            {q.context && <span className="text-muted-foreground"> · {q.context}</span>}
            {q.date && <span className="text-muted-foreground"> · {q.date}</span>}
            <span className="text-[9px] text-muted-foreground italic ml-1">cytat</span>
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
