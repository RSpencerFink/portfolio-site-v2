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

/** The scrolling text column of the stop on screen (JourneySections `[data-scroll]`), if it overflows. */
function column() {
  return [...document.querySelectorAll<HTMLElement>('#journey [data-scroll]')].find((el) => {
    const r = el.getBoundingClientRect();
    return el.scrollHeight > el.clientHeight + 2 && r.bottom > 0 && r.top < innerHeight && el.checkVisibility({ visibilityProperty: true, opacityProperty: true });
  });
}
/** The column has more to read in that direction. */
const canScroll = (el: HTMLElement | undefined, dir: number): el is HTMLElement =>
  !!el && (dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 2);

/**
 * Every programmatic scroll on the home page (steps, rail ticks, hash jumps,
 * the hero snap) goes through here, so the stepper knows to hold.
 * `duration` 0 jumps.
 */
export function goTo(y: number, duration = FLIGHT) {
  const lenis = getLenis();
  busyUntil = performance.now() + duration * 1000 + 80;
  // Every stop is entered at the top of its text; the one being left keeps its place until it has faded.
  const leaving = column();
  document.querySelectorAll<HTMLElement>('#journey [data-scroll]').forEach((el) => el !== leaving && (el.scrollTop = 0));
  if (!lenis) return window.scrollTo(0, y);
  if (!duration) return lenis.scrollTo(y, { immediate: true, force: true });
  lenis.scrollTo(y, { duration, easing: easeInOut, force: true, lock: true });
}

const typing = (t: EventTarget | null) => !!(t as Element | null)?.closest?.('input, textarea, select, [contenteditable], dialog, [role="group"]');

/**
 * One gesture = one stop (item 3), desktop only (the phone journey is native
 * scroll). Inside the stepping zone (the Work stops and the featured build) a
 * wheel flick, a trackpad swipe or
 * ↑ ↓ PageUp PageDown Space moves exactly one stop and then holds: input is
 * swallowed until the flight lands, and a trackpad's inertia tail counts as
 * the same gesture. At the first and last stop the next gesture is let
 * through, so the page scrolls on into the hero above or the chart below.
 * Free scrolling (inertia from the hero, a scrollbar drag) can't fly past a
 * stop either: it is caught at the first stop it would cross.
 * A stop whose text is taller than the screen scrolls its column first; only
 * a fresh gesture that starts with the column at its end (or start, going
 * back) moves on, so the gesture that reaches the edge never also steps.
 */
export function stepper(stops: () => number[]) {
  const y = () => window.scrollY;
  /** The stop one step from here, or undefined when the gesture should leave the zone (or we're outside it). */
  const inZone = (s = stops()) => !!s.length && y() > s[0] - innerHeight * 0.6 && y() < s.at(-1)! + innerHeight * 0.6;
  const targetFor = (dir: 1 | -1) => {
    const s = stops();
    if (!inZone(s)) return;
    const cur = y();
    return dir > 0 ? s.find((v) => v > cur + TOL) : s.findLast((v) => v < cur - TOL);
  };
  /** At rest in the zone on a stop whose column can still scroll that way: the column to scroll. */
  const columnFor = (dir: number) => {
    if (busy() || !inZone()) return;
    const el = column();
    return canScroll(el, dir) ? el : undefined;
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
  /** The current wheel gesture scrolls this stop's column (to its end at most; it never steps). */
  let inner: HTMLElement | undefined;
  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) < Math.abs(e.deltaX) || typing(e.target)) return;
    const abs = Math.abs(e.deltaY);
    // A fresh gesture: a pause, or (once the flight has landed) a new swipe rising out of the old one's inertia.
    const fresh = e.timeStamp - lastWheel > GAP || (!busy() && abs > 2.5 * lastAbs && abs > 24);
    lastWheel = e.timeStamp;
    lastAbs = abs;
    // A gesture that starts mid-flight is swallowed whole, its inertia tail included.
    if (fresh) {
      taken = busy();
      inner = columnFor(e.deltaY);
    }
    if (inner) {
      inner.scrollTop += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (!busy() && !taken) taken = step(e.deltaY > 0 ? 1 : -1);
    if (!taken) return;
    e.preventDefault();
    e.stopPropagation(); // Lenis listens on window in the bubble phase
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.altKey || e.metaKey || e.ctrlKey || typing(e.target)) return;
    // Space activates a button; on a link it is a page scroll like anywhere else.
    const onControl = !!(e.target as Element | null)?.closest?.('button');
    const dir =
      e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey && !onControl)
        ? 1
        : e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey && !onControl)
          ? -1
          : 0;
    if (!dir) return;
    const col = columnFor(dir);
    if (col) {
      e.preventDefault();
      col.scrollBy({ top: dir * col.clientHeight * 0.8, behavior: 'smooth' });
      return;
    }
    // Holding the key scrolls a long column to its end and stops there: moving on takes a fresh press.
    if (e.repeat && !busy() && inZone() && column()) return void e.preventDefault();
    if (busy()) {
      if (targetFor(dir as 1 | -1) !== undefined || e.repeat) e.preventDefault();
      return;
    }
    if (step(dir as 1 | -1)) e.preventDefault();
  };

  // Free scroll may not cross a stop: catch it at the first one between here and where it is heading.
  let prev = y();
  /** Where the page last came to rest: the stop a glide leaves is not caught. */
  let rest = prev;
  let idle = 0;
  /** Scrolling stopped between two stops (a scrollbar drag, a resize): settle on the nearer stop. */
  const settle = () => {
    if (busy()) return;
    const s = stops();
    const cur = (rest = y());
    if (!s.length || cur <= s[0] + TOL || cur >= s.at(-1)! - TOL || s.some((v) => Math.abs(v - cur) < 0.5)) return;
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
    if (busy()) return void (rest = cur);
    // A jump (hash landing, scroll restoration) is not a glide: nothing to catch.
    if (Math.abs(cur - from) > innerHeight) return;
    const ahead = heading > from ? Math.max(heading, cur) : Math.min(heading, cur);
    // A stop the glide reaches or passes, other than the one it left (a frame can land exactly on a stop mid-glide).
    const crossed = stops().filter((s) => (s - from) * (s - ahead) <= 0 && s !== ahead && Math.abs(s - rest) > 0.5);
    if (!crossed.length) return;
    goTo(heading > from ? crossed[0] : crossed.at(-1)!, 0.6);
  };

  const ac = new AbortController();
  const { signal } = ac;
  addEventListener('wheel', onWheel, { signal, capture: true, passive: false });
  addEventListener('keydown', onKey, { signal });
  addEventListener('scroll', onScroll, { signal, passive: true });
  return () => {
    ac.abort();
    clearTimeout(idle);
  };
}
