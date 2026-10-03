'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { journeyProgress } from './progress';

/**
 * Owns smooth scroll (Lenis) and ScrollTrigger. Mounted once in the root
 * layout. Under reduced motion nothing is constructed: native scroll only.
 * The scroll track replaces the single placeholder trigger with the four
 * section pins (spec §7, T2–T6).
 */
export function Journey() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.4, smoothWheel: true, syncTouch: false });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const journey = document.getElementById('journey');
      if (journey) {
        ScrollTrigger.create({
          trigger: journey,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => journeyProgress.set(self.progress),
        });
      }

      return () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    });
    return () => mm.revert();
  }, []);

  return null;
}
