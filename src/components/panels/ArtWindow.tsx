'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { VisualArtsToggle } from './VisualArtsToggle';
import s from './ArtWindow.module.css';

export interface WindowPane {
  letter: 'R' | 'S' | 'F';
  src: string;
  name: string;
}

/** The visitor has flown through the window once on this page load: toggling segments goes straight to the works. */
let passed = false;
const DWELL = 1500;
const FLY = 1000;

/**
 * Visual Arts entry (Paper B1, "R2 · B1"): the RSF letterforms as a window,
 * three works showing through the R, the S and the F. One continuous CSS mask
 * (rsf-mark.svg) over a three-pane montage, no per-letter slicing.
 *
 * Full motion with JS: a fixed layer over the constellation. Scrolling down,
 * ↓ / Space / Enter, a swipe, or a 1.5 s dwell carries the visitor through
 * the mark (it scales toward the S and fades) into the constellation below.
 * Reduced motion and no JS: the same window sits, static, above the works.
 * While the window shows, the header hides its own RSF mark (one mark at a time).
 */
export function ArtWindow({ panes, current }: { panes: WindowPane[]; current: 'analog' | 'digital' }) {
  const ref = useRef<HTMLElement>(null);
  const [gone, setGone] = useState(passed);

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
    const timer = window.setTimeout(fly, DWELL);
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
      clearTimeout(timer);
      ac.abort();
      delete root.dataset.window;
    };
  }, []);

  if (gone) return null;

  return (
    <section ref={ref} className={s.window} aria-label="Visual Arts" data-lenis-prevent>
      <div className={s.stage}>
        <div className={s.montage} data-montage>
          {panes.map((p) => (
            <div key={p.letter} className={s.pane} data-letter={p.letter}>
              <Image src={p.src} alt="" fill sizes="(max-width: 639px) 40vw, 36vw" priority />
            </div>
          ))}
        </div>
        <ul className={`label-s ${s.captions}`}>
          {panes.map((p) => (
            <li key={p.letter} data-letter={p.letter}>
              {p.letter} — {p.name}
            </li>
          ))}
        </ul>
      </div>
      <div className={s.foot}>
        <VisualArtsToggle current={current} transitionName={false} />
        <p className={`label ${s.hint}`} aria-hidden="true">
          Scroll to enter ↓
        </p>
      </div>
    </section>
  );
}
