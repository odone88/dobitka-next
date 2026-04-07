import type { NewsItem } from '@/types';

async function fetchSubreddit(subreddit: string, limit: number): Promise<NewsItem[]> {
  try {
    const res = await fetch(`https://old.reddit.com/r/${subreddit}/hot.json?limit=${limit}&raw_json=1`, {
      headers: {
        'User-Agent': 'dobitka:v1.0.0 (football dashboard)',
        'Accept': 'application/json',
      },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const posts = (data?.data?.children ?? []) as Array<{ data: Record<string, unknown> }>;

    return posts
      .filter((p) => !p.data.stickied)
      .slice(0, limit)
      .map((p) => ({
        id: p.data.id as string,
        title: p.data.title as string,
        url: `https://reddit.com${p.data.permalink}`,
        source: 'reddit' as const,
        subreddit: `r/${subreddit}`,
        score: p.data.score as number,
        comments: p.data.num_comments as number,
        publishedAt: new Date((p.data.created_utc as number) * 1000).toISOString(),
        description: (p.data.link_flair_text as string) ?? undefined,
      }));
  } catch {
    return [];
  }
}

export async function getRedditHot(limit = 8): Promise<NewsItem[]> {
  const [soccer, ekstra] = await Promise.allSettled([
    fetchSubreddit('soccer', 12),
    fetchSubreddit('Ekstraklasa', 5),
  ]);

  const soccerPosts = soccer.status === 'fulfilled' ? soccer.value : [];
  const ekstraPosts = ekstra.status === 'fulfilled' ? ekstra.value : [];

  // Merge: ekstraklasa first (Polish portal), then r/soccer
  return [...ekstraPosts, ...soccerPosts].slice(0, limit);
}
