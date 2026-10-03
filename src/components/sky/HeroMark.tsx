'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import s from './SkyHost.module.css';

const VIEWBOX = '0 0 1519.3 729.6';
const SESSION_KEY = 'rsf-intro';
/** Set once any intro variant has run in this page load, so soft returns to `/` (panel close) don't fade again. */
let introDone = false;
/** The sky has been shown without the intro (another route loaded first). */
export const skipIntro = () => {
  introDone = true;
};
/**
 * T1 is one continuous eased timeline (1.9 s): the letters draw in reading
 * order with overlapping strokes (R 0–0.75, S 0.3–1.1, F 0.6–1.35 s), the
 * fill swells under the last stroke, then fill and sky cross-fade (1.15–1.9 s).
 */
const DRAW: [id: string, at: number, dur: number][] = [
  ['r', 0, 0.75],
  ['s', 0.3, 0.8],
  ['f', 0.6, 0.75],
];

/**
 * H1: the sky seen through the RSF letterforms. A ground-coloured letterbox
 * with the mark cut out (CSS mask from rsf-mark.svg), the nebula-core gradient
 * inside the letters, and the outline strokes from rsf.svg (#r #s #f) that the
 * T1 intro draws. Scale/opacity come from --mask-scale / --mask-opacity on the
 * host, written each frame from the camera rig (T2).
 */
export function HeroMark({ hostRef, reduced, markWidth }: { hostRef: RefObject<HTMLDivElement | null>; reduced: boolean; markWidth: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [paths, setPaths] = useState<{ id: string; d: string }[] | null>(null);

  useEffect(() => {
    let live = true;
    fetch('/logo/rsf.svg')
      .then((r) => r.text())
      .then((text) => {
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        const list = [...doc.querySelectorAll('path')].map((p) => ({ id: p.id, d: p.getAttribute('d') ?? '' }));
        if (live) setPaths(list);
      })
      .catch(() => live && setPaths([]));
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const svg = svgRef.current;
    if (!host || !svg || !paths) return;
    const all = svg.querySelectorAll('path');
    const settled = { strokeDashoffset: 0, strokeOpacity: 0.35, fillOpacity: 0 };
    const finish = () => {
      gsap.set(all, settled);
      gsap.set(host, { '--sky-opacity': 1 });
    };
    if (introDone || reduced || !paths.length) return finish();
    // Flags are set on completion so a StrictMode effect re-run (or an interrupted intro) still plays it.
    const done = () => {
      introDone = true;
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {}
    };
    // Storage blocked: treat it as a first visit.
    let seen = false;
    try {
      seen = !!sessionStorage.getItem(SESSION_KEY);
    } catch {}
    if (seen) {
      // Repeat visit in this session: no draw, the sky fades in (600 ms).
      gsap.set(all, settled);
      const t = gsap.fromTo(host, { '--sky-opacity': 0 }, { '--sky-opacity': 1, duration: 0.6, ease: 'sine.inOut', onComplete: done });
      return () => {
        t.kill();
        finish();
      };
    }

    const tl = gsap.timeline({ onComplete: done });
    tl.set(host, { '--sky-opacity': 0 }).set(all, { strokeDasharray: 1, strokeDashoffset: 1, strokeOpacity: 0.9, fillOpacity: 0 });
    for (const [id, at, dur] of DRAW) {
      const el = svg.querySelector(`[data-letter="${id}"]`);
      if (el) tl.to(el, { strokeDashoffset: 0, duration: dur, ease: 'sine.inOut' }, at);
    }
    // The fill swells as the F completes, then hands over to the sky: one cross-fade, no snap.
    tl.to(all, { fillOpacity: 0.85, duration: 0.45, ease: 'sine.inOut' }, 0.85)
      .to(all, { fillOpacity: 0, strokeOpacity: 0.35, duration: 0.75, ease: 'sine.inOut' }, 1.15)
      .to(host, { '--sky-opacity': 1, duration: 0.75, ease: 'sine.inOut' }, 1.15);

    // Scroll, keys or a tap fast-forward the same timeline (it accelerates to ×2.5 over 300 ms): never a jump,
    // and the fill-to-sky cross-fade still gets at least 300 ms.
    let rushed = false;
    const rush = () => {
      if (rushed) return;
      rushed = true;
      gsap.to(tl, { timeScale: 2.5, duration: 0.3, ease: 'power1.in' });
    };
    const events = ['wheel', 'keydown', 'touchstart', 'pointerdown'] as const;
    events.forEach((e) => window.addEventListener(e, rush, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, rush));
      gsap.killTweensOf(tl);
      tl.kill();
      finish();
    };
  }, [paths, reduced, hostRef]);

  // Stroke width is in viewBox units; keep it 1.5 CSS px at scale 1.
  const stroke = (1.5 * 1519.3) / Math.max(markWidth, 1);

  return (
    <>
      <div className={s.letterbox} />
      <div className={s.mark}>
        <div className={s.markGlow} />
        <svg ref={svgRef} className={s.markStrokes} viewBox={VIEWBOX} aria-hidden="true">
          {paths?.map((p) => (
            <path key={p.id} data-letter={p.id} d={p.d} pathLength={1} fill="#FFFFFF" fillOpacity={0} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={stroke} />
          ))}
        </svg>
      </div>
    </>
  );
}
