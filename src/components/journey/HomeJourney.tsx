'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cameraRig, type JourneySegment } from '@/components/sky/cameraRig';
import { journeyProgress } from './progress';
import { getLenis } from './Journey';

/** Empty-sky lead-in / lead-out around the first and last dwell, in legs. */
const EDGE = 0.4;
const pad = (n: number) => String(n).padStart(2, '0');

type Cleanup = () => void;

/** Groups a stage's `[data-slide]` layers by dwell index. */
function dwellsOf(stage: HTMLElement) {
  const groups: HTMLElement[][] = [];
  stage.querySelectorAll<HTMLElement>('[data-slide]').forEach((el) => {
    (groups[Number(el.dataset.slide)] ??= []).push(el);
  });
  return groups;
}

/** Rail ticks, counter and camera target for the dwell `d`. */
function railUpdater(stage: HTMLElement) {
  const ticks = [...stage.querySelectorAll<HTMLButtonElement>('[data-dwell]')];
  const counter = stage.querySelector<HTMLElement>('[data-counter]');
  const offset = Number(stage.dataset.offset ?? 0);
  const groups = dwellsOf(stage);
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
    const target = groups[d]?.[0]?.dataset.target;
    if (target) cameraRig.setTarget(target);
  };
}

const inOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2); // power2.inOut

function scrollToY(y: number, duration = 0.9) {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y, { duration, easing: inOut });
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
    const target = near ?? ahead ?? p;
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
function hero(rangeVh: number): Cleanup {
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
    onUpdate: (self) => cameraRig.setSegment('hero', self.progress),
  });
  return snapOnEnd(st, [0, 1], [0.6, 0.6]);
}

/**
 * T3 / T4 / MO-3: pinned star-to-star stage. Per leg: content exits over the
 * first 20 %, the camera travels, the next content enters over the last 10 %.
 */
function pinnedStage(stage: HTMLElement, segment: JourneySegment, rangeVh: number): Cleanup {
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
      cameraRig.setSegment(segment, self.progress);
      update(Math.min(Math.max(Math.round(self.progress * total - EDGE), 0), legs));
    },
  });

  // Rail ticks scroll to their star (lenis.scrollTo, 900 ms, MO-3), then focus it.
  const onClick = (e: MouseEvent) => {
    const tick = (e.target as HTMLElement).closest<HTMLElement>('[data-dwell]');
    if (!tick) return;
    const d = Number(tick.dataset.dwell);
    scrollToY(st.start + ((st.end - st.start) * (EDGE + d)) / total);
    focusLater(groups[d][0]);
  };
  stage.addEventListener('click', onClick);
  const unsnap = snapOnEnd(st, [0, ...groups.map((_, d) => (EDGE + d) / total), 1], [0.5, 0.9]);
  return () => {
    stage.removeEventListener('click', onClick);
    unsnap();
  };
}

/** T17 / MO-9: no pin; each dwell is a 100svh snap slide that activates as it crosses the middle. */
function mobileStage(stage: HTMLElement, segment: JourneySegment): Cleanup {
  const groups = dwellsOf(stage);
  const update = railUpdater(stage);
  groups.forEach((els, d) =>
    els.forEach((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 60%',
        end: 'bottom 40%',
        onToggle: (self) => {
          if (self.isActive) {
            el.dataset.active = '';
            update(d);
          } else delete el.dataset.active;
        },
      }),
    ),
  );
  ScrollTrigger.create({ trigger: stage, start: 'top top', end: 'bottom bottom', onUpdate: (self) => cameraRig.setSegment(segment, self.progress) });

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
function pulls() {
  const projects = document.getElementById('projects');
  if (projects) {
    ScrollTrigger.create({ trigger: projects, start: 'top bottom', end: 'top top', onUpdate: (self) => cameraRig.setSegment('pull-1', self.progress) });
  }
  const chart = document.getElementById('chart');
  if (!chart) return;
  const tl = gsap
    .timeline({ defaults: { ease: 'none' } })
    .fromTo(chart.querySelector('[data-pole]'), { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.inOut' }, 0.1)
    .fromTo(chart.querySelectorAll('[data-cartouche]'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.08, ease: 'power3.out' }, 0.55)
    .set({}, {}, 1);
  ScrollTrigger.create({
    animation: tl,
    trigger: chart,
    start: 'top bottom',
    end: 'bottom bottom',
    scrub: 1,
    onUpdate: (self) => cameraRig.setSegment('pull-2', self.progress),
    onEnter: () => cameraRig.setTarget('overview'),
  });
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
      cleanups.push(hero(desktop ? 220 : 140));
      const ranges: Record<string, number> = { work: 500, projects: 600 };
      document.querySelectorAll<HTMLElement>('[data-stage]').forEach((stage) => {
        const id = stage.dataset.stage as 'work' | 'projects';
        cleanups.push(desktop ? pinnedStage(stage, id, ranges[id]) : mobileStage(stage, id));
      });
      pulls();

      const journey = document.getElementById('journey');
      if (journey) {
        ScrollTrigger.create({ trigger: journey, start: 'top top', end: 'bottom bottom', onUpdate: (self) => journeyProgress.set(self.progress) });
      }
      ScrollTrigger.refresh();

      return () => {
        cleanups.forEach((c) => c());
        delete root.dataset.journey;
        journeyProgress.set(0);
      };
    });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => mm.revert();
  }, []);

  return null;
}
