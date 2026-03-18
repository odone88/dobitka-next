import { NextResponse } from 'next/server';
import { getNewsFeeds } from '@/lib/data-sources/news-rss';
import { getTifoVideos } from '@/lib/data-sources/youtube-rss';

export const revalidate = 900;

export async function GET() {
  const [feeds, tifo] = await Promise.allSettled([
    getNewsFeeds(),
    getTifoVideos(5),
  ]);

  const f = feeds.status === 'fulfilled' ? feeds.value : { bbc: [], guardian: [], weszlo: [] };

  return NextResponse.json({
    bbc: f.bbc,
    guardian: f.guardian,
    weszlo: f.weszlo,
    tifo: tifo.status === 'fulfilled' ? tifo.value : [],
    updatedAt: new Date().toISOString(),
  });
}
