'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let lenis: Lenis | null = null;

/** The smooth-scroll instance, or null under reduced motion (native scroll). */
export const getLenis = () => lenis;

/**
 * Owns smooth scroll (Lenis, spec §7 config) for the whole site. Mounted once
 * in the root layout. Under reduced motion nothing is constructed. The home
 * page's pinned sections are built by <HomeJourney/>, which mounts with the
 * page so they rebuild after a soft navigation back to `/`.
 */
export function Journey() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const l = new Lenis({ lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.4, smoothWheel: true, syncTouch: false });
      l.on('scroll', ScrollTrigger.update);
      const tick = (t: number) => l.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      lenis = l;
      return () => {
        gsap.ticker.remove(tick);
        l.destroy();
        lenis = null;
      };
    });
    return () => mm.revert();
  }, []);

  return null;
}
