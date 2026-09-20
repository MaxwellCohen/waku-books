import type { MiddlewareHandler } from 'hono';
import { htmlResponseWithCacheHeaders, matchCachedHtml, storeCachedHtml } from '@/lib/catalog-cache';
import { getApiDelayMs } from '@/lib/url-state';

export default function htmlCacheControl(): MiddlewareHandler {
  return async (c, next) => {
    if (c.req.method === 'GET') {
      const cached = await matchCachedHtml(c.req.raw);
      if (cached) return cached;
    }

    await next();

    if (c.req.method !== 'GET' || c.res.status !== 200) return;
    if (!c.res.headers.get('content-type')?.includes('text/html')) return;

    c.res = htmlResponseWithCacheHeaders(c.req.raw, c.res);

    const delayMs = getApiDelayMs({ delay: new URL(c.req.url).searchParams.get('delay') ?? undefined });
    if (delayMs <= 0) void storeCachedHtml(c.req.raw, c.res);
  };
}
