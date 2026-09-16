'use client';

import { useOptimistic, useTransition } from 'react';
import { useRouter } from 'waku';
import { Range } from '@/components/ui/range';
import { useSearchParamsRecord } from '@/hooks/use-search-params-record';
import { hrefToTarget } from '@/lib/href';
import {
  API_DELAY_VALUES,
  buildHref,
  formatApiDelay,
  getApiDelayMs,
  parseSearchParams,
} from '@/lib/url-state';

export function ApiDelay({ idPrefix }: { idPrefix: string }) {
  const router = useRouter();
  const current = parseSearchParams(useSearchParamsRecord());
  const committed = getApiDelayMs(current);
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useOptimistic(committed);

  function commit(next: number) {
    startTransition(() => {
      setValue(next);
      const params = { ...current, delay: next === 0 ? undefined : String(next) };
      if (!params.delay) delete params.delay;
      void router.replace(hrefToTarget(buildHref(params)), { scroll: false });
    });
  }

  return (
    <div data-filtering={isPending ? '' : undefined}>
      <Range
        hint={
          <>
            <span>Off</span>
            <span>3s</span>
          </>
        }
        id={`${idPrefix}-api-delay`}
        label="API delay"
        onValueChange={commit}
        readout={formatApiDelay(value)}
        value={value}
        values={API_DELAY_VALUES}
      />
    </div>
  );
}

export function ApiDelayFallback({ idPrefix }: { idPrefix: string }) {
  return (
    <Range
      hint={
        <>
          <span>Off</span>
          <span>3s</span>
        </>
      }
      id={`${idPrefix}-api-delay`}
      label="API delay"
      onValueChange={() => undefined}
      readout="Off"
      value={0}
      values={API_DELAY_VALUES}
    />
  );
}
