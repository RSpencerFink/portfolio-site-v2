'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cameraRig, type Segment } from '@/components/sky/cameraRig';
import { journeyProgress } from './progress';
import { getLenis } from './Journey';
import { goTo, stepper } from './stepper';
import { pad } from '@/lib/format';
import { isModified } from '@/lib/events';

/** Empty-sky lead-in / lead-out around the first and last dwell, in legs. */
const EDGE = 0.4;

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
  let current = -1;
  return (d: number) => {
    if (d === current) return;
    current = d;
    // The "constellation complete" dwell has no tick: the rail keeps its last star.
    if (ticks[d]) {
      ticks.forEach((t, i) => (i === d ? t.setAttribute('aria-current', 'step') : t.removeAttribute('aria-current')));
      if (counter) counter.textContent = `${pad(d + 1)} / ${pad(ticks.length)}`;
    }
  };
}

/** Directional snap at the hero's ends (T2: a release mid-fly finishes the trip). */
function snapOnEnd(st: ScrollTrigger, points: number[]): Cleanup {
  const onEnd = () => {
    if (!st.isActive) return;
    const p = st.progress;
    const near = points.find((x) => Math.abs(x - p) < 0.01);
    const target = near ?? (st.direction > 0 ? points.find((x) => x >= p) : points.findLast((x) => x <= p));
    if (target === undefined) return;
    const y = st.start + (st.end - st.start) * target;
    if (Math.abs(y - window.scrollY) > 2) goTo(y, 0.6);
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
  const fade = el.querySelectorAll('[data-hero-fade]');
  // Opacity only (no visibility flips): the hint and the hidden name fade as the mask flies in.
  const tl = gsap.timeline({ defaults: { ease: 'none' } }).to(fade, { opacity: 0, duration: 60 }, 0).set({}, {}, rangeVh);
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
  return snapOnEnd(st, [0, 1]);
}

/**
 * T3 / T4 / MO-3: pinned star-to-star stage. Per leg: content exits over the
 * first 20 %, the camera travels, the next content enters over the last 10 %.
 * Returns the scroll position of each dwell: the stepper's stops.
 */
function pinnedStage(stage: HTMLElement, segment: Segment, rangeVh: number, segs: CameraSegment[], cleanups: Cleanup[]) {
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
    scrub: 0.3,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      update(Math.min(Math.max(Math.round(self.progress * total - EDGE), 0), legs));
    },
    // The rail is the stage's keyboard control while it is pinned. Once the pin has passed it is
    // hidden (Journey.module.css), so Tab from the chart can't land on it and scroll back up.
    onToggle: (self) => stage.toggleAttribute('data-live', self.isActive),
  });

  // Camera: 0 at the first dwell, 1 at the last (the empty lead-in/out holds the end stars). One dwell: always 0.
  segs.push({ id: segment, st, t: (y) => (legs ? gsap.utils.clamp(0, 1, (local(st, y) * total - EDGE) / legs) : 0) });
  const stops = () => groups.map((_, d) => st.start + ((st.end - st.start) * (EDGE + d)) / total);

  // Rail ticks travel to their star (one stop's flight, MO-3), then focus it.
  const onClick = (e: MouseEvent) => {
    const tick = (e.target as HTMLElement).closest<HTMLElement>('[data-dwell]');
    if (!tick) return;
    const d = Number(tick.dataset.dwell);
    goTo(stops()[d]);
    focusLater(groups[d][0]);
  };
  stage.addEventListener('click', onClick);
  cleanups.push(() => {
    stage.removeEventListener('click', onClick);
    stage.removeAttribute('data-live');
  });
  return stops;
}

/**
 * T17 / MO-9: no pin, no stepper. Each dwell is a section in normal document flow (native touch scroll and
 * momentum); the one under the 35 % line is current. The camera eases to its star (0.9 s along the travel
 * path) and the rail follows as a passive indicator.
 */
