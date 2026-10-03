'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import s from './ArtWindow.module.css';

export interface WindowWork {
  src: string;
  name: string;
}

const LETTERS = ['R', 'S', 'F'] as const;

/** The visitor has flown through the window once on this page load: toggling segments goes straight to the works. */
let passed = false;
const FLY = 1000;

/** Three distinct works per page load and pool (Analog, Digital), drawn once so every render agrees. */
const picks = new Map<string, WindowWork[]>();
function pick(pool: WindowWork[]) {
  // Keyed by content: the pool prop is a fresh array on every RSC payload.
  const key = pool[0].src;
  let p = picks.get(key);
  if (!p) {
    const rest = [...pool];
    p = LETTERS.map(() => rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
    picks.set(key, p);
  }
  return p;
}
const noop = () => () => {};

/**
 * Visual Arts entry (Paper B1, "R2 · B1"): the RSF letterforms as a window,
 * three works showing through the R, the S and the F. One continuous CSS mask
 * (rsf-mark.svg) over a three-pane montage, no per-letter slicing.
 *
 * The works are a random three from `pool` per page load. The server HTML (no
 * JS) shows `fallback`; with JS the stage stays hidden until the client's pick
 * has loaded, so nothing swaps on screen.
 *
 * Full motion with JS: a fixed layer over the constellation that stays until
 * the visitor acts. Scrolling down, ↓ / Space / Enter, a swipe or the "Scroll
 * to enter" button carries them through the mark (it scales toward the S and
 * fades) into the constellation below. Reduced motion and no JS: the same
 * window sits, static, above the works. While the window shows, the header
 * hides its own RSF mark (one mark at a time).
 */
export function ArtWindow({ pool, fallback }: { pool: WindowWork[]; fallback: WindowWork[] }) {
  const ref = useRef<HTMLElement>(null);
  const flyRef = useRef<() => void>(null);
  const [gone, setGone] = useState(passed);
  const picked = useSyncExternalStore(noop, () => pick(pool), () => null);
  const works = picked ?? fallback;
  const [loaded, setLoaded] = useState(0);
  const onLoad = () => setLoaded((n) => n + 1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const overlay = getComputedStyle(el).position === 'fixed';

    if (!overlay) {
      // Static window (reduced motion): the header mark steps aside while it is on screen.
      const io = new IntersectionObserver(([e]) => root.toggleAttribute('data-window', e.isIntersecting));
      io.observe(el);
      return () => {
        io.disconnect();
        delete root.dataset.window;
      };
    }

    root.dataset.window = '';
    const ac = new AbortController();
    let flying = false;
    const fly = () => {
      if (flying) return;
      flying = true;
      passed = true;
      // The constellation scrolls normally from here: the window's input handlers go now.
      ac.abort();
      const mark = el.querySelector<HTMLElement>('[data-montage]')!;
      const ease = 'cubic-bezier(0.65, 0, 0.35, 1)';
      mark.animate([{ scale: 1 }, { scale: 7 }], { duration: FLY, easing: ease, fill: 'forwards' });
      el.animate([{ opacity: 1 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }], { duration: FLY, easing: ease, fill: 'forwards' }).finished.then(() => {
        delete root.dataset.window;
        setGone(true);
      });
    };
    flyRef.current = fly;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      e.stopPropagation(); // Lenis listens on window in the bubble phase
      if (e.deltaY > 0) fly();
    };
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key) && !(e.target as Element).closest?.('a, button, [role="tab"]')) {
        e.preventDefault();
        fly();
      }
    };
    let y0 = 0;
    const onTouchStart = (e: TouchEvent) => (y0 = e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      if (y0 - e.touches[0].clientY > 24) fly();
    };
    const o = { signal: ac.signal, passive: false };
    addEventListener('wheel', onWheel, { ...o, capture: true });
    addEventListener('keydown', onKey, { signal: ac.signal });
    el.addEventListener('touchstart', onTouchStart, { signal: ac.signal, passive: true });
    el.addEventListener('touchmove', onTouchMove, o);
    return () => {
      flyRef.current = null;
      ac.abort();
      delete root.dataset.window;
    };
  }, []);

  if (gone) return null;

  return (
    <section ref={ref} className={s.window} aria-label="Visual Arts" data-lenis-prevent>
      <div className={s.stage} data-ready={picked && loaded >= LETTERS.length ? '' : undefined}>
        <div className={s.montage} data-montage>
          {works.map((w, i) => (
            // A fresh image for the pick (keyed apart from the fallback), so its onLoad always fires.
            <div key={`${picked ? 'pick' : 'ssr'}:${w.src}`} className={s.pane} data-letter={LETTERS[i]}>
              <Image src={w.src} alt="" fill sizes="(max-width: 639px) 40vw, 36vw" onLoad={picked ? onLoad : undefined} onError={picked ? onLoad : undefined} />
            </div>
          ))}
        </div>
        <ul className={`label-s ${s.captions}`}>
          {works.map((w, i) => (
            <li key={w.src}>
              {LETTERS[i]} — {w.name}
            </li>
          ))}
        </ul>
      </div>
      <div className={s.foot}>
        <button type="button" className={`label ${s.hint}`} onClick={() => flyRef.current?.()}>
          Scroll to enter <span aria-hidden="true">↓</span>
        </button>
      </div>
    </section>
  );
}
