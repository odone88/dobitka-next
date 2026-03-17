import { NextResponse } from 'next/server';
import { getRedditFeed } from '@/lib/data-sources/reddit';
import { getTifoVideos } from '@/lib/data-sources/youtube-rss';
import { getWeszloFeed } from '@/lib/data-sources/weszlo';

export const revalidate = 900; // 15 min

export async function GET() {
  const [reddit, tifo, weszlo] = await Promise.allSettled([
    getRedditFeed(),
    getTifoVideos(4),
    getWeszloFeed(6),
  ]);

  return NextResponse.json({
    reddit: reddit.status === 'fulfilled' ? reddit.value : [],
    tifo: tifo.status === 'fulfilled' ? tifo.value : [],
    weszlo: weszlo.status === 'fulfilled' ? weszlo.value : [],
    updatedAt: new Date().toISOString(),
  });
}