function mobileStage(stage: HTMLElement, segment: Segment, segs: CameraSegment[], cleanups: Cleanup[]) {
  const groups = dwellsOf(stage);
  const update = railUpdater(stage);
  const last = Math.max(1, groups.length - 1);
  const cam = { t: 0 };
  groups.forEach((els, d) =>
    els.forEach((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 35%',
        end: 'bottom 35%',
        onToggle: (self) => {
          if (!self.isActive) return;
          update(d);
          gsap.to(cam, { t: d / last, duration: 0.9, ease: 'power2.inOut', overwrite: true });
        },
      }),
    ),
  );
  const st = ScrollTrigger.create({ trigger: stage, start: 'top 60%', end: 'bottom 40%' });
  segs.push({ id: segment, st, t: () => cam.t });
  // The rail shows while a job is current, so it fades before The Engineer and never rides up with the stage's end.
  const slides = stage.querySelector('ol');
  if (slides) ScrollTrigger.create({ trigger: slides, start: 'top 35%', end: 'bottom 35%', onToggle: (self) => stage.toggleAttribute('data-live', self.isActive) });
  const top = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;
  const stops = () => groups.map((els) => top(els[0]));

  // Rail ticks scroll to their section (the camera follows the scroll), then focus it.
  const onClick = (e: MouseEvent) => {
    const tick = (e.target as HTMLElement).closest<HTMLElement>('[data-dwell]');
    if (!tick) return;
    const el = groups[Number(tick.dataset.dwell)][0];
    goTo(top(el));
    focusLater(el);
  };
  stage.addEventListener('click', onClick);
  cleanups.push(() => {
    stage.removeEventListener('click', onClick);
    stage.removeAttribute('data-live');
    gsap.killTweensOf(cam);
  });
  return stops;
}

/**
 * Phones: the sky is fixed and the text scrolls over it. While any stop's text is in the band of sky above the
 * 35 % line (where the camera puts the star), `<html data-reading>` is set and the sky drops its reticle
 * (SkyHost.module.css), so nothing of the sky's own marks ever sits on the words.
 */
function readingBand(): Cleanup {
  const root = document.documentElement;
  const over = new Set<Element>();
  document.querySelectorAll('#journey [data-stage] [data-slide] > :not([aria-hidden])').forEach((el) =>
    ScrollTrigger.create({
      trigger: el,
      start: 'top 35%',
      end: 'bottom top',
      onToggle: (self) => {
        if (self.isActive) over.add(el);
        else over.delete(el);
        root.toggleAttribute('data-reading', over.size > 0);
      },
    }),
  );
  return () => root.removeAttribute('data-reading');
}

