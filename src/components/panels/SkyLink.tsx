'use client';

import Link from 'next/link';
import { useEffect, useRef, type ComponentProps } from 'react';
import { softNav } from './softNav';

/**
 * A link that opens its target as a panel over the sky. Use for star links
 * only (StarMarker, the HTML mirror, painting and still cards). When the panel
 * closes, the SkyLink for that panel's path takes focus back.
 */
export function SkyLink({ onClick, ref: outerRef, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  // Sky markers (tabIndex −1, inside the aria-hidden host) never take focus back; the HTML mirror's link does.
  // Several links can share a path (a journey stop and the chart index): the first one that is actually
  // visible once the page has settled wins. Hidden journey stops (visibility: hidden) are skipped.
  const focusable = props.tabIndex !== -1;
  useEffect(() => {
    if (!focusable || !softNav.wantsFocus(props.href)) return;
    // After the close transition, plus two frames: the journey rebuilds its pins (and hides passed stops) in an effect after this one.
    let id = 0;
    let live = true;
    softNav.closed().then(() => {
      id = requestAnimationFrame(() => {
        id = requestAnimationFrame(() => {
          const el = ref.current;
          if (!live || !el || !softNav.wantsFocus(props.href) || !el.checkVisibility({ visibilityProperty: true })) return;
          el.focus({ preventScroll: true });
          if (document.activeElement !== el) return;
          softNav.done();
          // A keyboard close shows the focused link; after a mouse close the page stays put.
          if (el.matches(':focus-visible')) el.scrollIntoView({ block: 'nearest' });
        });
      });
    });
    return () => {
      live = false;
      cancelAnimationFrame(id);
    };
  }, [props.href, focusable]);

  return (
    <Link
      {...props}
      ref={(el: HTMLAnchorElement | null) => {
        ref.current = el;
        // The sky positions its markers through their own ref.
        if (typeof outerRef === 'function') outerRef(el);
        else if (outerRef) outerRef.current = el;
      }}
      onClick={(e) => {
        softNav.set(props.href);
        onClick?.(e);
      }}
    />
  );
}
