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
  tvpsport: NewsItem[];
  sportpl: NewsItem[];
  tifo: NewsItem[];
  reddit: NewsItem[];
}

type TabId = 'polska' | 'bbc' | 'guardian' | 'tifo' | 'reddit';

const TAB_META: Record<TabId, { label: string; flag: string; color: string }> = {
  polska:   { label: 'Polska',    flag: '🇵🇱',          color: 'text-red-500' },
  reddit:   { label: 'Reddit',    flag: '🔥',          color: 'text-orange-400' },
  bbc:      { label: 'BBC',       flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: 'text-red-400' },
  guardian: { label: 'Guardian',  flag: '📰',          color: 'text-blue-400' },
  tifo:     { label: 'Tifo',      flag: '🎬',           color: 'text-purple-400' },
};

const TAB_ORDER: TabId[] = ['polska', 'reddit', 'bbc', 'guardian', 'tifo'];

// Source-level labels for ArticleCard (maps individual source IDs to display info)
const SOURCE_META: Record<string, { label: string; flag: string; color: string }> = {
  weszlo:   { label: 'Weszło',      flag: '🇵🇱', color: 'text-amber-400' },
  tvpsport: { label: 'TVP Sport',   flag: '🇵🇱', color: 'text-red-500' },
  sportpl:  { label: 'Sport.pl',    flag: '🇵🇱', color: 'text-blue-500' },
  bbc:      { label: 'BBC',         flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: 'text-red-400' },
  guardian: { label: 'Guardian',    flag: '📰', color: 'text-blue-400' },
  reddit:   { label: 'Reddit',      flag: '🔥', color: 'text-orange-400' },
  youtube:  { label: 'Tifo',        flag: '🎬', color: 'text-purple-400' },
};

function isRecent(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 30 * 60 * 1000; // <30 min
}

function ArticleCard({ item }: { item: NewsItem }) {
  const meta = SOURCE_META[item.source];
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-1.5 py-3 border-b border-border last:border-0 hover:bg-white/[0.02] -mx-1 px-1 rounded transition-colors"
    >
      <p className="text-[14px] leading-snug text-foreground group-hover:text-primary transition-colors font-medium">
        {item.title}
      </p>
      {item.description && (
        <p className="text-[12px] text-muted-foreground line-clamp-1 leading-relaxed">
          {item.description}
        </p>
      )}
      <div className="flex items-center gap-2 mt-0.5">
        {meta && (
          <span className={cn('text-[10px] font-bold uppercase tracking-wide', meta.color)}>
            {meta.flag} {meta.label}
          </span>
        )}
        <span className="text-[11px] text-muted-foreground">·</span>
        <span className="text-[11px] text-muted-foreground">{formatDistanceToNow(item.publishedAt)}</span>
        {isRecent(item.publishedAt) && (
          <span className="text-[9px] font-black uppercase tracking-wider text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">NEW</span>
        )}
      </div>
    </a>
  );
}

function TifoCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 py-3 border-b border-border last:border-0 hover:bg-white/[0.02] -mx-1 px-1 rounded transition-colors"
    >
      {item.thumbnail && (
        <img
          src={item.thumbnail}
          alt=""
          className="w-28 h-[63px] object-cover rounded flex-shrink-0 opacity-90 group-hover:opacity-100 transition-opacity"
          loading="lazy"
        />
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <p className="text-[13px] leading-snug text-foreground group-hover:text-primary transition-colors font-medium line-clamp-2">
          {item.title}
        </p>
        <span className="text-[11px] text-purple-400 font-bold uppercase tracking-wide">
          🎬 Tifo Football · {formatDistanceToNow(item.publishedAt)}
        </span>
      </div>
    </a>
  );
}

function RedditCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-1.5 py-3 border-b border-border last:border-0 hover:bg-white/[0.02] -mx-1 px-1 rounded transition-colors"
    >
      <p className="text-[14px] leading-snug text-foreground group-hover:text-primary transition-colors font-medium">
        {item.title}
      </p>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-orange-400">
          r/soccer
        </span>
        {item.score != null && (
          <>
            <span className="text-[11px] text-muted-foreground">·</span>
            <span className="text-[11px] text-orange-300/70 font-bold">{item.score} ▲</span>
          </>
        )}
        {item.comments != null && (
          <>
            <span className="text-[11px] text-muted-foreground">·</span>
            <span className="text-[11px] text-muted-foreground">{item.comments} komentarzy</span>
          </>
        )}
        {item.description && (
          <>
            <span className="text-[11px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground uppercase">{item.description}</span>
          </>
        )}
      </div>
    </a>
  );
}

