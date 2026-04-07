import type { NewsItem } from '@/types';

interface RssSource {
  id: string;
  name: string;
  url: string;
  source: NewsItem['source'];
}

const RSS_SOURCES: RssSource[] = [
  {
    id: 'bbc',
    name: 'BBC Sport',
    url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
    source: 'bbc' as NewsItem['source'],
  },
  {
    id: 'guardian',
    name: 'The Guardian Football',
    url: 'https://www.theguardian.com/football/rss',
    source: 'guardian' as NewsItem['source'],
  },
  {
    id: 'tvpsport',
    name: 'TVP Sport',
    url: 'https://sport.tvp.pl/rss/pilkanozna.xml',
    source: 'tvpsport' as NewsItem['source'],
  },
  {
    id: 'sportpl',
    name: 'Sport.pl Piłka Nożna',
    url: 'https://sport.pl/rss/sport.xml',
    source: 'sportpl' as NewsItem['source'],
  },
];

async function fetchRss(src: RssSource, limit: number): Promise<NewsItem[]> {
  const res = await fetch(src.url, {
    headers: { 'User-Agent': 'dobitka-dashboard/2.0 (+https://dobitka-next.vercel.app)' },
    next: { revalidate: 900 },
  });
  if (!res.ok) {
    console.error(`[DOBITKA] ${src.name} RSS failed: HTTP ${res.status}`);
    throw new Error(`${src.name} RSS ${res.status}`);
  }
  const text = await res.text();
  return parseRss(text, src, limit);
}

function parseRss(xml: string, src: RssSource, limit: number): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const block = match[1];
    const title = htmlDecode(stripCdata(/<title>([\s\S]*?)<\/title>/.exec(block)?.[1] ?? ''));
    const link = stripCdata(/<link>([\s\S]*?)<\/link>/.exec(block)?.[1] ?? '').trim()
      || /<guid[^>]*>([\s\S]*?)<\/guid>/.exec(block)?.[1]?.trim() || '';
    const pubDate = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(block)?.[1] ?? '';
    const description = htmlDecode(stripCdata(/<description>([\s\S]*?)<\/description>/.exec(block)?.[1] ?? '')).slice(0, 120);

    if (!title || !link || title.toLowerCase().includes('advertisement')) continue;
    const cleanLink = link.replace(/<[^>]+>/g, '').trim();

    items.push({
      id: `${src.id}-${Buffer.from(cleanLink).toString('base64').slice(0, 16)}`,
      title,
      url: cleanLink,
      source: src.source,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      description,
    });
  }
  return items;
}

export async function getNewsFeeds(): Promise<{
  bbc: NewsItem[]; guardian: NewsItem[]; weszlo: NewsItem[];
  tvpsport: NewsItem[]; sportpl: NewsItem[];
}> {
  const { getWeszloFeed } = await import('./weszlo');
  const results = await Promise.allSettled([
    fetchRss(RSS_SOURCES[0], 8),   // bbc
    fetchRss(RSS_SOURCES[1], 8),   // guardian
    getWeszloFeed(8),              // weszlo
    fetchRss(RSS_SOURCES[2], 8),   // tvpsport
    fetchRss(RSS_SOURCES[3], 8),   // sportpl
  ]);
  return {
    bbc: results[0].status === 'fulfilled' ? results[0].value : [],
    guardian: results[1].status === 'fulfilled' ? results[1].value : [],
    weszlo: results[2].status === 'fulfilled' ? results[2].value : [],
    tvpsport: results[3].status === 'fulfilled' ? results[3].value : [],
    sportpl: results[4].status === 'fulfilled' ? results[4].value : [],
  };
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function htmlDecode(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '').trim();
}
