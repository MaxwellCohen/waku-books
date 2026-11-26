import { FeatureShell } from '@/features/feature-tests/feature-shell';
import { FT_CACHE_TTL_MS, getCachedStamp } from '@/features/feature-tests/cache';
import { InvalidateButton } from '@/features/feature-tests/invalidate-button';

export default async function CachingPage() {
  const cached = await getCachedStamp();
  const uncached = new Date().toISOString();
  return (
    <FeatureShell id="caching">
      <p>
        Cached via <code>waku-cache</code> <code>cache.fn</code> (TTL {FT_CACHE_TTL_MS} ms):{' '}
        <span data-testid="cached-stamp">{`${cached.count}@${cached.at}`}</span>
      </p>
      <p>
        Uncached (render time): <span data-testid="uncached-stamp">{uncached}</span>
      </p>
      <InvalidateButton />
    </FeatureShell>
  );
}

export const getConfig = async () => ({ render: 'dynamic' }) as const;
