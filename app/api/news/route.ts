import { NextResponse } from 'next/server';
import { getNewsFeeds } from '@/lib/data-sources/news-rss';
import { getTifoVideos } from '@/lib/data-sources/youtube-rss';
import { getRedditHot } from '@/lib/data-sources/reddit';

export const revalidate = 900;

export async function GET() {
  const [feeds, tifo, reddit] = await Promise.allSettled([
    getNewsFeeds(),
    getTifoVideos(5),
    getRedditHot(8),
  ]);

  const f = feeds.status === 'fulfilled' ? feeds.value : { bbc: [], guardian: [], weszlo: [], tvpsport: [], sportpl: [] };

  return NextResponse.json({
    bbc: f.bbc,
    guardian: f.guardian,
    weszlo: f.weszlo,
    tvpsport: f.tvpsport,
    sportpl: f.sportpl,
    tifo: tifo.status === 'fulfilled' ? tifo.value : [],
    reddit: reddit.status === 'fulfilled' ? reddit.value : [],
    updatedAt: new Date().toISOString(),
  });
}
