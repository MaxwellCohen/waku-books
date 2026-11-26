import { FeatureShell } from '@/features/feature-tests/feature-shell';
import { SignalCounter, StateCounter } from '@/features/feature-tests/signal-counter';

export default function ReactivityPage() {
  return (
    <FeatureShell id="reactivity">
      <SignalCounter />
      <StateCounter />
    </FeatureShell>
  );
}

export const getConfig = async () => ({ render: 'static' }) as const;