/** A long stop's text column: marks whether there is more above (`data-scrolled`) and below (`data-more`, "More ↓"). */
function columnEdges(): Cleanup {
  const els = [...document.querySelectorAll<HTMLElement>('#journey [data-scroll]')];
  const mark = (el: HTMLElement) => {
    el.toggleAttribute('data-scrolled', el.scrollTop > 2);
    el.toggleAttribute('data-more', el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  };
  const onScroll = (e: Event) => mark(e.currentTarget as HTMLElement);
  // The column and its text: a resize or the web fonts change how much there is to read.
  const ro = new ResizeObserver((entries) => entries.forEach((e) => mark(e.target.closest<HTMLElement>('[data-scroll]')!)));
  els.forEach((el) => {
    el.addEventListener('scroll', onScroll, { passive: true });
    [el, ...el.children].forEach((c) => ro.observe(c));
  });
  return () => {
    ro.disconnect();
    els.forEach((el) => {
      el.removeEventListener('scroll', onScroll);
      el.removeAttribute('data-scrolled');
      el.removeAttribute('data-more');
    });
  };
}

/** T5 / T6: the unpinned stretches between pins, plus the pole mark's rise at the hand-off to H3. */
function pulls(segs: CameraSegment[]) {
  const projects = document.getElementById('projects');
  if (projects) {
    const st = ScrollTrigger.create({ trigger: projects, start: 'top bottom', end: 'top top' });
    // Inserted before the projects stage so segments stay in scroll order.
    segs.splice(segs.findIndex((s) => s.id === 'projects'), 0, { id: 'pull1', st, t: (y) => local(st, y) });
  }
  const chart = document.getElementById('chart');
  if (!chart) return;
  const st = ScrollTrigger.create({ trigger: chart, start: 'top bottom', end: 'bottom bottom' });
  segs.push({ id: 'pull2', st, t: (y) => local(st, y) });
}

/**
 * Builds the home journey's ScrollTriggers (spec §7 T2–T6, T17) and, on
 * desktop, the one-gesture-one-stop stepper over the Work stops and the featured build.
 * Mounted by the home page so it rebuilds after soft navigation. Nothing is
 * built under reduced motion: the static R3 · RM layout stays.
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
      const ranges: Record<string, number> = { work: 500, projects: 100 };
      const stageStops: Record<string, () => number[]> = {};
      document.querySelectorAll<HTMLElement>('#journey [data-stage]').forEach((stage) => {
        const id = stage.dataset.stage as 'work' | 'projects';
        stageStops[id] = desktop ? pinnedStage(stage, id, ranges[id], segs, cleanups) : mobileStage(stage, id, segs, cleanups);
      });
      pulls(segs);
      const stops = () => [...(stageStops.work?.() ?? []), ...(stageStops.projects?.() ?? [])].sort((a, b) => a - b);
      // Desktop: one gesture = one stop, long stops scroll their column. Phones scroll natively.
      if (desktop) cleanups.push(stepper(stops), columnEdges());
      else cleanups.push(readingBand());

      // Hash targets: /#work the first Work stop (Brava), /#projects the featured build,
      // /#chart (a direct-loaded panel's Close) the H3 rest at the end of the document.
      const hashY: Record<string, () => number | undefined> = {
        // The first star, wherever the "The Engineer" layer sits in the layout.
        work: () => (stageStops.work ? Math.min(...stageStops.work()) : undefined),
        projects: () => stageStops.projects?.()[0],
        chart: () => ScrollTrigger.maxScroll(window),
      };

      // Runs after Lenis + ScrollTrigger on every GSAP tick; setSegment ignores unchanged values.
      const follow = () => {
        const y = window.scrollY;
        const seg = segs.findLast((s) => s.st.start <= y) ?? segs[0];
        if (!seg) return;
        const t = seg.t(y);
        cameraRig.setSegment(seg.id, t);
        // Header (SiteChrome): centred menu on H1, gone while the mask flies (0–60 vh), full HUD from 130 vh (T1/T2).
        // Hysteresis: a state is kept until the scroll is 0.02 below its threshold, so a rest on one never flips the header.
        const was = root.dataset.chrome;
        const at = (edge: number, ...states: string[]) => t > edge - (states.includes(was ?? '') ? 0.02 : 0);
        const chrome = seg.id !== 'hero' || at(0.6, 'full') ? 'full' : at(0.27, 'fly', 'full') ? 'fly' : 'hero';
        if (was !== chrome) root.dataset.chrome = chrome;
      };
      gsap.ticker.add(follow);
      cleanups.push(() => gsap.ticker.remove(follow));

      const journey = document.getElementById('journey');
      if (journey) {
        ScrollTrigger.create({ trigger: journey, start: 'top top', end: 'bottom bottom', onUpdate: (self) => journeyProgress.set(self.progress) });
      }
      ScrollTrigger.refresh();

      // One move (item 7): the page jumps to the stop and the camera flies there from wherever it was.
      const toHash = (hash: string) => {
        const y = hashY[hash.slice(1)]?.();
        if (y === undefined) return false;
        // Arriving from a short page (a panel's Close): Lenis' debounced limit may still be that page's height.
        getLenis()?.resize();
        goTo(y, 0);
        follow();
        return true;
      };
      const onClick = (e: MouseEvent) => {
        const a = (e.target as HTMLElement).closest('a');
        if (!a || isModified(e) || a.origin !== location.origin || a.pathname !== location.pathname) return;
        if (!toHash(a.hash)) return;
        e.preventDefault(); // also stops next/link's own hash scroll
        history.pushState(history.state, '', a.hash);
      };
      document.addEventListener('click', onClick, true);
      cleanups.push(() => document.removeEventListener('click', onClick, true));
      // Same-page hash changes not made by a link click (address bar, history): land on the stop too.
      const onHash = () => void toHash(location.hash);
      addEventListener('hashchange', onHash);
      cleanups.push(() => removeEventListener('hashchange', onHash));
      // Arriving with a hash (direct load, header link from another page): land on the stop now,
      // before the first paint of the journey. For 2 s, re-land if the browser's anchor scroll or a
      // ScrollTrigger refresh (web fonts) moves the page or the stop.
      if (location.hash && toHash(location.hash)) {
        const fix = () => {
          const y = hashY[location.hash.slice(1)]?.();
          if (y !== undefined && Math.abs(window.scrollY - y) > 2) toHash(location.hash);
        };
        const call = gsap.delayedCall(0.05, fix);
        ScrollTrigger.addEventListener('refresh', fix);
        ScrollTrigger.addEventListener('scrollEnd', fix);
        const stop = () => {
          ScrollTrigger.removeEventListener('refresh', fix);
          ScrollTrigger.removeEventListener('scrollEnd', fix);
        };
        // Any input of the visitor's own ends the correction window early.
        addEventListener('wheel', stop, { once: true, passive: true });
        addEventListener('touchstart', stop, { once: true, passive: true });
        addEventListener('keydown', stop, { once: true });
        const end = gsap.delayedCall(2, stop);
        cleanups.push(() => {
          call.kill();
          end.kill();
          stop();
          removeEventListener('wheel', stop);
          removeEventListener('touchstart', stop);
          removeEventListener('keydown', stop);
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
