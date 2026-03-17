import type { NewsItem } from '@/types';
import { TIFO_CHANNEL_ID } from '@/config/sources';

export async function getTifoVideos(limit = 5): Promise<NewsItem[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${TIFO_CHANNEL_ID}`;
  try {
    const res = await fetch(url, { next: { revalidate: 7200 } }); // 2h
    if (!res.ok) throw new Error(`YouTube RSS: ${res.status}`);
    const text = await res.text();
    return parseYouTubeAtom(text, limit);
  } catch {
    return [];
  }
}

function parseYouTubeAtom(xml: string, limit: number): NewsItem[] {
  const entries: NewsItem[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null && entries.length < limit) {
    const block = match[1];
    const id = (/<yt:videoId>(.*?)<\/yt:videoId>/.exec(block)?.[1] ?? '');
    const title = htmlDecode(/<title>(.*?)<\/title>/.exec(block)?.[1] ?? '');
    const published = /<published>(.*?)<\/published>/.exec(block)?.[1] ?? '';
    if (!id || !title) continue;
    entries.push({
      id: `yt-${id}`,
      title,
      url: `https://www.youtube.com/watch?v=${id}`,
      source: 'youtube',
      publishedAt: published,
      thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
    });
  }
  return entries;
}

function htmlDecode(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
