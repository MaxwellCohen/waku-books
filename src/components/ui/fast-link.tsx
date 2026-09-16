'use client';

import { Link } from 'waku';
import { startTransition, useRef } from 'react';
import { hrefToTarget } from '@/lib/href';
import type { ComponentProps, ReactNode } from 'react';

type LinkProps = ComponentProps<typeof Link>;

type Props = Omit<LinkProps, 'children' | 'to'> & {
  children?: ReactNode;
  href: string;
  onPressNavigate?: () => void;
  prefetch?: boolean | 'auto' | 'hover';
};

export function FastLink({
  children = null,
  href,
  onClick,
  onMouseDown,
  onPressNavigate,
  prefetch = 'auto',
  ...props
}: Props) {
  const navigatedOnMouseDown = useRef(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const prefetchOnView = prefetch === true || prefetch === 'auto' ? {} : undefined;
  const prefetchOnEnter = prefetch === true || prefetch === 'hover' ? {} : undefined;

  return (
    <Link
      {...props}
      children={children}
      to={hrefToTarget(href)}
      unstable_instant
      unstable_prefetchOnEnter={prefetchOnEnter}
      unstable_prefetchOnView={prefetchOnView}
      onMouseDown={event => {
        const target = event.currentTarget.getAttribute('target');
        const interactiveTarget =
          event.target instanceof Element
            ? event.target.closest('button, input, select, textarea, [contenteditable="true"], [role="button"]')
            : null;
        const shouldNavigate =
          !interactiveTarget &&
          (!target || target === '_self') &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          !event.currentTarget.hasAttribute('download') &&
          event.button === 0;

        if (!shouldNavigate) {
          onMouseDown?.(event);
          return;
        }

        startTransition(() => {
          onPressNavigate?.();
          event.currentTarget.click();
          navigatedOnMouseDown.current = true;
          clearTimeout(resetTimer.current);
          resetTimer.current = setTimeout(() => {
            navigatedOnMouseDown.current = false;
          }, 500);
        });
        event.preventDefault();
        onMouseDown?.(event);
      }}
      onClick={event => {
        if (navigatedOnMouseDown.current) {
          clearTimeout(resetTimer.current);
          navigatedOnMouseDown.current = false;
          event.preventDefault();
          return;
        }

        onClick?.(event);
      }}
    />
  );
}
