import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { evidence, ROOT, wakuBuild } from './helpers';

const p = (...s: string[]) => path.join(ROOT, ...s);

const HOSTS: { name: string; env: Record<string, string>; dist: string; expect: string[]; check?: () => void }[] = [
  { name: 'node', env: {}, dist: 'dist-ft-node', expect: ['dist-ft-node/server/index.js', 'dist-ft-node/public/feature-tests/index.html'] },
  {
    name: 'netlify',
    env: { NETLIFY: '1' },
    dist: 'dist-ft-netlify',
    expect: ['dist-ft-netlify/public/feature-tests/index.html', 'netlify-functions/serve.js'],
    check: () => expect(readFileSync(p('netlify-functions/serve.js'), 'utf8')).toContain('dist-ft-netlify/server/index.js'),
  },
  {
    name: 'vercel',
    env: { VERCEL: '1' },
    dist: 'dist-ft-vercel',
    expect: ['.vercel/output/config.json', '.vercel/output/static/feature-tests/index.html', '.vercel/output/functions/RSC.func/.vc-config.json'],
  },
  {
    name: 'cloudflare',
    env: { CLOUDFLARE: '1' },
    dist: 'dist-ft-cloudflare',
    expect: ['dist-ft-cloudflare/server/wrangler.json', 'dist-ft-cloudflare/public/feature-tests/index.html'],
  },
];

for (const host of HOSTS) {
  test(`waku build for ${host.name}`, async ({}, testInfo) => {
    test.setTimeout(300_000);
    rmSync(p(host.dist), { recursive: true, force: true });
    if (host.name === 'vercel') rmSync(p('.vercel/output'), { recursive: true, force: true });
    if (host.name === 'netlify') rmSync(p('netlify-functions'), { recursive: true, force: true });
    wakuBuild({ ...host.env, FT_DIST_DIR: host.dist });
    for (const f of host.expect) expect(existsSync(p(f)), f).toBe(true);
    host.check?.();
    evidence(testInfo, `${host.name}: ${host.expect.join(', ')}`);
  });
}
