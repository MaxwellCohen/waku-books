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

type KvBinding = {
  get(key: string): Promise<unknown>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
};

let kvBinding: KvBinding | undefined;

/** Bind Workers KV so catalog queries persist across isolates (like Next `use cache`). */
export function bindCatalogCache(kv: KvBinding | undefined) {
  if (kv) kvBinding = kv;
}

let platform: Promise<CacheStore | null> | undefined;

/** The host's shared store (Workers KV, Vercel Runtime Cache, Netlify Blobs), via unstorage. */
function platformStore(): Promise<CacheStore | null> {
  return (platform ??= (async () => {
    let driver: Driver | undefined;
    if (kvBinding) {
      const { default: cloudflareKV } = await import('unstorage/drivers/cloudflare-kv-binding');
      driver = cloudflareKV({ binding: kvBinding });
    } else if (!import.meta.env.CLOUDFLARE) {
      // Keep @vercel/functions and @netlify/blobs out of the Worker bundle.
      // Rolldown otherwise injects createRequire() and CF deploy validation fails.
      if (isVercel()) {
        const { default: vercelRuntimeCache } = await import('unstorage/drivers/vercel-runtime-cache');
        driver = vercelRuntimeCache({ base: 'catalog', tags: ['catalog'] });
      } else if (isNetlify()) {
        const { default: netlifyBlobs } = await import('unstorage/drivers/netlify-blobs');
        driver = netlifyBlobs({ name: 'catalog-cache' });
      }
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
