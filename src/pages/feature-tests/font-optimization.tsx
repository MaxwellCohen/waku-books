import geistLatin from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';
import { FeatureShell } from '@/features/feature-tests/feature-shell';

export default function FontOptimizationPage() {
  return (
    <FeatureShell id="font-optimization">
      {/* @fontsource-variable/geist is imported in src/styles.css (self-hosted, font-display: swap).
          The preload is hand-added: neither Waku nor Fontsource emits one. React hoists it into <head>. */}
      <link rel="preload" as="font" type="font/woff2" href={geistLatin} crossOrigin="anonymous" />
      <p data-testid="font-sample" style={{ fontFamily: "'Geist Variable', sans-serif", fontSize: 32 }}>
        Self-hosted Geist Variable via Fontsource.
      </p>
    </FeatureShell>
  );
}

export const getConfig = async () => ({ render: 'static' }) as const;
