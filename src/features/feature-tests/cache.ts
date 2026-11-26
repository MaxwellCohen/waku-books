import { createCache } from 'waku-cache';
import { memoryStore } from 'waku-cache/stores/memory';

/** waku-cache instance for the caching feature test (process-local memory store). */
export const ftCache = createCache({
  store: memoryStore(),
  defaults: { ttl: 60_000 },
});

export const FT_CACHE_TTL_MS = 4_000;

let computeCount = 0;

/** Each real computation returns a new counter value + timestamp; cached calls replay the old one. */
export const getCachedStamp = ftCache.fn(
  async () => {
    computeCount += 1;
    return { count: computeCount, at: new Date().toISOString() };
  },
  { key: () => ['ft-stamp'], ttl: FT_CACHE_TTL_MS },
);