function EmptyState({ tab }: { tab: TabId }) {
  const msgs: Record<TabId, string> = {
    polska:   'Brak polskich newsów. Sprawdź za chwilę.',
    bbc:      'BBC Sport nie odpowiada. Sprawdź za chwilę.',
    guardian: 'Guardian niedostępny. Spróbuj za chwilę.',
    tifo:     'Brak nowych wideo Tifo Football.',
    reddit:   'Reddit niedostępny. Sprawdź za chwilę.',
  };
  return (
    <div className="py-6 text-center">
      <p className="text-[13px] text-muted-foreground">{msgs[tab]}</p>
    </div>
  );
}

export function NewsFeed() {
  const [data, setData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabId>('polska');
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/news')
      .then((r) => {
        if (!r.ok) throw new Error('network');
        return r.json();
      })
      .then((d: NewsData) => {
        setData(d);
        // Default to 'polska' if any PL sources have content
        const plCount = (d.weszlo?.length ?? 0) + (d.tvpsport?.length ?? 0) + (d.sportpl?.length ?? 0);
        if (plCount > 0) {
          setSelectedTab('polska');
        } else {
          const first = TAB_ORDER.find((t) => t !== 'polska' && ((d as unknown as Record<string, unknown[]>)[t]?.length ?? 0) > 0);
          if (first) setSelectedTab(first);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  function switchTab(tab: TabId) {
    if (tab === selectedTab) return;
    setFading(true);
    // Short fade-out, then switch, then fade-in
    setTimeout(() => {
      setSelectedTab(tab);
      setFading(false);
    }, 150);
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-[13px] text-muted-foreground py-4 text-center">Błąd ładowania newsów.</p>;
  }

  // "polska" tab merges weszlo + tvpsport + sportpl, sorted by date
  function getTabItems(tab: TabId): NewsItem[] {
    if (!data) return [];
    if (tab === 'polska') {
      return [...(data.weszlo ?? []), ...(data.tvpsport ?? []), ...(data.sportpl ?? [])]
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 15);
    }
    return (data as unknown as Record<string, NewsItem[]>)[tab] ?? [];
  }

  const activeTabs = TAB_ORDER.filter((t) => getTabItems(t).length > 0);

  if (activeTabs.length === 0) {
    return <p className="text-[13px] text-muted-foreground py-4 text-center">Brak newsów — sprawdź za chwilę.</p>;
  }

  const currentTab: TabId = activeTabs.includes(selectedTab) ? selectedTab : activeTabs[0];
  const items: NewsItem[] = getTabItems(currentTab);

  return (
    <div>
      {/* Tabs */}
      {activeTabs.length > 1 && (
        <div className="flex gap-1 mb-1 flex-wrap border-b border-border pb-2">
          {activeTabs.map((t) => {
            const m = TAB_META[t];
            const isActive = currentTab === t;
            return (
              <button
                key={t}
                onClick={() => switchTab(t)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded font-bold uppercase tracking-wide transition-all cursor-pointer',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                )}
              >
                <span>{m.flag}</span>
                <span>{m.label}</span>
                <span className={cn('opacity-50', isActive && 'opacity-80')}>({getTabItems(t).length})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Items — keyed by currentTab to force remount on switch */}
      <div
        key={currentTab}
        className={cn(
          'transition-opacity duration-150',
          fading ? 'opacity-0' : 'opacity-100 animate-[fadeIn_200ms_ease-out]'
        )}
      >
        {items.length === 0 ? (
          <EmptyState tab={currentTab} />
        ) : currentTab === 'tifo' ? (
          items.map((item) => <TifoCard key={item.id} item={item} />)
        ) : currentTab === 'reddit' ? (
          items.map((item) => <RedditCard key={item.id} item={item} />)
        ) : (
          items.map((item) => <ArticleCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
