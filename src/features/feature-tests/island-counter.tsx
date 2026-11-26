'use client';

import { useState } from 'react';

// Positive control: this marker must appear in the client JS.
const ISLAND_MARKER = 'ft-island-marker-5d1e';

export function IslandCounter() {
  const [count, setCount] = useState(0);
  return (
    <button
      type="button"
      data-testid="island-button"
      data-marker={ISLAND_MARKER.slice(0, 2)}
      className="rounded border px-3 py-1"
      onClick={() => setCount(c => c + 1)}
    >
      Island clicks: <span data-testid="island-count">{count}</span>
    </button>
  );
}
