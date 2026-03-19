import type { NewsItem } from '@/types';

export async function getRedditHot(limit = 8): Promise<NewsItem[]> {
  try {
    const res = await fetch('https://www.reddit.com/r/soccer/hot.json?limit=15', {
      headers: { 'User-Agent': 'dobitka:v1.0 (by /u/dobitka-bot)' },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const posts = (data?.data?.children ?? []) as Array<{ data: Record<string, unknown> }>;

    return posts
      .filter((p) => !p.data.stickied && !p.data.is_self)
      .slice(0, limit)
      .map((p) => ({
        id: p.data.id as string,
        title: p.data.title as string,
        url: `https://reddit.com${p.data.permalink}`,
        source: 'reddit' as const,
        subreddit: 'r/soccer',
        score: p.data.score as number,
        comments: p.data.num_comments as number,
        publishedAt: new Date((p.data.created_utc as number) * 1000).toISOString(),
        description: p.data.link_flair_text as string | undefined,
      }));
  } catch {
    return [];
  }
}
