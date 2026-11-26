import { FeatureShell } from '@/features/feature-tests/feature-shell';

export default function RenderModeDynamicPage() {
  return (
    <FeatureShell id="render-modes">
      <p>
        Mode: <span data-testid="mode">dynamic</span>, rendered at{' '}
        <span data-testid="rendered-at">{new Date().toISOString()}</span>
      </p>
    </FeatureShell>
  );
}

export const getConfig = async () => ({ render: 'dynamic' }) as const;
