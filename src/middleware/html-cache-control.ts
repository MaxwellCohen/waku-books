import type { MiddlewareHandler } from 'hono';
import { bindCatalogCache, htmlResponseWithCacheHeaders } from '@/lib/catalog-cache';

export default function htmlCacheControl(): MiddlewareHandler {
  return async (c, next) => {
    bindCatalogCache(c.env?.CATALOG_CACHE);

    await next();

    if (c.req.method !== 'GET' || c.res.status !== 200) return;
    if (!c.res.headers.get('content-type')?.includes('text/html')) return;

    c.res = htmlResponseWithCacheHeaders(c.req.raw, c.res);
  };
}
