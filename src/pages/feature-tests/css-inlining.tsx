import css from '@/features/feature-tests/css-inlining.css?inline';
import { FeatureShell } from '@/features/feature-tests/feature-shell';

export default function CssInliningPage() {
  return (
    <FeatureShell id="css-inlining">
      {/* Manual: Vite `?inline` gives the CSS string; React 19 hoists <style href precedence> into <head>. */}
      <style href="ft-css-inlining" precedence="default">
        {css}
      </style>
      <p className="ft-inline-marker-7f3a" data-testid="inline-styled">
        This box is styled by CSS that was inlined into the HTML.
      </p>
    </FeatureShell>
  );
}

export const getConfig = async () => ({ render: 'static' }) as const;
