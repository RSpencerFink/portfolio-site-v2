'use client';

import Link from 'next/link';
import { useEffect, useRef, type ComponentProps } from 'react';
import { softNav } from './softNav';
import { isModified } from '@/lib/events';

/**
 * A link that opens its target as a panel over the sky. Use for star links
 * only (StarMarker, the HTML mirror, painting and still cards). When the panel
 * closes, the SkyLink for that panel's path takes focus back.
 */
export function SkyLink({ onClick, ref: outerRef, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  // Sky markers (tabIndex −1, inside the aria-hidden host) never take focus back; the HTML mirror's link does.
  // Several links can share a path (a journey stop and the chart index). Once the close transition
  // is over, a link that is on screen claims focus as soon as it shows (a journey stop fades back in
  // with its scrub); the visually hidden chart index only takes it if nothing has after 600 ms.
  const focusable = props.tabIndex !== -1;
  useEffect(() => {
    if (!focusable || !softNav.wantsFocus(props.href)) return;
    let id = 0;
    let live = true;
    softNav.closed().then(() => {
      const t0 = performance.now();
      const attempt = () => {
        const el = ref.current;
        if (!live || !el || !softNav.wantsFocus(props.href)) return;
        const shown = el.checkVisibility({ visibilityProperty: true });
        const r = el.getBoundingClientRect();
        const onScreen = shown && r.width > 1 && r.bottom > 0 && r.top < innerHeight;
        const late = performance.now() - t0 > 600;
        if (!onScreen && !(late && shown)) {
          if (!late) id = requestAnimationFrame(attempt);
          return;
        }
        el.focus({ preventScroll: true });
        if (document.activeElement !== el) return;
        softNav.done();
        // A keyboard close shows the focused link; after a mouse close, or when the link is off screen
        // (a journey stop far from the chart the panel was opened on), the page stays put.
        if (onScreen && el.matches(':focus-visible')) el.scrollIntoView({ block: 'nearest' });
      };
      id = requestAnimationFrame(attempt);
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
        if (!isModified(e)) softNav.set(props.href);
        onClick?.(e);
      }}
    />
  );
}
