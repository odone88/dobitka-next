/**
 * Upstash Redis cache layer with graceful fallback.
 *
 * Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars to enable Redis.
 * Without them, fetcher is called directly (no caching beyond Next.js ISR).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let redis: any = null;
let redisChecked = false;

async function getRedis() {
  if (redisChecked) return redis;
  redisChecked = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const { Redis } = await import('@upstash/redis');
      redis = new Redis({ url, token });
    } catch {
      redis = null;
    }
  }

  return redis;
}

/**
 * Cached fetch — tries Redis first, then fetches fresh data.
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSec: number,
): Promise<T> {
  const r = await getRedis();

  if (r) {
    try {
      const cached = await r.get(key);
      if (cached !== null && cached !== undefined) {
        return cached as T;
      }
    } catch {
      // Redis read failed — proceed to fetch
    }
  }

  const fresh = await fetcher();

  if (r && fresh !== null && fresh !== undefined) {
    try {
      r.set(key, fresh, { ex: ttlSec }).catch(() => {});
    } catch {
      // Silent
    }
  }

  return fresh;
}
