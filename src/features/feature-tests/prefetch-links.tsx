'use client';

import { Link, useRouter } from 'waku/router/client';

/** Stable API: useRouter().prefetch() on hover/focus. */
export function RouterPrefetchLink() {
  const router = useRouter();
  const href = '/feature-tests/route-prefetching/hover';
  return (
    <Link
      to={href}
      data-testid="hover-link"
      className="underline"
      onMouseEnter={() => router.prefetch(href)}
      onFocus={() => router.prefetch(href)}
    >
      Hover target (router.prefetch)
    </Link>
  );
}

/** Experimental Link prop: unstable_prefetchOnView (IntersectionObserver). */
export function ViewPrefetchLink() {
  return (
    <Link
      to="/feature-tests/route-prefetching/view"
      data-testid="view-link"
      className="underline"
      unstable_prefetchOnView={{}}
    >
      In-view target (unstable_prefetchOnView)
    </Link>
  );
}
