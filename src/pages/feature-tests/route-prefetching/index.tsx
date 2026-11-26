import { FeatureShell } from '@/features/feature-tests/feature-shell';
import { RouterPrefetchLink, ViewPrefetchLink } from '@/features/feature-tests/prefetch-links';

export default function RoutePrefetchingPage() {
  return (
    <FeatureShell id="route-prefetching">
      <RouterPrefetchLink />
      <div style={{ height: 6000 }} aria-hidden />
      <ViewPrefetchLink />
    </FeatureShell>
  );
}

export const getConfig = async () => ({ render: 'static' }) as const;
