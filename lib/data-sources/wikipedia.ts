export interface WikiSummary {
  title: string;
  extract: string;
  thumbnail?: string;
}

export async function getWikiSummary(article: string): Promise<WikiSummary | null> {
  try {
    const slug = encodeURIComponent(article.replace(/ /g, '_'));
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`,
      { next: { revalidate: 86400 } } // 24h
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title,
      extract: data.extract ?? '',
      thumbnail: data.thumbnail?.source,
    };
  } catch {
    return null;
  }
}
