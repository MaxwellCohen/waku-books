import { FeatureShell } from '@/features/feature-tests/feature-shell';

export default function BundleAnalysisPage() {
  return (
    <FeatureShell id="bundle-analysis">
      <p>
        Build-time feature. <code>rollup-plugin-visualizer</code> is wired into <code>waku.config.ts</code> for
        the client environment only when <code>ANALYZE=1</code>:
      </p>
      <pre className="rounded border p-3 text-sm">ANALYZE=1 FT_DIST_DIR=dist-ft-analyze waku build</pre>
      <p>
        Output: <code>dist-ft-analyze/analyze/stats.html</code> (treemap) and{' '}
        <code>stats.json</code> (raw data). Checked by <code>feature-tests/bundle-analysis.spec.ts</code>.
      </p>
    </FeatureShell>
  );
}

export const getConfig = async () => ({ render: 'static' }) as const;
