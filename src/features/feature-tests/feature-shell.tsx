import type { ReactNode } from 'react';
import { FEATURES, type FeatureId } from './features';

export function FeatureShell({ id, children }: { id: FeatureId; children: ReactNode }) {
  const feature = FEATURES.find(f => f.id === id)!;
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
      <title>{`${feature.title} · Feature tests · Waku Books`}</title>
      <a className="text-muted text-sm underline" href="/feature-tests">
        ← Feature tests
      </a>
      <h1 className="text-2xl font-semibold">
        {feature.title} <span className="text-muted text-sm font-normal">({feature.label})</span>
      </h1>
      {children}
    </div>
  );
}
