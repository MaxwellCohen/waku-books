import { FeatureShell } from '@/features/feature-tests/feature-shell';

export default function RenderModesPage() {
  return (
    <FeatureShell id="render-modes">
      <ul className="list-disc pl-6">
        <li>
          <a className="underline" href="/feature-tests/render-modes/static">
            Static (getConfig render: &apos;static&apos;, prerendered at build)
          </a>
        </li>
        <li>
          <a className="underline" href="/feature-tests/render-modes/dynamic">
            Dynamic (getConfig render: &apos;dynamic&apos;, rendered per request)
          </a>
        </li>
      </ul>
    </FeatureShell>
  );
}

export const getConfig = async () => ({ render: 'static' }) as const;
