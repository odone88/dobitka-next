import type { NewsItem } from '@/types';
import { TIFO_CHANNEL_ID } from '@/config/sources';

// Polish football YouTube channels + Tifo
const CHANNELS: { id: string; label: string }[] = [
  { id: TIFO_CHANNEL_ID, label: 'Tifo Football' },
  { id: 'UCHHTmRbOxLhtSwrvy6Fgbkg', label: 'Meczyki' },
  { id: 'UC9M0DP5re_a41jkAJajFfcA', label: 'Kanal Sportowy' },
  { id: 'UCzumI_plFXNBCJnfyJSTzSA', label: 'Foot Truck' },
];

async function fetchChannelVideos(channelId: string, limit: number): Promise<NewsItem[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  try {
    const res = await fetch(url, { next: { revalidate: 7200 } }); // 2h
    if (!res.ok) return [];
    const text = await res.text();
    return parseYouTubeAtom(text, limit);
  } catch {
    return [];
  }
}

export async function getTifoVideos(limit = 5): Promise<NewsItem[]> {
  // Fetch from all channels in parallel, merge by date, take top N
  const results = await Promise.allSettled(
    CHANNELS.map((ch) => fetchChannelVideos(ch.id, 3))
  );

  const all: NewsItem[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value);
  }

  return all
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

function parseYouTubeAtom(xml: string, limit: number): NewsItem[] {
  const entries: NewsItem[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  // Extract channel name from feed title
  const channelName = /<title>([\s\S]*?)<\/title>/.exec(xml)?.[1]?.trim() ?? '';
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
      description: channelName || undefined,
    });
  }
  return entries;
}

function htmlDecode(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
