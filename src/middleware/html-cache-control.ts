import type { MiddlewareHandler } from 'hono';
import { HTML_CACHE_CONTROL, matchCachedHtml, storeCachedHtml } from '@/lib/catalog-cache';
import { getApiDelayMs } from '@/lib/url-state';

const UNCACHED_HTML = 'private, no-store';

export default function htmlCacheControl(): MiddlewareHandler {
  return async (c, next) => {
    if (c.req.method === 'GET') {
      const cached = await matchCachedHtml(c.req.raw);
      if (cached) return cached;
    }

    await next();

    if (c.req.method !== 'GET' || c.res.status !== 200) return;
    if (!c.res.headers.get('content-type')?.includes('text/html')) return;

    const delayMs = getApiDelayMs({ delay: new URL(c.req.url).searchParams.get('delay') ?? undefined });
    const cacheControl = delayMs > 0 ? UNCACHED_HTML : HTML_CACHE_CONTROL;
    c.header('Cache-Control', cacheControl);
    c.header('CDN-Cache-Control', cacheControl);
    c.header('Vercel-CDN-Cache-Control', cacheControl);
    c.header('Netlify-CDN-Cache-Control', cacheControl);

    if (delayMs <= 0) void storeCachedHtml(c.req.raw, c.res);
  };
}
