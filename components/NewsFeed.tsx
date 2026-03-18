'use client';

import { useEffect, useState } from 'react';
import type { NewsItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface NewsData {
  bbc: NewsItem[];
  guardian: NewsItem[];
  weszlo: NewsItem[];
  tifo: NewsItem[];
  updatedAt: string;
}

type TabId = 'bbc' | 'guardian' | 'weszlo' | 'tifo';

const TAB_CONFIG: Record<TabId, { label: string; flag: string }> = {
  bbc:      { label: 'BBC Sport', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  guardian: { label: 'Guardian', flag: '📰' },
  weszlo:   { label: 'Weszło', flag: '🇵🇱' },
  tifo:     { label: 'Tifo', flag: '🎬' },
};

function ArticleRow({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block py-2.5 border-b border-border/40 last:border-0 group"
    >
      <p className="text-[13px] text-foreground group-hover:text-primary transition-colors leading-snug">
        {item.title}
      </p>
      {item.description && (
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
      )}
      <p className="text-[11px] text-muted-foreground/60 mt-0.5">{formatDistanceToNow(item.publishedAt)}</p>
    </a>
  );
}

function TifoVideo({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 py-2.5 border-b border-border/40 last:border-0 group"
    >
      {item.thumbnail && (
        <img
          src={item.thumbnail}
          alt=""
          className="w-28 h-16 object-cover rounded flex-shrink-0"
          loading="lazy"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {item.title}
        </p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">{formatDistanceToNow(item.publishedAt)}</p>
      </div>
    </a>
  );
}

export function NewsFeed() {
  const [data, setData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId | null>(null);

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((d: NewsData) => {
        setData(d);
        // Auto-select first non-empty tab
        const order: TabId[] = ['weszlo', 'bbc', 'guardian', 'tifo'];
        const first = order.find((t) => (d[t]?.length ?? 0) > 0);
        if (first) setActiveTab(first);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }

  if (!data) return null;

  // Only tabs with content
  const availableTabs = (Object.keys(TAB_CONFIG) as TabId[]).filter((t) => (data[t]?.length ?? 0) > 0);

  if (availableTabs.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Brak newsów — sprawdź za chwilę.</p>;
  }

  const current = activeTab && availableTabs.includes(activeTab) ? activeTab : availableTabs[0];
  const items = data[current] ?? [];

  return (
    <div>
      {/* Tabs - only show if more than 1 source has content */}
      {availableTabs.length > 1 && (
        <div className="flex gap-1 mb-3 flex-wrap">
          {availableTabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md font-medium transition-colors',
                current === t
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30'
              )}
            >
              <span>{TAB_CONFIG[t].flag}</span>
              <span>{TAB_CONFIG[t].label}</span>
              <span className="opacity-50">({data[t]?.length})</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div>
        {current === 'tifo'
          ? items.map((item) => <TifoVideo key={item.id} item={item} />)
          : items.map((item) => <ArticleRow key={item.id} item={item} />)
        }
      </div>
    </div>
  );
}
