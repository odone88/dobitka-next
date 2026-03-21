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

  if (quotes.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="pl-4 border-l-2 border-primary/20 space-y-1.5">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quotes.map((q, i) => (
        <blockquote
          key={i}
          className="relative pl-4 border-l-3 border-primary/60 space-y-1.5 py-1"
        >
          <p className="text-[14px] text-foreground leading-relaxed font-medium italic">
            &ldquo;{q.text}&rdquo;
          </p>
          <footer className="text-[12px]">
            <span className="font-bold text-primary">{q.author}</span>
            {q.context && <span className="text-muted-foreground"> · {q.context}</span>}
            {q.date && <span className="text-muted-foreground"> · {q.date}</span>}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
