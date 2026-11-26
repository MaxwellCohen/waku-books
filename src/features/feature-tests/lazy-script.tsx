'use client';

import { useEffect } from 'react';

/** Hand-rolled lazyOnload: inject the script after window load, in an idle callback. */
export function LazyScript({ src }: { src: string }) {
  useEffect(() => {
    const inject = () => {
      if (document.querySelector(`script[src="${src}"]`)) return;
      const s = Object.assign(document.createElement('script'), { src, async: true });
      document.head.append(s);
    };
    const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(inject) : setTimeout(inject));
    if (document.readyState === 'complete') idle();
    else addEventListener('load', idle, { once: true });
  }, [src]);
  return null;
}
