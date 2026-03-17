import type { NewsItem } from '@/types';

const SUBREDDITS = ['soccer', 'ekstraklasa'] as const;

async function fetchSubreddit(sub: string, limit = 10): Promise<NewsItem[]> {
  const url = `https://www.reddit.com/r/${sub}/hot.json?limit=${limit}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'dobitka-dashboard/1.0' },
    next: { revalidate: 900 }, // 15 min
  });
  if (!res.ok) throw new Error(`Reddit ${sub}: ${res.status}`);
  const json = await res.json();
  const posts = json?.data?.children ?? [];

  return posts
    .filter((p: Record<string, unknown>) => {
      const d = p.data as Record<string, unknown>;
      return !d.stickied && !d.is_video;
    })
    .map((p: Record<string, unknown>) => {
      const d = p.data as Record<string, unknown>;
      return {
        id: `reddit-${d.id}`,
        title: d.title as string,
        url: `https://reddit.com${d.permalink}`,
        source: 'reddit' as const,
        subreddit: sub,
        score: d.score as number,
        comments: d.num_comments as number,
        publishedAt: new Date((d.created_utc as number) * 1000).toISOString(),
        isHot: (d.score as number) > 1000,
      };
    });
}

export async function getRedditFeed(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(SUBREDDITS.map((s) => fetchSubreddit(s, 8)));
  const items: NewsItem[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...r.value);
  }
  // Sort by score descending, r/soccer first for top items
  return items.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}
