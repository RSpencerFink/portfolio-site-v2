import { easeInOut } from '@/components/sky/chart';
import { getLenis } from './Journey';

/** One stop's flight, in seconds (item 3: 700–900 ms). */
const FLIGHT = 0.8;
/** A wheel event this long after the previous one starts a new gesture (trackpad inertia arrives every ~16 ms). */
const GAP = 180;
/** Px tolerance for "at a stop". */
const TOL = 3;

let busyUntil = 0;
const busy = () => performance.now() < busyUntil;

/**
 * Every programmatic scroll on the home page (steps, rail ticks, hash jumps,
 * the hero snap) goes through here, so the stepper knows to hold.
 * `duration` 0 jumps.
 */
export function goTo(y: number, duration = FLIGHT) {
  const lenis = getLenis();
  busyUntil = performance.now() + duration * 1000 + 80;
  if (!lenis) return window.scrollTo(0, y);
  if (!duration) return lenis.scrollTo(y, { immediate: true, force: true });
  lenis.scrollTo(y, { duration, easing: easeInOut, force: true, lock: true });
}

const typing = (t: EventTarget | null) => !!(t as Element | null)?.closest?.('input, textarea, select, [contenteditable], dialog, [role="group"]');

/**
 * One gesture = one stop (item 3). Inside the stepping zone (the Work stops
 * and the featured build) a wheel flick, a trackpad swipe, a touch swipe or
 * ↑ ↓ PageUp PageDown Space moves exactly one stop and then holds: input is
 * swallowed until the flight lands, and a trackpad's inertia tail counts as
 * the same gesture. At the first and last stop the next gesture is let
 * through, so the page scrolls on into the hero above or the chart below.
 * Free scrolling (inertia from the hero, a scrollbar drag) can't fly past a
 * stop either: it is caught at the first stop it would cross.
 */
export function stepper(stops: () => number[]) {
  const y = () => window.scrollY;
  /** The stop one step from here, or undefined when the gesture should leave the zone (or we're outside it). */
  const targetFor = (dir: 1 | -1) => {
    const s = stops();
    if (!s.length) return;
    const cur = y();
    const margin = innerHeight * 0.6;
    if (cur < s[0] - margin || cur > s.at(-1)! + margin) return;
    return dir > 0 ? s.find((v) => v > cur + TOL) : s.findLast((v) => v < cur - TOL);
  };
  const step = (dir: 1 | -1) => {
    const t = targetFor(dir);
    if (t === undefined) return false;
    goTo(t);
    return true;
  };

  let lastWheel = -Infinity;
  let lastAbs = 0;
  /** The current wheel gesture was taken by the stepper (its tail is swallowed too). */
  let taken = false;
  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) < Math.abs(e.deltaX) || typing(e.target)) return;
    const abs = Math.abs(e.deltaY);
    // A fresh gesture: a pause, or (once the flight has landed) a new swipe rising out of the old one's inertia.
    const fresh = e.timeStamp - lastWheel > GAP || (!busy() && abs > 2.5 * lastAbs && abs > 24);
    lastWheel = e.timeStamp;
    lastAbs = abs;
    if (fresh) taken = false;
    if (!busy() && !taken) taken = step(e.deltaY > 0 ? 1 : -1);
    if (!taken) return;
    e.preventDefault();
    e.stopPropagation(); // Lenis listens on window in the bubble phase
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.altKey || e.metaKey || e.ctrlKey || typing(e.target)) return;
    const onControl = !!(e.target as Element | null)?.closest?.('a, button');
    const dir =
      e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey && !onControl)
        ? 1
        : e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey && !onControl)
          ? -1
          : 0;
    if (!dir) return;
    if (busy()) {
      if (targetFor(dir as 1 | -1) !== undefined || e.repeat) e.preventDefault();
      return;
    }
    if (step(dir as 1 | -1)) e.preventDefault();
  };

  // Touch: decide on the first real move whether the swipe is ours (then the page doesn't scroll natively).
  let touch: { y: number; dir: 0 | 1 | -1 } | null = null;
  const onTouchStart = (e: TouchEvent) => {
    touch = e.touches.length === 1 && !typing(e.target) ? { y: e.touches[0].clientY, dir: 0 } : null;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (!touch) return;
    const dy = touch.y - e.touches[0].clientY;
    if (!touch.dir) {
      if (Math.abs(dy) < 8) return;
      const dir = dy > 0 ? 1 : -1;
      touch.dir = busy() || targetFor(dir) !== undefined ? dir : 0;
      if (!touch.dir) return void (touch = null); // leaving the zone: native scroll
    }
    if (e.cancelable) e.preventDefault();
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (!touch?.dir) return;
    const dy = touch.y - e.changedTouches[0].clientY;
    if (!busy() && Math.abs(dy) > 32) step(touch.dir as 1 | -1);
    touch = null;
  };

  // Free scroll may not cross a stop: catch it at the first one between here and where it is heading.
  let prev = y();
  let idle = 0;
  /** Scrolling stopped between two stops (a scrollbar drag, a resize): settle on the nearer one. */
  const settle = () => {
    if (busy()) return;
    const s = stops();
    const cur = y();
    if (!s.length || cur <= s[0] + TOL || cur >= s.at(-1)! - TOL || s.some((v) => Math.abs(v - cur) <= TOL)) return;
    goTo(s.reduce((a, b) => (Math.abs(b - cur) < Math.abs(a - cur) ? b : a)), 0.6);
  };
  const onScroll = () => {
    clearTimeout(idle);
    idle = window.setTimeout(settle, 160);
    const cur = y();
    const lenis = getLenis();
    const heading = lenis ? lenis.targetScroll : cur;
    const from = prev;
    prev = cur;
    if (busy()) return;
    const ahead = heading > from ? Math.max(heading, cur) : Math.min(heading, cur);
    const crossed = stops().filter((s) => (s - from) * (s - ahead) < 0 && Math.abs(s - from) > TOL);
    if (!crossed.length) return;
    goTo(heading > from ? crossed[0] : crossed.at(-1)!, 0.6);
  };

  const opts = { capture: true, passive: false } as const;
  addEventListener('wheel', onWheel, opts);
  addEventListener('keydown', onKey);
  addEventListener('touchstart', onTouchStart, { passive: true });
  addEventListener('touchmove', onTouchMove, opts);
  addEventListener('touchend', onTouchEnd);
  addEventListener('scroll', onScroll, { passive: true });
  return () => {
    removeEventListener('wheel', onWheel, opts);
    removeEventListener('keydown', onKey);
    removeEventListener('touchstart', onTouchStart);
    removeEventListener('touchmove', onTouchMove, opts);
    removeEventListener('touchend', onTouchEnd);
    removeEventListener('scroll', onScroll);
    clearTimeout(idle);
  };
}
