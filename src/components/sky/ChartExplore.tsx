'use client';

import { useEffect, useRef, useState } from 'react';
import { cameraRig, HOME_VIEW, type View } from './cameraRig';
import { chartLayout, easeInOut, layoutFor, overviewPose } from './chart';
import s from './SkyHost.module.css';

const MIN = 1;
const MAX = 2.5;
const DECAY = 0.94; // inertia per 60 fps frame (spec T18)
const RUBBER = 40; // px of overscroll past the bounds
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True once the home journey has handed the camera to the full chart (H3) and no panel holds it. */
const atChart = () => {
  const { segment, target } = cameraRig.getState();
  return target === null && segment.id === 'pull2' && segment.progress > 0.98;
};

/** Viewport geometry at zoom 1: world units per CSS px, and how far the view may pan at a zoom. */
function geometry() {
  const w = innerWidth;
  const h = innerHeight;
  const chart = chartLayout(layoutFor(w, h));
  const o = overviewPose(chart, w / h);
  const visH = 2 * o.pos[2] * Math.tan((o.fov * Math.PI) / 360);
  const unitsPerPx = visH / h;
  const bounds = (zoom: number) => [
    Math.max(0, (chart.plane.w - (visH * w) / h / zoom) / 2) + chart.plane.w * 0.08,
    Math.max(0, (chart.plane.h - visH / zoom) / 2) + chart.plane.h * 0.08,
  ];
  return { w, h, unitsPerPx, bounds };
}

/** Past the bounds the view gives way like a rubber band, at most RUBBER px. */
function band(v: number, bound: number, limit: number) {
  const over = Math.abs(v) - bound;
  if (over <= 0) return v;
  return Math.sign(v) * (bound + limit * Math.tanh(over / limit));
}

/**
 * T18 on H3: drag to pan, ctrl/⌘ + wheel or trackpad pinch and touch pinch to
 * zoom (1–2.5×), + / − buttons, and arrow / + / − / 0 keys while the controls
 * have focus. Inertia 0.94 and a 40 px rubber band; reduced motion drops both
 * the inertia and the 480 ms programmatic zoom. One finger on touch keeps
 * scrolling the page at 1× and pans once zoomed in.
 * ponytail: no double-tap-to-constellation zoom yet; add it with a hit test on the constellation names.
 */
