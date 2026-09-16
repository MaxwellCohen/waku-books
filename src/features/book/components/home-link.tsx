'use client';

import { BookMark } from '@/components/book-mark';
import { FastLink } from '@/components/ui/fast-link';
import { useSearchParamsRecord } from '@/hooks/use-search-params-record';
import { buildHref, parseSearchParams } from '@/lib/url-state';

const linkClass = 'inline-flex items-center gap-2 text-base font-semibold tracking-tight';

export function HomeLink() {
  const searchParams = useSearchParamsRecord();
  const href = buildHref({ delay: parseSearchParams(searchParams).delay });

  return (
    <FastLink aria-label="Waku Books home" className={linkClass} href={href} prefetch={true}>
      <BookMark className="text-action size-5" />
      Waku Books
    </FastLink>
  );
}

export function HomeLinkFallback() {
  return (
    <FastLink aria-label="Waku Books home" className={linkClass} href="/" prefetch={true}>
      <BookMark className="text-action size-5" />
      Waku Books
    </FastLink>
  );
}
