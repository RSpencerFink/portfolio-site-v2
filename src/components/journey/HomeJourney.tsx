'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cameraRig, type Segment } from '@/components/sky/cameraRig';
import { journeyProgress } from './progress';
import { getLenis } from './Journey';

/** Empty-sky lead-in / lead-out around the first and last dwell, in legs. */
const EDGE = 0.4;
const pad = (n: number) => String(n).padStart(2, '0');

type Cleanup = () => void;

/**
 * The camera follows one segment at a time. Each segment maps a scroll
 * position to its local 0–1 progress; on every tick HomeJourney picks the
 * segment the scroll is in and hands it to cameraRig.setSegment, so there is
 * a single writer even when a jump crosses several triggers at once.
 */
type CameraSegment = { id: Segment; st: ScrollTrigger; t: (y: number) => number };
const local = (st: ScrollTrigger, y: number) => gsap.utils.clamp(0, 1, (y - st.start) / Math.max(1, st.end - st.start));

/** Groups a stage's `[data-slide]` layers by dwell index. */
function dwellsOf(stage: HTMLElement) {
  const groups: HTMLElement[][] = [];
  stage.querySelectorAll<HTMLElement>('[data-slide]').forEach((el) => {
    (groups[Number(el.dataset.slide)] ??= []).push(el);
  });
  return groups;
}

/** Rail ticks and counter for the dwell `d`. The camera follows the segment progress. */
function railUpdater(stage: HTMLElement) {
  const ticks = [...stage.querySelectorAll<HTMLButtonElement>('[data-dwell]')];
  const counter = stage.querySelector<HTMLElement>('[data-counter]');
  const offset = Number(stage.dataset.offset ?? 0);
  let current = -1;
  return (d: number) => {
    if (d === current) return;
    current = d;
    // Title / "constellation complete" dwells have no tick: the rail keeps its last star.
    const star = d - offset;
    if (ticks[star]) {
      ticks.forEach((t, i) => (i === star ? t.setAttribute('aria-current', 'step') : t.removeAttribute('aria-current')));
      if (counter) counter.textContent = `${pad(star + 1)} / ${pad(ticks.length)}`;
    }
  };
}

const inOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2); // power2.inOut

/** Scrolls through Lenis so it never fights an in-flight snap; duration 0 jumps. */
function scrollToY(y: number, duration = 0.9) {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y, duration ? { duration, easing: inOut } : { immediate: true, force: true });
  else window.scrollTo(0, y);
}

/**
 * Directional snap (spec T2/T3: a release mid-travel finishes the trip), run
 * through Lenis on scroll end. ScrollTrigger's built-in `snap` fights Lenis'
 * smoothing and settled short of the dwell in testing.
 */
function snapOnEnd(st: ScrollTrigger, points: number[], durations: [number, number]): Cleanup {
  const onEnd = () => {
    if (!st.isActive) return;
    const p = st.progress;
    const near = points.find((x) => Math.abs(x - p) < 0.01);
    const ahead = st.direction > 0 ? points.find((x) => x >= p) : points.findLast((x) => x <= p);
    const target = near ?? ahead;
    if (target === undefined) return; // heading out of the pin: let the visitor leave
    const y = st.start + (st.end - st.start) * target;
    const dist = Math.abs(y - window.scrollY);
    if (dist > 2) scrollToY(y, gsap.utils.clamp(durations[0], durations[1], dist / window.innerHeight));
  };
  ScrollTrigger.addEventListener('scrollEnd', onEnd);
  return () => ScrollTrigger.removeEventListener('scrollEnd', onEnd);
}

/** Moves focus to a dwell once the scrub has made it visible. */
const focusLater = (el: HTMLElement | undefined) => gsap.delayedCall(1, () => el?.focus({ preventScroll: true }));

/** T2 / MO-2: pinned hero, mask scales toward the S and dissolves. Times are in vh of the desktop range. */
function hero(rangeVh: number, segs: CameraSegment[]): Cleanup {
  const el = document.getElementById('hero');
  if (!el) return () => {};
  const mask = el.querySelectorAll('[data-mask]');
  const fade = el.querySelectorAll('[data-hero-fade]');
  const tl = gsap
    .timeline({ defaults: { ease: 'none' } })
    .to(mask, { scale: 2.2, duration: 60, ease: 'power2.inOut' }, 0)
    .to(fade, { autoAlpha: 0, duration: 60 }, 0)
    .to(mask, { scale: 6.4, duration: 80, ease: 'power2.inOut' }, 60)
    .to(mask, { autoAlpha: 0, duration: 33 }, 187);
  const st = ScrollTrigger.create({
    animation: tl,
    trigger: el,
    pin: true,
    start: 'top top',
    end: () => `+=${(window.innerHeight * rangeVh) / 100}`,
    scrub: 0.6,
    invalidateOnRefresh: true,
  });
  segs.push({ id: 'hero', st, t: (y) => local(st, y) });
  return snapOnEnd(st, [0, 1], [0.6, 0.6]);
}