export function ChartExplore() {
  const [on, setOn] = useState(false);
  const raf = useRef(0);
  const live = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    const view = () => cameraRig.getState().view;
    const stop = () => cancelAnimationFrame(raf.current);
    const set = (v: View) => cameraRig.setView(v);

    // Follow the rig: controls appear at H3; leaving it (scroll up, a panel) hands back a clean view.
    const sync = () => {
      const now = atChart();
      if (now === live.current) return;
      live.current = now;
      setOn(now);
      if (now) root.dataset.explore = '';
      else {
        delete root.dataset.explore;
        stop();
        if (view() !== HOME_VIEW) set(HOME_VIEW);
      }
    };
    sync();
    const unsub = cameraRig.subscribe(sync);

    /** Ease back inside the bounds, then carry any fling velocity (units per frame). */
    const settle = (vx = 0, vy = 0) => {
      stop();
      const g = geometry();
      const inertia = !reduced();
      const frame = () => {
        const v = view();
        const [bx, by] = g.bounds(v.zoom);
        vx = inertia ? vx * DECAY : 0;
        vy = inertia ? vy * DECAY : 0;
        let x = v.x + vx;
        let y = v.y + vy;
        const back = (p: number, b: number) => (Math.abs(p) > b ? p + (Math.sign(p) * b - p) * (inertia ? 0.2 : 1) : p);
        x = back(x, bx);
        y = back(y, by);
        set({ ...v, x, y });
        const moving = Math.abs(vx) + Math.abs(vy) > 1e-4 || Math.abs(x) > bx + 1e-3 || Math.abs(y) > by + 1e-3;
        if (moving) raf.current = requestAnimationFrame(frame);
      };
      frame();
    };

    /** Zoom to `z`, keeping the world point under client (cx, cy) fixed. */
    const zoomAt = (z: number, cx: number, cy: number, v = view()) => {
      const g = geometry();
      const zoom = clamp(z, MIN, MAX);
      const nx = cx - g.w / 2;
      const ny = g.h / 2 - cy;
      const k = g.unitsPerPx * (1 / v.zoom - 1 / zoom);
      return { x: v.x + nx * k, y: v.y + ny * k, zoom };
    };

    const pan = (v: View, dxPx: number, dyPx: number): View => {
      const g = geometry();
      const [bx, by] = g.bounds(v.zoom);
      const u = g.unitsPerPx / v.zoom;
      return { ...v, x: band(v.x - dxPx * u, bx, RUBBER * u), y: band(v.y + dyPx * u, by, RUBBER * u) };
    };

    // Mouse / pen drag anywhere on the sky (the host and #main pass the pointer through).
    let drag: { x: number; y: number; t: number; vx: number; vy: number } | null = null;
    const down = (e: PointerEvent) => {
      if (!live.current || e.pointerType === 'touch' || e.button !== 0) return;
      if ((e.target as Element).closest('a, button, input, textarea, select, summary, dialog, [role="group"]')) return;
      stop();
      e.preventDefault();
      drag = { x: e.clientX, y: e.clientY, t: e.timeStamp, vx: 0, vy: 0 };
      root.dataset.explore = 'drag';
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      const before = view();
      const next = pan(before, dx, dy);
      const dt = Math.max(1, e.timeStamp - drag.t) / 16.7;
      drag = { x: e.clientX, y: e.clientY, t: e.timeStamp, vx: (next.x - before.x) / dt, vy: (next.y - before.y) / dt };
      set(next);
    };
    const up = () => {
      if (!drag) return;
      const { vx, vy } = drag;
      drag = null;
      if (live.current) root.dataset.explore = '';
      settle(vx, vy);
    };

    // ctrl + wheel is also what a trackpad pinch sends. Plain wheel keeps scrolling the page.
    const wheel = (e: WheelEvent) => {
      if (!live.current || !(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      stop();
      set(zoomAt(view().zoom * Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY));
      settle();
    };

    // Touch: two fingers pinch and pan; one finger pans only once zoomed in (at 1× it scrolls the page).
    let touch: { d: number; mx: number; my: number; v: View } | null = null;
    let last = { x: 0, y: 0, t: 0, vx: 0, vy: 0 };
    const read = (t: TouchList) => {
      const a = t[0];
      const b = t[1] ?? a;
      return { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), mx: (a.clientX + b.clientX) / 2, my: (a.clientY + b.clientY) / 2 };
    };
    const tstart = (e: TouchEvent) => {
      if (!live.current) return;
      stop();
      touch = { ...read(e.touches), v: view() };
      last = { x: touch.mx, y: touch.my, t: e.timeStamp, vx: 0, vy: 0 };
    };
    const tmove = (e: TouchEvent) => {
      if (!touch || !live.current) return;
      const pinch = e.touches.length > 1;
      if (!pinch && view().zoom <= 1.01) return;
      e.preventDefault();
      const now = read(e.touches);
      if (pinch && touch.d > 0) {
        const z = zoomAt((touch.v.zoom * now.d) / touch.d, touch.mx, touch.my, touch.v);
        set(pan(z, now.mx - touch.mx, now.my - touch.my));
      } else {
        const before = view();
        const next = pan(before, now.mx - last.x, now.my - last.y);
        const dt = Math.max(1, e.timeStamp - last.t) / 16.7;
        last = { x: now.mx, y: now.my, t: e.timeStamp, vx: (next.x - before.x) / dt, vy: (next.y - before.y) / dt };
        set(next);
      }
    };
    const tend = (e: TouchEvent) => {
      if (!touch) return;
      if (e.touches.length) {
        touch = { ...read(e.touches), v: view() };
        last = { ...last, x: touch.mx, y: touch.my };
        return;
      }
      touch = null;
      settle(last.vx, last.vy);
      last.vx = last.vy = 0;
    };

    addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
    addEventListener('wheel', wheel, { passive: false });
    addEventListener('touchstart', tstart, { passive: true });
    addEventListener('touchmove', tmove, { passive: false });
    addEventListener('touchend', tend);
    addEventListener('touchcancel', tend);
    return () => {
      unsub();
      stop();
      removeEventListener('pointerdown', down);
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      removeEventListener('pointercancel', up);
      removeEventListener('wheel', wheel);
      removeEventListener('touchstart', tstart);
      removeEventListener('touchmove', tmove);
      removeEventListener('touchend', tend);
      removeEventListener('touchcancel', tend);
      delete root.dataset.explore;
      cameraRig.setView(HOME_VIEW);
    };
  }, []);

  /** Programmatic zoom about the centre: 480 ms in-out (T18), instant under reduced motion. */
  const zoomBy = (factor: number) => {
    cancelAnimationFrame(raf.current);
    const from = cameraRig.getState().view;
    const to = clamp(from.zoom * factor, MIN, MAX);
    const g = geometry();
    const [bx, by] = g.bounds(to);
    // factor 0 (the 0 key) resets the view.
    const end = factor === 0 ? HOME_VIEW : { zoom: to, x: clamp(from.x, -bx, bx), y: clamp(from.y, -by, by) };
    if (reduced()) return cameraRig.setView(end);
    const t0 = performance.now();
    const frame = (t: number) => {
      const k = easeInOut(clamp((t - t0) / 480, 0, 1));
      cameraRig.setView({ zoom: from.zoom + (end.zoom - from.zoom) * k, x: from.x + (end.x - from.x) * k, y: from.y + (end.y - from.y) * k });
      if (k < 1) raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
  };

  const panBy = (fx: number, fy: number) => {
    const v = cameraRig.getState().view;
    const g = geometry();
    const [bx, by] = g.bounds(v.zoom);
    const step = (g.unitsPerPx * g.h * 0.12) / v.zoom;
    cameraRig.setView({ ...v, x: clamp(v.x + fx * step, -bx, bx), y: clamp(v.y + fy * step, -by, by) });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const act: Record<string, () => void> = {
      '+': () => zoomBy(1.25),
      '=': () => zoomBy(1.25),
      '-': () => zoomBy(0.8),
      _: () => zoomBy(0.8),
      '0': () => zoomBy(0),
      ArrowLeft: () => panBy(-1, 0),
      ArrowRight: () => panBy(1, 0),
      ArrowUp: () => panBy(0, 1),
      ArrowDown: () => panBy(0, -1),
    };
    if (!act[e.key] || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    act[e.key]();
  };

  return (
    <div className={s.explore} data-on={on || undefined} role="group" aria-label="Sky chart view" aria-describedby="explore-keys" onKeyDown={onKeyDown}>
      <p id="explore-keys" className="visually-hidden">
        Arrow keys pan the chart, plus and minus zoom, 0 resets.
      </p>
      <div className={s.zoom}>
        <button type="button" className="label" aria-label="Zoom in" onClick={() => zoomBy(1.25)}>
          +
        </button>
        <button type="button" className="label" aria-label="Zoom out" onClick={() => zoomBy(0.8)}>
          −
        </button>
      </div>
      <p className="label" aria-hidden="true">
        <span className={s.fine}>Drag to explore · Click a star</span>
        <span className={s.coarse}>Pinch · Drag · Tap a star</span>
      </p>
    </div>
  );
}
