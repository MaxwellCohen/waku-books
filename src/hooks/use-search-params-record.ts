'use client';

import { useRouter } from 'waku';
import { queryToRecord } from '@/lib/href';

export function useSearchParamsRecord() {
  const { query } = useRouter();
  return queryToRecord(query);
}
