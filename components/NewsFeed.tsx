'use client';

import { useEffect, useState } from 'react';
import type { NewsItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from '@/lib/utils';

interface NewsData {
  reddit: NewsItem[];
  tifo: NewsItem[];
  weszlo: NewsItem[];
  updatedAt: string;
}

function RedditPost({ item }: { item: NewsItem }) {
  const sub = item.subreddit === 'ekstraklasa' ? 'r/ekstraklasa' : 'r/soccer';
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 rounded-lg border border-border hover:border-border/80 hover:bg-muted/20 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {item.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs h-4 px-1 border-border/60">{sub}</Badge>
            {item.isHot && <Badge variant="destructive" className="text-xs h-4 px-1">HOT</Badge>}
            <span>{item.score?.toLocaleString()} pkt</span>
            <span>{item.comments} komentarzy</span>
            <span className="ml-auto">{formatDistanceToNow(item.publishedAt)}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

function TifoVideo({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-muted/20 transition-all group"
    >
      {item.thumbnail && (
        <img
          src={item.thumbnail}
          alt=""
          className="w-20 h-12 object-cover rounded flex-shrink-0"
          loading="lazy"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground group-hover:text-primary line-clamp-2 leading-snug">
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Tifo Football · {formatDistanceToNow(item.publishedAt)}
        </p>
      </div>
    </a>
  );
}

function WeszloArticle({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block py-2 border-b border-border/50 last:border-0 hover:text-primary transition-colors group"
    >
      <p className="text-sm text-foreground group-hover:text-primary leading-snug line-clamp-2">
        {item.title}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{formatDistanceToNow(item.publishedAt)}</p>
    </a>
  );
}

export function NewsFeed() {
  const [data, setData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'reddit' | 'tifo' | 'weszlo'>('reddit');

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }

  return (
    <div>
      <div className="flex gap-1 mb-3 border-b border-border pb-2">
        {([
          { id: 'reddit', label: 'Reddit', count: data?.reddit.length },
          { id: 'tifo', label: 'Tifo', count: data?.tifo.length },
          { id: 'weszlo', label: 'Weszło', count: data?.weszlo.length },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
              tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
            {(t.count ?? 0) > 0 && <span className="ml-1 opacity-60">({t.count})</span>}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {tab === 'reddit' && (data?.reddit ?? []).slice(0, 8).map((item) => (
          <RedditPost key={item.id} item={item} />
        ))}
        {tab === 'tifo' && (data?.tifo ?? []).map((item) => (
          <TifoVideo key={item.id} item={item} />
        ))}
        {tab === 'weszlo' && (data?.weszlo ?? []).map((item) => (
          <WeszloArticle key={item.id} item={item} />
        ))}
        {tab === 'reddit' && (data?.reddit ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Brak postów</p>
        )}
      </div>
    </div>
  );
}
