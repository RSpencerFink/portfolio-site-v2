'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { MARK_H, MARK_W, markPath, markShare } from './chart';
import s from './SkyHost.module.css';

const VIEWBOX = `0 0 ${MARK_W} ${MARK_H}`;

/*
 * The letterbox (ground with the letters cut out) and the nebula-core glow inside the letters are drawn into two
 * viewport-sized canvases at the current mask scale, in the same frame as the sky (SkyHost's onFrame). No CSS mask
 * on a layer scaled up to 6.4×: on real GPUs that layer was re-rasterised mid-scroll and shimmered.
 */
const mark: { path: Path2D | null; box: HTMLCanvasElement | null; glow: HTMLCanvasElement | null; strokes: HTMLElement | null; key: string; scale: number } = {
  path: null,
  box: null,
  glow: null,
  strokes: null,
  key: '',
  scale: 1,
};

function fit(c: HTMLCanvasElement, w: number, h: number, dpr: number) {
  const [cw, ch] = [Math.round(w * dpr), Math.round(h * dpr)];
  if (c.width !== cw || c.height !== ch) Object.assign(c, { width: cw, height: ch });
  return c.getContext('2d');
}

/** Redraw the H1 mark at `scale` (about the S centre, T2). Cheap no-op when nothing changed. */
export function drawMark(scale: number) {
  mark.scale = scale;
  const { path, box, glow, strokes } = mark;
  if (!path || !box || !glow) return;
  const [w, h, dpr] = [window.innerWidth, window.innerHeight, Math.min(window.devicePixelRatio || 1, 2)];
  const key = `${w}x${h}@${dpr}:${scale.toFixed(4)}`;
  if (key === mark.key) return;
  mark.key = key;
  // Past 2.2 the outline has faded out (.markStrokes): drop its layer.
  if (strokes) strokes.style.visibility = scale >= 2.2 ? 'hidden' : '';
  const markW = w * markShare(w / h);
  const k = markW / MARK_W;
  const [ox, oy] = [w / 2 + markW * 0.02, h / 2];
  const place = (ctx: CanvasRenderingContext2D) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);
    ctx.translate(-ox + (w - markW) / 2, -oy + (h - MARK_H * k) / 2);
    ctx.scale(k, k);
  };

  const b = fit(box, w, h, dpr);
  if (b) {
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.globalCompositeOperation = 'source-over';
    b.clearRect(0, 0, box.width, box.height);
    b.fillStyle = 'rgb(4 5 10 / 0.86)';
    b.fillRect(0, 0, box.width, box.height);
    b.globalCompositeOperation = 'destination-out';
    place(b);
    b.fill(path);
  }

  const g = fit(glow, w, h, dpr);
  if (g) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, glow.width, glow.height);
    place(g);
    g.save();
    g.clip(path);
    // ellipse 62 % × 75 % at 52 % 50 % of the mark box
    g.translate(0.52 * MARK_W, 0.5 * MARK_H);
    g.scale(0.62 * MARK_W, 0.75 * MARK_H);
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    grad.addColorStop(0, '#2e3384');
    grad.addColorStop(0.58, '#1e2260');
    grad.addColorStop(1, '#0b0d24');
    g.fillStyle = grad;
    g.fillRect(-2, -2, 4, 4);
    g.restore();
  }
}
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
 * with the mark cut out and the nebula-core gradient inside the letters (both
 * canvases, see drawMark), and the outline strokes from rsf.svg (#r #s #f) that the
 * T1 intro draws. Scale/opacity come from --mask-scale / --mask-opacity on the
 * host, written each frame from the camera rig (T2).
 */
export function HeroMark({ hostRef, reduced, markWidth }: { hostRef: RefObject<HTMLDivElement | null>; reduced: boolean; markWidth: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLCanvasElement>(null);
  const [paths, setPaths] = useState<{ id: string; d: string }[] | null>(null);

  // The filled mark for the canvases; drawn at the last known scale on load and on resize, then every frame by the sky.
  useEffect(() => {
    let live = true;
    Object.assign(mark, { box: boxRef.current, glow: glowRef.current, strokes: markRef.current, key: '' });
    const redraw = () => {
      mark.key = '';
      drawMark(mark.scale);
    };
    markPath().then((d) => {
      if (live && d) {
        mark.path = new Path2D(d);
        redraw();
      }
    });
    window.addEventListener('resize', redraw);
    return () => {
      live = false;
      window.removeEventListener('resize', redraw);
      Object.assign(mark, { box: null, glow: null, strokes: null });
    };
  }, []);

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
  const stroke = (1.5 * MARK_W) / Math.max(markWidth, 1);

  return (
    <>
      <canvas ref={boxRef} className={s.letterbox} />
      <canvas ref={glowRef} className={s.markGlow} />
      <div ref={markRef} className={s.mark}>
        <svg ref={svgRef} className={s.markStrokes} viewBox={VIEWBOX} aria-hidden="true">
          {paths?.map((p) => (
            <path key={p.id} data-letter={p.id} d={p.d} pathLength={1} fill="#FFFFFF" fillOpacity={0} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={stroke} />
          ))}
        </svg>
      </div>
    </>
  );
}
