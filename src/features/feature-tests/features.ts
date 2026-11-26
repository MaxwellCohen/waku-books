export const FEATURES = [
  { id: 'css-inlining', label: 'manual', title: 'CSS inlining' },
  { id: 'font-optimization', label: 'third-party', title: 'Font optimization' },
  { id: 'image-pipeline', label: 'third-party', title: 'Image pipeline' },
  { id: 'caching', label: 'first-party', title: 'Caching' },
  { id: 'route-prefetching', label: 'first-party', title: 'Route prefetching' },
  { id: 'islands', label: 'first-party', title: 'Islands' },
  { id: 'render-modes', label: 'first-party', title: 'Render modes' },
  { id: 'reactivity', label: 'third-party', title: 'Reactivity' },
  { id: 'bundle-analysis', label: 'third-party', title: 'Bundle analysis' },
  { id: 'third-party-scripts', label: 'manual', title: 'Third-party scripts' },
  { id: 'multi-host-deployment', label: 'first-party', title: 'Multi-host deployment' },
] as const;

export type FeatureId = (typeof FEATURES)[number]['id'];
