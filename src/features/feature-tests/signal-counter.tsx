'use client';

import { signal } from '@preact/signals-react';
import { useState } from 'react';

declare global {
  interface Window {
    __ftSignalRenders?: number;
    __ftStateRenders?: number;
  }
}

const count = signal(0);

/** @preact/signals-react: the signal is passed straight into JSX, so only the text node updates. */
export function SignalCounter() {
  'use no memo';
  if (typeof window !== 'undefined') window.__ftSignalRenders = (window.__ftSignalRenders ?? 0) + 1;
  return (
    <div className="flex items-center gap-3">
      <button type="button" data-testid="signal-inc" className="rounded border px-3 py-1" onClick={() => count.value++}>
        Signal +1
      </button>
      <span data-testid="signal-text">{count}</span>
    </div>
  );
}

/** Control: plain useState re-runs the component on every update. */
export function StateCounter() {
  'use no memo';
  const [n, setN] = useState(0);
  if (typeof window !== 'undefined') window.__ftStateRenders = (window.__ftStateRenders ?? 0) + 1;
  return (
    <div className="flex items-center gap-3">
      <button type="button" data-testid="state-inc" className="rounded border px-3 py-1" onClick={() => setN(v => v + 1)}>
        useState +1
      </button>
      <span data-testid="state-text">{n}</span>
    </div>
  );
}