/**
 * T3 / T4 / MO-3: pinned star-to-star stage. Per leg: content exits over the
 * first 20 %, the camera travels, the next content enters over the last 10 %.
 */
function pinnedStage(stage: HTMLElement, segment: Segment, rangeVh: number, firstDwell: Map<string, () => number>, segs: CameraSegment[]): Cleanup {
  const groups = dwellsOf(stage);
  const legs = groups.length - 1;
  const total = legs + 2 * EDGE;
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  groups.forEach((els, d) => {
    const at = EDGE + d;
    // A small plateau either side of the dwell so a near-miss still reads.
    tl.fromTo(els, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.1, ease: 'power3.out' }, at - 0.12);
    tl.fromTo(els, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -24, duration: 0.2, ease: 'power1.in', immediateRender: false }, at + 0.02);
  });
  tl.set({}, {}, total);

  const update = railUpdater(stage);
  const st = ScrollTrigger.create({
    animation: tl,
    trigger: stage,
    pin: true,
    start: 'top top',
    end: () => `+=${(window.innerHeight * rangeVh) / 100}`,
    scrub: 0.8,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      update(Math.min(Math.max(Math.round(self.progress * total - EDGE), 0), legs));
    },
    // The rail is the stage's keyboard control while it is pinned. Once the pin has passed it is
    // hidden (Journey.module.css), so Tab from the chart can't land on it and scroll back up.
    onToggle: (self) => stage.toggleAttribute('data-live', self.isActive),
  });

  // Camera: 0 at the first dwell, 1 at the last (the empty lead-in/out holds the end stars).
  segs.push({ id: segment, st, t: (y) => gsap.utils.clamp(0, 1, (local(st, y) * total - EDGE) / legs) });

  // Rail ticks scroll to their star (lenis.scrollTo, 900 ms, MO-3), then focus it.
  const onClick = (e: MouseEvent) => {
    const tick = (e.target as HTMLElement).closest<HTMLElement>('[data-dwell]');
    if (!tick) return;
    const d = Number(tick.dataset.dwell);
    scrollToY(st.start + ((st.end - st.start) * (EDGE + d)) / total);
    focusLater(groups[d][0]);
  };
  stage.addEventListener('click', onClick);
  // Dwells only: a stop in the empty lead-in (e.g. after a /#work jump) resolves to the first star.
  const unsnap = snapOnEnd(st, groups.map((_, d) => (EDGE + d) / total), [0.5, 0.9]);
  firstDwell.set(segment, () => st.start + ((st.end - st.start) * EDGE) / total);
  return () => {
    stage.removeEventListener('click', onClick);
    stage.removeAttribute('data-live');
    unsnap();
  };
}

/** T17 / MO-9: no pin; each dwell is a 100svh snap slide that activates as it crosses the middle. */
function mobileStage(stage: HTMLElement, segment: Segment, segs: CameraSegment[]): Cleanup {
  const groups = dwellsOf(stage);
  const update = railUpdater(stage);
  // The camera moves to a dwell as its slide activates (its text enters at the same moment).
  let active = 0;
  groups.forEach((els, d) =>
    els.forEach((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 60%',
        end: 'bottom 40%',
        onToggle: (self) => {
          if (self.isActive) {
            el.dataset.active = '';
            active = d;
            update(d);
          } else delete el.dataset.active;
        },
      }),
    ),
  );
  const st = ScrollTrigger.create({ trigger: stage, start: 'top 60%', end: 'bottom 40%' });
  segs.push({ id: segment, st, t: () => active / Math.max(1, groups.length - 1) });

  const onClick = (e: MouseEvent) => {
    const tick = (e.target as HTMLElement).closest<HTMLElement>('[data-dwell]');
    if (!tick) return;
    const el = groups[Number(tick.dataset.dwell)][0];
    scrollToY(el.getBoundingClientRect().top + window.scrollY);
    focusLater(el);
  };
  stage.addEventListener('click', onClick);
  return () => {
    stage.removeEventListener('click', onClick);
    stage.querySelectorAll<HTMLElement>('[data-active]').forEach((el) => delete el.dataset.active);
  };
}

