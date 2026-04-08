# DOBITKA 2.0 — Narzedzie Kibica

## Wizja
Portal/narzedzie dla polskich kibicow pilki noznej.
Nie news (Weszlo to robi). Nie live score (Flashscore). Nie bukmacher.
Narzedzie angazujace — jak Strava dla biegaczy.

## 5 filarow

### 1. Typer (core feature — hook na userow)
- Typujesz wyniki 10 meczow weekendowych
- Dokladny wynik = 3 pkt, dobry zwyciezca (1X2) = 1 pkt
- Ranking globalny + mini-ligi (zapros znajomych)
- Co tydzien nowa runda, co miesiac reset
- MVP: localStorage. Docelowo: Supabase (konta, ligi prywatne)

### 2. Quiz pilkarski
- 10 pytan co tydzien (generowane z danych + AI)
- Ranking, streaki, badge'e
- Shareable wyniki (OG image)

### 3. Porownywarka druzyn/zawodnikow
- Wybierz 2 druzyny → wizualne porownanie (forma, gole, xG, pozycja)
- Wybierz 2 zawodnikow → kto lepszy statystycznie
- Shareable karty porownania (OG image)

### 4. Moj klub — personal dashboard
- Wybierasz swoj klub → spersonalizowany widok
- Forma, nastepny mecz, pozycja, statystyki sezonu
- Ciekawostki z danych ("Twoj Arsenal jest 1. w tabeli xG")

### 5. Podsumowanie kolejki (AI-generated)
- Po weekendzie: automatyczny przeglad rundy
- Najlepszy mecz, biggest upset, gracz kolejki
- Zero pracy redakcyjnej

## Stack techniczny
- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- Vercel (hosting, cron)
- Upstash Redis (cache)
- Supabase (auth + DB, faza 2)
- FPL API (xG, player stats, FREE, no limit)
- football-data.org (fixtures, results, standings, FREE 10req/min)

## Architektura danych
- Cron 2x/dzien (6:00, 20:00): fetch FPL API + football-data.org → Redis + JSON
- Strony 100% SSG — zero API calls w runtime
- Typer: localStorage (MVP) → Supabase (faza 2)

## Monetyzacja (legalna, zero bukmacherow)
- Google AdSense
- Sponsoring sportowy (Canal+, Viaplay, Nike, EA Sports)
- Premium features (rozszerzone statystyki, custom ligi w typerze)
- Merch (later)

## Harmonogram
- Tydzien 1: MVP Typera (formularz, scoring, ranking)
- Tydzien 2: Quiz + Porownywarka
- Tydzien 3: Moj Klub + Podsumowania kolejek
- Tydzien 4: Polish, PWA, SEO, soft launch

## Koszty
- Hosting: $0 (Vercel free)
- API: $0 (FPL + football-data.org free)
- DB: $0 (Supabase free tier)
- Domena: ~50 PLN/rok
