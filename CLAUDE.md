# Dobitka -- Polski Portal Pilkarski

## Stack
- Next.js 16 (App Router), TypeScript strict, Tailwind CSS v4, Vercel
- React 19 with Server Components + selective 'use client'

## API
- Primary: football-data.org v4 (https://api.football-data.org/v4)
  - Key: `FOOTBALL_DATA_KEY` env var
  - Free tier: 10 req/min, no lineups/statistics
  - Wrapper: `lib/data-sources/football-data.ts`
- Secondary: TheSportsDB (team details, logos), RSS feeds (news), Reddit JSON API, YouTube Atom RSS
- Cache: Upstash Redis (`@upstash/redis`) via `lib/cache.ts`

## Jezyk
- UI: Polski (pl_PL) -- polskie nazwy, daty, komunikaty
- Kod i komentarze: angielski

## Zasady architektoniczne
- Server Components domyslnie, 'use client' TYLKO gdy konieczne (interaktywnosc, hooks, browser APIs)
- WSZYSTKIE wywolania football-data.org przez `fdFetch()` w `lib/data-sources/football-data.ts`
- Drogie zapytania (standings, scorers) owinac w `cachedFetch()` z Redis TTL
- Mobile-first Tailwind -- projektuj na 375px, rozszerzaj breakpointami sm/md/lg/xl
- TypeScript strict -- minimalizuj `any`, pelne typowanie odpowiedzi API
- ISR (`revalidate`) dla stron statycznych, client-side polling (fetch + setInterval/SWR) dla live
- ErrorBoundary wokol kazdej sekcji ktora moze sie wywalic
- LazySection (IntersectionObserver) dla below-the-fold content

## Cache TTL
- 15-30s: live matches
- 60s: today fixtures, match detail (live)
- 300s: standings display, lineups
- 3600s: standings raw, scorers, match detail (finished), H2H
- 86400s: team info, player data, reference data

## Ligi (football-data.org codes)
- PPL: Ekstraklasa (Polska)
- PL: Premier League (Anglia)
- PD: La Liga (Hiszpania)
- BL1: Bundesliga (Niemcy)
- SA: Serie A (Wlochy)
- FL1: Ligue 1 (Francja)
- CL: Liga Mistrzow
- EL: Liga Europy (ograniczone dane na free tier)

## Struktura plikow
```
app/                  -- Next.js App Router pages + API routes
  api/                -- API proxy routes (cache, rate limit protection)
  match/[id]/         -- Strona szczegolowa meczu
  team/[id]/          -- Strona druzyny
  archive/            -- Archiwum meczow
components/           -- React components (Client + Server)
lib/
  cache.ts            -- Upstash Redis cache layer
  data-sources/       -- API wrappers (football-data, news-rss, reddit, youtube, weszlo)
  content/            -- Static content (quotes, facts, historical matches)
  favorites.ts        -- LocalStorage favorites logic
  insights/           -- League insights generator
config/
  sources.ts          -- Data source registry
  leagues.ts          -- League definitions
types/
  index.ts            -- All TypeScript interfaces
public/
  manifest.json       -- PWA manifest
```

## Bezpieczenstwo
- NIGDY nie commituj: .env.local, credentials, API keys
- Waliduj parametry w API routes (whitelist league codes, range-check IDs)
- XSS: sanitize JSON-LD output (.replace(/</g, '\\u003c'))
- Security headers w next.config.ts (X-Frame-Options, CSP, etc.)

## Deploy
- Vercel: auto-deploy z main branch
- Env vars na Vercel: FOOTBALL_DATA_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
- Domain: dobitka-next.vercel.app (docelowo: dobitka.pl)

## Konwencje
- Nazwy komponentow: PascalCase
- Nazwy plikow: PascalCase dla komponentow, kebab-case dla lib
- CSS: Tailwind utility classes, custom properties w globals.css
- Errory loguj z prefixem `[DOBITKA]`
- Polskie URL-e docelowo: /ekstraklasa/tabela/, /mecz/[slug]/, /wyniki-na-zywo/
