import { FeatureShell } from '@/features/feature-tests/feature-shell';

export default function PrefetchTarget({ target }: { target: string }) {
  return (
    <FeatureShell id="route-prefetching">
      <p data-testid="prefetch-target">
        Prefetch target: {target} (rendered {new Date().toISOString()})
      </p>
    </FeatureShell>
  );
}

export const getConfig = async () => ({ render: 'dynamic' }) as const;
