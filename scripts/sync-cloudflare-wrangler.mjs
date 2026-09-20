import { readFileSync, writeFileSync } from 'node:fs';

const generatedPath = 'dist/server/wrangler.json';
const source = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
const generated = JSON.parse(readFileSync(generatedPath, 'utf8'));

if (source.kv_namespaces) generated.kv_namespaces = source.kv_namespaces;
if (source.observability) generated.observability = source.observability;
if (source.compatibility_flags) generated.compatibility_flags = source.compatibility_flags;

writeFileSync(generatedPath, `${JSON.stringify(generated, null, 2)}\n`);
