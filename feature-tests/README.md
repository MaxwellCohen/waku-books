# Feature tests

These tests check every Framework Compare label for Waku (`frameworkId: waku`) against a production build.

```sh
pnpm test:features        # = node feature-tests/run.mjs
```

`run.mjs` runs `waku build` (node adapter, preview catalog, `POSTGRES_URL=''`). It then runs Playwright with
`feature-tests/playwright.config.ts`, which serves the build with `waku start --port 4115` and uses system
Chrome at `/home/maxc/.local/bin/google-chrome` (override with `FT_CHROME`; set the port with `FT_PORT`).
Last, it writes `feature-tests/results.json` from the JSON report plus `meta.json`, which holds the claimed
label and method for each feature.

Pages live under `/feature-tests` (`src/pages/feature-tests/**`). Supporting code is in `src/features/feature-tests/`.

| Feature | Spec checks |
| --- | --- |
| css-inlining (manual) | The route CSS (`?inline` + React 19 `<style href precedence>`) is in an inline `<style>` in `<head>`. No linked stylesheet contains it. The computed style applies. |
| font-optimization (third-party) | There are no Google Fonts requests and all font requests come from the same origin. Every Geist `@font-face` has `font-display`. The page has `<link rel=preload as=font>`, and that file gets fetched. |
| image-pipeline (third-party) | vite-imagetools output: `srcset` has ≥2 widths and the image has `width`/`height`. The offscreen `loading=lazy` image is fetched only after scrolling. srcset URLs return `image/webp` and `image/avif`. |
| caching (first-party) | waku-cache `cache.fn`: two requests get the same cached value while the uncached value changes. The value refreshes after the 4s TTL and again after `cache.invalidate` (server action). |
| route-prefetching (first-party) | Hovering (`useRouter().prefetch`) and scrolling into view (`<Link unstable_prefetchOnView>`) each send the target's `/RSC/` request before the click. |
| islands (first-party) | The client counter island works. The static server component's marker string is absent from all JS and HTML, while the island's marker is present. The `<Slice lazy>` content is missing from the initial HTML and arrives through its own RSC request. |
| render-modes (first-party) | `render: 'static'` has a prerendered HTML file and a stable timestamp. `render: 'dynamic'` has no file and its timestamp changes on each request. |
| reactivity (third-party) | Clicking a `@preact/signals-react` signal updates its text 0→3 while the component renders once. A `useState` control re-renders three times. |
| bundle-analysis (third-party) | `ANALYZE=1 FT_DIST_DIR=dist-ft-analyze waku build` writes rollup-plugin-visualizer `stats.html` and `stats.json`. |
| third-party-scripts (manual) | The `<script async>` is hoisted into `<head>` and the head has no parser-blocking scripts. The `LazyScript` tag isn't in the server HTML, runs after `loadEventEnd`, and sets its global. |
| multi-host-deployment (first-party) | `waku build` succeeds with no env set (node) and with `NETLIFY=1`, `VERCEL=1` and `CLOUDFLARE=1`. The expected output for each adapter exists. |

Build-time specs write to `dist-ft-*`, `.vercel/` and `netlify-functions/` (all gitignored), so the served `dist/` stays untouched.
