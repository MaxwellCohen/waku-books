import { Slice } from 'waku/router/client';
import { FeatureShell } from '@/features/feature-tests/feature-shell';
import { IslandCounter } from '@/features/feature-tests/island-counter';
import { StaticBlock } from '@/features/feature-tests/static-block';

export default function IslandsPage() {
  return (
    <FeatureShell id="islands">
      <StaticBlock />
      <IslandCounter />
      {/* Lazy slice = Waku's "server island": fetched separately after the static shell. */}
      <Slice id="ft-server-island" lazy fallback={<p data-testid="slice-fallback">Server island loading…</p>} />
    </FeatureShell>
  );
}

export const getConfig = async () => ({ render: 'static' }) as const;
