import { FeatureShell } from '@/features/feature-tests/feature-shell';

export default function RenderModeStaticPage() {
  return (
    <FeatureShell id="render-modes">
      <p>
        Mode: <span data-testid="mode">static</span>, rendered at{' '}
        <span data-testid="rendered-at">{new Date().toISOString()}</span>
      </p>
    </FeatureShell>
  );
}

export const getConfig = async () => ({ render: 'static' }) as const;
