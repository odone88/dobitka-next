import type { NewsItem } from '@/types';

export async function getWeszloFeed(limit = 6): Promise<NewsItem[]> {
  try {
    const res = await fetch('https://weszlo.com/feed/', {
      next: { revalidate: 1800 }, // 30 min
    });
    if (!res.ok) throw new Error(`Weszlo RSS: ${res.status}`);
    const text = await res.text();
    return parseRss(text, limit);
  } catch {
    return [];
  }
}

function parseRss(xml: string, limit: number): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const block = match[1];
    const title = stripCdata(/<title>(.*?)<\/title>/s.exec(block)?.[1] ?? '');
    const link = (/<link>(.*?)<\/link>/.exec(block)?.[1] ?? '').trim();
    const pubDate = /<pubDate>(.*?)<\/pubDate>/.exec(block)?.[1] ?? '';
    if (!title || !link) continue;
    items.push({
      id: `weszlo-${Buffer.from(link).toString('base64').slice(0, 12)}`,
      title: htmlDecode(title),
      url: link,
      source: 'weszlo',
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    });
  }
  return items;
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1').trim();
}

function htmlDecode(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '');
}
