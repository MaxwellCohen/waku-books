import { FeatureShell } from '@/features/feature-tests/feature-shell';
import { LazyScript } from '@/features/feature-tests/lazy-script';

export default function ThirdPartyScriptsPage() {
  return (
    <FeatureShell id="third-party-scripts">
      {/* afterInteractive-ish: React 19 hoists <script async> into <head> and dedupes it. */}
      <script async src="/ft-third-party-async.js" />
      {/* lazyOnload: hand-rolled client component, injects after load + idle. */}
      <LazyScript src="/ft-third-party.js" />
      <p>Two stand-in third-party scripts: one async in head, one injected after load.</p>
    </FeatureShell>
  );
}

export const getConfig = async () => ({ render: 'static' }) as const;
