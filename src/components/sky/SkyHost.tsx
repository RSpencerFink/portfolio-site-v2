'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { cameraRig, SKY_HOOKS } from './cameraRig';
import { chartLayout, layoutFor, markShare } from './chart';
import { hoverStore } from './hover';
import { useDoor } from './Door';
import { drawMark, HeroMark, skipIntro } from './HeroMark';
import type { FrameInfo, Motion } from './Scene';
import { resetLabels, StarLabels, syncLabels } from './StarLabels';
import styles from './SkyHost.module.css';

// three + R3F (~1 MB) load after the page, in their own chunk.
const SkyCanvas = dynamic(() => import('./SkyCanvas'), { ssr: false });

const reducedQuery = '(prefers-reduced-motion: reduce)';
const useReducedMotion = () =>
  useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(reducedQuery);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia(reducedQuery).matches,
    () => false,
  );

/** Star counts per breakpoint (spec §7): 1 200 desktop, 800 tablet, 500 mobile / reduced. */
const starCount = (w: number, reduced: boolean) => (reduced || w < 640 ? 500 : w < 1024 ? 800 : 1200);

/**
 * Mounted once in the root layout, behind {children}. Decorative
 * (aria-hidden); the HTML mirror carries all content. Reads the cameraRig;
 * never listens to scroll.
 */
export function SkyHost() {
  const hostRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const reduced = useReducedMotion();
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [lowPower, setLowPower] = useState(false);
  const [visible, setVisible] = useState(true);
  const [heroGone, setHeroGone] = useState(false);
  useDoor(pathname);

  useEffect(() => {
    const read = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  // Pause when the tab is hidden or the canvas is fully offscreen.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let onscreen = true;
    const update = () => setVisible(!document.hidden && onscreen);
    const io = new IntersectionObserver(([e]) => {
      onscreen = e.isIntersecting;
      update();
    }, { threshold: 0 });
    io.observe(host);
    document.addEventListener('visibilitychange', update);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  // Low power: battery saver (< 20%, not charging). Measured fps < 45 also flips it (Scene).
  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<{ charging: boolean; level: number }> };
    nav.getBattery?.().then((b) => !b.charging && b.level < 0.2 && setLowPower(true)).catch(() => {});
  }, []);

  // Reduced motion has no pinned journey, and the mask is fixed while the hero scrolls: it gives way as soon as
  // the hero starts to leave, before the Work list reaches the letters (spec §7). A ratio, not isIntersecting:
  // a hero scrolled exactly one viewport still "intersects" at its edge.
  useEffect(() => {
    const hero = isHome && reduced ? document.querySelector('#journey > section') : null;
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setHeroGone(e.intersectionRatio < 0.9), { threshold: 0.9 });
    io.observe(hero);
    return () => io.disconnect();
  }, [isHome, reduced]);

  // Panels dim the sky (spec §3: 0.55 behind a panel). CSS transition does the easing.
  useEffect(() => {
    const apply = () => hostRef.current?.style.setProperty('--sky-dim', String(cameraRig.getState().dim));
    apply();
    return cameraRig.subscribe(apply);
  }, []);

  // Off the home route there is no intro: the sky is simply there.
  useEffect(() => {
    if (isHome) return;
    hostRef.current?.style.setProperty('--sky-opacity', '1');
    skipIntro();
  }, [isHome]);

  // Dev hook for screenshots: window.__rsfSky.setTarget('meta') etc.
  useEffect(() => {
    if (!SKY_HOOKS) return;
    const w = window as unknown as { __rsfSky?: Record<string, unknown> };
    w.__rsfSky = { ...w.__rsfSky, ...cameraRig, hover: hoverStore.set };
  }, []);

  const layout = size ? layoutFor(size.w, size.h) : 'landscape';
  const chart = chartLayout(layout);
  const motion: Motion = reduced ? 'reduced' : lowPower ? 'low' : 'full';
  const homeJourney = isHome && !(reduced && heroGone);

  const vars = useRef({ scale: '', opacity: '', glow: '' });
  const onFrame = useCallback(
    (f: FrameInfo) => {
      syncLabels(f, chart);
      const host = hostRef.current;
      if (!host) return;
      // The canvas has drawn: the journey's CSS stand-ins step aside.
      if (!document.documentElement.dataset.sky) document.documentElement.dataset.sky = 'live';
      const next = { scale: f.resolved.mask.scale.toFixed(4), opacity: f.resolved.mask.opacity.toFixed(3), glow: f.resolved.heroGlow.toFixed(3) };
      if (next.scale !== vars.current.scale) host.style.setProperty('--mask-scale', next.scale);
      if (f.resolved.mask.opacity > 0) drawMark(f.resolved.mask.scale);
      if (next.opacity !== vars.current.opacity) host.style.setProperty('--mask-opacity', next.opacity);
      if (next.glow !== vars.current.glow) host.style.setProperty('--hero-glow', next.glow);
      vars.current = next;
    },
    [chart],
  );
  useEffect(() => resetLabels(), [layout]);

  const markWidth = size ? size.w * markShare(size.w / size.h) : 1284;

  return (
    <div ref={hostRef} className={styles.host} data-home={isHome ? '' : undefined} data-calm={isHome && !homeJourney ? '' : undefined} aria-hidden="true">
      <div className={styles.sky}>
        {size && (
          <SkyCanvas
            frameloop={!visible ? 'never' : motion === 'full' ? 'always' : 'demand'}
            dpr={lowPower && size.w < 640 ? [1, 1.5] : [1, 2]}
            layout={layout}
            count={starCount(size.w, reduced)}
            motion={motion}
            isHome={homeJourney}
            onFrame={onFrame}
            onLowFps={() => setLowPower(true)}
          />
        )}
        <StarLabels key={layout} chart={chart} />
      </div>
      {isHome && <HeroMark hostRef={hostRef} reduced={reduced} markWidth={markWidth} />}
    </div>
  );
}
