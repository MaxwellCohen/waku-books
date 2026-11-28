import { createStorage, type Driver } from 'unstorage';
import { createCache } from 'waku-cache';
import type { CacheStore } from 'waku-cache';
import { memoryStore } from 'waku-cache/stores/memory';
import { unstorageStore } from 'waku-cache/stores/unstorage';

/** Matches Next `cacheLife('hours')`: revalidate 1h, expire 24h. */
export const CATALOG_CACHE_REVALIDATE_SECONDS = 3600;
export const CATALOG_CACHE_EXPIRE_SECONDS = 86400;

/** Match next-books HTML Cache-Control per host (Vercel vs Netlify/Cloudflare/local). */
export const VERCEL_DOCUMENT_CACHE_CONTROL = 'public, max-age=0, must-revalidate';
export const PRIVATE_DOCUMENT_CACHE_CONTROL = 'private, no-cache, no-store, max-age=0, must-revalidate';

function envFlag(name: string) {
  try {
    return typeof process !== 'undefined' ? process.env?.[name] : undefined;
  } catch {
    return undefined;
  }
}

function isVercel() {
  return Boolean(envFlag('VERCEL')) && !envFlag('CLOUDFLARE');
}

function isNetlify() {
  return (
    Boolean(envFlag('NETLIFY') || envFlag('NETLIFY_BLOBS_CONTEXT')) && !envFlag('CLOUDFLARE') && !envFlag('VERCEL')
  );
}

/** Public document Cache-Control matching next-books on this host. */
export function hostDocumentCacheControl(): string {
  return isVercel() ? VERCEL_DOCUMENT_CACHE_CONTROL : PRIVATE_DOCUMENT_CACHE_CONTROL;
}

/** Cloudflare Workers freeze Response headers; copy them onto a new Response. */
export function htmlResponseWithCacheHeaders(_request: Request, response: Response): Response {
  if (!response.headers.get('content-type')?.includes('text/html')) return response;
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', hostDocumentCacheControl());
  headers.delete('CDN-Cache-Control');
  headers.delete('Vercel-CDN-Cache-Control');
  headers.delete('Netlify-CDN-Cache-Control');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Cloudflare's per-data-center Cache API (`caches.default`). Unlike Workers KV it is
 * free with no daily write cap. It can't list keys, so `delete` drops only the exact key.
 */
function cloudflareCacheStore(cache: Cache): CacheStore {
  // Cache API keys must be https URLs; segments arrive percent-encoded.
  const requestOf = (key: readonly string[]) =>
    new Request(`https://example.com/waku-books-catalog-cache/v1/${key.join('/')}`);
  return {
    async get(key) {
      const hit = await cache.match(requestOf(key));
      if (!hit) return null;
      const expiresAt = hit.headers.get('X-Expires-At');
      return {
        value: new Uint8Array(await hit.arrayBuffer()),
        createdAt: Number(hit.headers.get('X-Created-At')),
        ...(expiresAt ? { expiresAt: Number(expiresAt) } : {}),
      };
    },
    async set(key, entry) {
      const ttlSeconds =
        entry.expiresAt !== undefined
          ? Math.max(1, Math.ceil((entry.expiresAt - Date.now()) / 1000))
          : CATALOG_CACHE_EXPIRE_SECONDS;
      const headers = new Headers({
        'Cache-Control': `max-age=${ttlSeconds}`,
        'X-Created-At': String(entry.createdAt),
      });
      if (entry.expiresAt !== undefined) headers.set('X-Expires-At', String(entry.expiresAt));
      await cache.put(requestOf(key), new Response(entry.value as Uint8Array<ArrayBuffer>, { headers }));
    },
    async delete(prefix) {
      await cache.delete(requestOf(prefix));
    },
  };
}

let platform: Promise<CacheStore | null> | undefined;

/** The host's shared store: Cache API on Cloudflare, Vercel Runtime Cache or Netlify Blobs via unstorage. */
function platformStore(): Promise<CacheStore | null> {
  return (platform ??= (async () => {
    if (import.meta.env.CLOUDFLARE) {
      const cache = (globalThis.caches as (CacheStorage & { default?: Cache }) | undefined)?.default;
      return cache ? cloudflareCacheStore(cache) : null;
    }
    // Keep @vercel/functions and @netlify/blobs out of the Worker bundle.
    // Rolldown otherwise injects createRequire() and CF deploy validation fails.
    let driver: Driver | undefined;
    if (isVercel()) {
      const { default: vercelRuntimeCache } = await import('unstorage/drivers/vercel-runtime-cache');
      driver = vercelRuntimeCache({ base: 'catalog', tags: ['catalog'] });
    } else if (isNetlify()) {
      const { default: netlifyBlobs } = await import('unstorage/drivers/netlify-blobs');
      driver = netlifyBlobs({ name: 'catalog-cache' });
    }
    return driver ? unstorageStore(createStorage({ driver })) : null;
  })().catch(() => null));
}

const memory = memoryStore();

/** Per-isolate memory in front of the host's shared store; platform failures fall through to the loader. */
const tieredStore: CacheStore = {
  async get(key) {
    const hit = await memory.get(key);
    if (hit) return hit;
    try {
      const remote = await (await platformStore())?.get(key);
      if (remote) await memory.set(key, remote);
      return remote ?? null;
    } catch {
      return null;
    }
  },
  async set(key, entry) {
    await memory.set(key, entry);
    try {
      await (await platformStore())?.set(key, entry);
    } catch {
      // Platform cache is best-effort.
    }
  },
  async delete(prefix) {
    await memory.delete(prefix);
    await (await platformStore())?.delete(prefix);
  },
};

export const catalogCache = createCache({
  store: tieredStore,
  defaults: { ttl: CATALOG_CACHE_REVALIDATE_SECONDS * 1000 },
});
