import { FEATURES } from '@/features/feature-tests/features';

export default function FeatureTestsIndex() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
      <title>Feature tests · Waku Books</title>
      <h1 className="text-2xl font-semibold">Feature tests</h1>
      <p className="text-muted text-sm">
        One page per Framework Compare feature. Each is exercised by <code>feature-tests/*.spec.ts</code>.
      </p>
      <ul className="list-disc pl-6">
        {FEATURES.map(f => (
          <li key={f.id}>
            <a className="underline" href={`/feature-tests/${f.id}`}>
              {f.title}
            </a>{' '}
            <span className="text-muted text-sm">({f.label})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const getConfig = async () => ({ render: 'static' }) as const;
