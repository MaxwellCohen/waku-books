'use client';

import { useState } from 'react';
import { invalidateStamp } from './cache-actions';

export function InvalidateButton() {
  const [done, setDone] = useState<string | null>(null);
  return (
    <p className="flex items-center gap-3">
      <button
        type="button"
        data-testid="invalidate"
        className="rounded border px-3 py-1"
        onClick={async () => setDone(await invalidateStamp())}
      >
        Invalidate (server action)
      </button>
      {done ? <span data-testid="invalidated">invalidated at {done}</span> : null}
    </p>
  );
}
