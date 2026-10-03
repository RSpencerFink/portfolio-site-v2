'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import s from './SkyHost.module.css';

const VIEWBOX = '0 0 1519.3 729.6';
const SESSION_KEY = 'rsf-intro';
/** T1 draws the letters in reading order (R 0–450, S 350–850, F 750–1200 ms), whatever the SVG paint order. */
const DRAW: [id: string, at: number, dur: number][] = [
  ['r', 0, 0.45],
  ['s', 0.35, 0.5],
  ['f', 0.75, 0.45],
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
    if (reduced || !paths.length) return finish();
    if (sessionStorage.getItem(SESSION_KEY)) {
      // Repeat visit in this session: no draw, the sky fades in (600 ms).
      gsap.set(all, settled);
      const t = gsap.fromTo(host, { '--sky-opacity': 0 }, { '--sky-opacity': 1, duration: 0.6, ease: 'sine.inOut' });
      return () => {
        t.kill();
        finish();
      };
    }
    sessionStorage.setItem(SESSION_KEY, '1');

    const tl = gsap.timeline();
    tl.set(host, { '--sky-opacity': 0 }).set(all, { strokeDasharray: 1, strokeDashoffset: 1, strokeOpacity: 0.9, fillOpacity: 0.07 });
    for (const [id, at, dur] of DRAW) {
      const el = svg.querySelector(`[data-letter="${id}"]`);
      if (el) tl.to(el, { strokeDashoffset: 0, duration: dur, ease: 'power3.out' }, at);
    }
    // K2: outline complete, filled with a soft halo; K3 (1400–2000): fill becomes sky.
    tl.to(all, { fillOpacity: 1, duration: 0.25, ease: 'power2.out' }, 0.95)
      .to(all, { fillOpacity: 0, strokeOpacity: 0.35, duration: 0.6, ease: 'sine.inOut' }, 1.4)
      .to(host, { '--sky-opacity': 1, duration: 0.6, ease: 'sine.inOut' }, 1.4);

    // Any scroll or key after 1400 ms jumps to the end.
    const skip = () => {
      if (tl.time() >= 1.4) tl.progress(1);
    };
    const events = ['wheel', 'keydown', 'touchstart', 'pointerdown'] as const;
    events.forEach((e) => window.addEventListener(e, skip, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, skip));
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
