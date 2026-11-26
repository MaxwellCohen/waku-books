'use server';

import { ftCache } from './cache';

/** Server action: drop the cached stamp so the next render recomputes it. */
export async function invalidateStamp() {
  await ftCache.invalidate({ key: ['ft-stamp'] });
  return new Date().toISOString();
}
