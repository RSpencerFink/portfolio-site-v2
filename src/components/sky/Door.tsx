'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, type FocusEvent, type ReactNode, type Ref } from 'react';
import { door } from '@/content/sky';
import { isModified } from '@/lib/events';
import { cameraRig } from './cameraRig';
import { chartLayout, focus, layoutFor } from './chart';

/*
 * The door (spec §12b): unlabelled stars near the H3 chart's edge that lead to the visual arts.
 * Event listeners write `doorInput`; syncLabels turns it into `doorStore` (found or not) every
 * frame, since it has the door's screen position; the scene eases the stars and line toward it.
 */

/** Pointer within this many CSS px of the door's centre finds it. */
const NEAR_PX = 120;
/** A tap near the door keeps it lit this long (touch has no hover). */
const TAP_MS = 4000;
/** Camera dive before the route changes (the sky fades out over the same time). */
const FLY_MS = 600;

/** Mouse position (until = Infinity) or the last tap (until = expiry); focus on a door link; a flight in progress. */
export const doorInput = { x: -1e4, y: -1e4, until: 0, focused: false, flying: false };

let found = false;
const listeners = new Set<() => void>();
export const doorStore = {
  get: () => found,
  set(v: boolean) {
    if (v === found) return;
    found = v;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** Found this frame? `at` is the door's screen position; only the H3 rest counts, besides focus and a flight. */
export function doorFound(at: readonly [number, number] | null, w: number, h: number) {
  if (doorInput.focused || doorInput.flying) return true;
  if (!at || !('explore' in document.documentElement.dataset)) return false;
  const pointer = performance.now() < doorInput.until && Math.hypot(at[0] - doorInput.x, at[1] - doorInput.y) < NEAR_PX;
  // Zoomed in with the door near the middle of the view (T18 pan/zoom).
  const centred = cameraRig.getState().view.zoom > 1.15 && Math.hypot(at[0] - w / 2, at[1] - h / 2) < 0.3 * Math.min(w, h);
  return pointer || centred;
}

/** The meteor in flight, in CSS px (Meteors writes it every frame, null between meteors). */
export const meteorHead = { current: null as { x: number; y: number; dx: number; dy: number } | null };
/** Within 32 px of the head or the first 70 px of its tail: a generous target for something that moves. */
export function onMeteor(x: number, y: number) {
  const m = meteorHead.current;
  if (!m) return false;
  const along = Math.min(Math.max((m.x - x) * m.dx + (m.y - y) * m.dy, 0), 70);
  return Math.hypot(m.x - m.dx * along - x, m.y - m.dy * along - y) < 32;
}

/** Fly into the door, then open the visual arts. Reduced motion: straight there, no flight. */
export function enterDoor(push: (href: string) => void) {
  // Already on the Analog view (a meteor clicked there): nothing to fly to, and no route change would end the flight.
  if (doorInput.flying || location.pathname === door.href) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return push(door.href);
  doorInput.flying = true;
  doorStore.set(true);
  const w = innerWidth;
  const h = innerHeight;
  const c = chartLayout(layoutFor(w, h));
  // An explicit pose, not a star id: a star target draws the focal reticle on the door.
  const p = focus(c.door, c.layout === 'portrait' ? 2.4 : 1.6, 46, w / h, 0.5, 0.5);
  cameraRig.setTarget({ position: p.pos, lookAt: p.look });
  cameraRig.setDim(0);
  setTimeout(() => push(door.href), FLY_MS);
}

/**
 * SkyHost: tracks the pointer and taps for the door, opens it from a click on a meteor in flight
 * (capture phase, so the H3 drag never starts), and hands the camera back once the flight has landed.
 */
export function useDoor(pathname: string) {
  const router = useRouter();

  useEffect(() => {
    if (!doorInput.flying) return;
    doorInput.flying = false;
    cameraRig.setTarget(null);
    cameraRig.setDim(1);
  }, [pathname]);

  useEffect(() => {
    const ac = new AbortController();
    const { signal } = ac;
    let swallow = false;
    addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType !== 'touch') Object.assign(doorInput, { x: e.clientX, y: e.clientY, until: Infinity });
      },
      { passive: true, signal },
    );
    addEventListener(
      'pointerdown',
      (e) => {
        if (e.pointerType === 'touch') Object.assign(doorInput, { x: e.clientX, y: e.clientY, until: performance.now() + TAP_MS });
        if (isModified(e) || !onMeteor(e.clientX, e.clientY)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        // The click that follows lands on whatever is under the meteor (a star label): it must not open that too.
        swallow = true;
        setTimeout(() => (swallow = false), 600);
        enterDoor(router.push);
      },
      { capture: true, signal },
    );
    addEventListener(
      'click',
      (e) => {
        if (!swallow) return;
        swallow = false;
        e.preventDefault();
        e.stopImmediatePropagation();
      },
      { capture: true, signal },
    );
    return () => ac.abort();
  }, [router]);
}

/** A link through the door: the sky's own marker (tabIndex −1) and the HTML mirror's, the last stop in the chart's tab order. */
export function DoorLink({ className, tabIndex, ref, children }: { className?: string; tabIndex?: number; ref?: Ref<HTMLAnchorElement>; children?: ReactNode }) {
  const router = useRouter();
  // Keyboard focus finds the door; focus a mouse click leaves on the sky marker does not (it would stay lit on return).
  const focused = (v: boolean) => (e: FocusEvent<HTMLAnchorElement>) => {
    doorInput.focused = v && e.currentTarget.matches(':focus-visible');
    doorStore.set(doorInput.focused || doorInput.flying);
  };
  return (
    <Link
      ref={ref}
      href={door.href}
      className={className}
      tabIndex={tabIndex}
      onClick={(e) => {
        if (isModified(e)) return;
        e.preventDefault();
        enterDoor(router.push);
      }}
      onFocus={focused(true)}
      onBlur={focused(false)}
    >
      {children}
    </Link>
  );
}
