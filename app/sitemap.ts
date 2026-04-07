import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dobitka-next.vercel.app';

  const leagues = [
    'ekstraklasa',
    'premier-league',
    'la-liga',
    'bundesliga',
    'serie-a',
    'ligue-1',
    'liga-mistrzow',
  ];

  const leaguePages: MetadataRoute.Sitemap = leagues.map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const tablePages: MetadataRoute.Sitemap = leagues.map((slug) => ({
    url: `${baseUrl}/${slug}/tabela`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/wyniki-na-zywo`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/predykcje`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gdzie-ogladac`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...leaguePages,
    ...tablePages,
  ];
}
