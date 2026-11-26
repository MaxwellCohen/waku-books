import { FeatureShell } from '@/features/feature-tests/feature-shell';

export default function MultiHostPage() {
  return (
    <FeatureShell id="multi-host-deployment">
      <p>
        Build-time feature. Waku&apos;s default adapter picks a host from the environment (
        <code>waku/adapters/default</code>):
      </p>
      <pre className="rounded border p-3 text-sm">{`waku build                 # node   -> dist/server, dist/public
NETLIFY=1 waku build       # netlify -> netlify-functions/serve.js
VERCEL=1 waku build        # vercel -> .vercel/output/config.json
CLOUDFLARE=1 waku build    # cloudflare -> <dist>/server/wrangler.json`}</pre>
      <p>
        Checked by <code>feature-tests/multi-host-deployment.spec.ts</code> (each build uses its own{' '}
        <code>FT_DIST_DIR</code>).
      </p>
    </FeatureShell>
  );
}

export const getConfig = async () => ({ render: 'static' }) as const;