/** T5 / T6: the unpinned stretches between pins, plus the cartouche rise at the hand-off to H3. */
function pulls(segs: CameraSegment[]) {
  const projects = document.getElementById('projects');
  if (projects) {
    const st = ScrollTrigger.create({ trigger: projects, start: 'top bottom', end: 'top top' });
    // Inserted before the projects stage so segments stay in scroll order.
    segs.splice(segs.findIndex((s) => s.id === 'projects'), 0, { id: 'pull1', st, t: (y) => local(st, y) });
  }
  const chart = document.getElementById('chart');
  if (!chart) return;
  const tl = gsap
    .timeline({ defaults: { ease: 'none' } })
    .fromTo(chart.querySelector('[data-pole]'), { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.inOut' }, 0.1)
    .fromTo(chart.querySelectorAll('[data-cartouche]'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.08, ease: 'power3.out' }, 0.55)
    .set({}, {}, 1);
  const st = ScrollTrigger.create({ animation: tl, trigger: chart, start: 'top bottom', end: 'bottom bottom', scrub: 1 });
  segs.push({ id: 'pull2', st, t: (y) => local(st, y) });
}

/**
 * Builds the home journey's ScrollTriggers (spec §7 T2–T6, T17). Mounted by
 * the home page so it rebuilds after soft navigation. Nothing is built under
 * reduced motion: the static R3 · RM layout stays.
 */
export function HomeJourney() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = document.documentElement;
    const mm = gsap.matchMedia();
    mm.add({ full: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 769px)' }, (ctx) => {
      const { full, desktop } = ctx.conditions as { full: boolean; desktop: boolean };
      if (!full) return;
      root.dataset.journey = desktop ? 'pinned' : 'mobile';

      const cleanups: Cleanup[] = [];
      const segs: CameraSegment[] = [];
      cleanups.push(hero(desktop ? 220 : 140, segs));
      const ranges: Record<string, number> = { work: 500, projects: 600 };
      const firstDwell = new Map<string, () => number>();
      document.querySelectorAll<HTMLElement>('#journey [data-stage]').forEach((stage) => {
        const id = stage.dataset.stage as 'work' | 'projects';
        cleanups.push(desktop ? pinnedStage(stage, id, ranges[id], firstDwell, segs) : mobileStage(stage, id, segs));
      });
      pulls(segs);

      // Runs after Lenis + ScrollTrigger on every GSAP tick; setSegment ignores unchanged values.
      const follow = () => {
        const y = window.scrollY;
        const seg = segs.findLast((s) => s.st.start <= y) ?? segs[0];
        if (!seg) return;
        const t = seg.t(y);
        cameraRig.setSegment(seg.id, t);
        // Header (SiteChrome): centred menu on H1, gone while the mask flies (0–60 vh), full HUD from 130 vh (T1/T2).
        const chrome = seg.id !== 'hero' || t > 0.6 ? 'full' : t > 0.27 ? 'fly' : 'hero';
        if (root.dataset.chrome !== chrome) root.dataset.chrome = chrome;
      };
      gsap.ticker.add(follow);
      cleanups.push(() => gsap.ticker.remove(follow));

      const journey = document.getElementById('journey');
      if (journey) {
        ScrollTrigger.create({ trigger: journey, start: 'top top', end: 'bottom bottom', onUpdate: (self) => journeyProgress.set(self.progress) });
      }
      ScrollTrigger.refresh();

      // /#work and /#projects land on the first star, not the pin start (an empty lead-in).
      const toHash = (hash: string, smooth: boolean) => {
        const y = firstDwell.get(hash.slice(1))?.();
        if (y === undefined) return false;
        scrollToY(y, smooth ? 0.9 : 0);
        return true;
      };
      const onClick = (e: MouseEvent) => {
        const a = (e.target as HTMLElement).closest('a');
        if (!a || a.origin !== location.origin || a.pathname !== location.pathname) return;
        if (!toHash(a.hash, true)) return;
        e.preventDefault(); // also stops next/link's own hash scroll
        history.pushState(null, '', a.hash);
      };
      document.addEventListener('click', onClick, true);
      cleanups.push(() => document.removeEventListener('click', onClick, true));
      // Arriving with a hash (direct load or from another page): let the browser/Next jump to the
      // anchor first, then correct it. Listeners added after the snaps run last and win.
      if (location.hash) {
        const fix = () => toHash(location.hash, false);
        const call = gsap.delayedCall(0.3, fix);
        ScrollTrigger.addEventListener('scrollEnd', fix);
        const stop = gsap.delayedCall(2, () => ScrollTrigger.removeEventListener('scrollEnd', fix));
        cleanups.push(() => {
          call.kill();
          stop.kill();
          ScrollTrigger.removeEventListener('scrollEnd', fix);
        });
      }

      return () => {
        cleanups.forEach((c) => c());
        delete root.dataset.journey;
        delete root.dataset.chrome;
        journeyProgress.set(0);
        cameraRig.setSegment('hero', 0);
      };
    });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => mm.revert();
  }, []);

  return null;
}
