'use client';

import Link from 'next/link';
import { useEffect, useRef, type ComponentProps } from 'react';
import { softNav } from './softNav';

/**
 * A link that opens its target as a panel over the sky. Use for star links
 * only (StarMarker, the HTML mirror, painting and still cards). When the panel
 * closes, the SkyLink for that panel's path takes focus back.
 */
export function SkyLink({ onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  // Sky markers (tabIndex −1, inside the aria-hidden host) never take focus back; the HTML mirror's link does.
  const focusable = props.tabIndex !== -1;
  useEffect(() => {
    if (focusable && softNav.takeFocus(props.href)) ref.current?.focus();
  }, [props.href, focusable]);

  return (
    <Link
      {...props}
      ref={ref}
      onClick={(e) => {
        softNav.set(props.href);
        onClick?.(e);
      }}
    />
  );
}
