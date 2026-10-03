'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { isModified } from '@/lib/events';
import { softNav } from '@/components/panels/softNav';

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

  // Native in-page anchors (the skip link, the RM sky index) push a history entry with no state.
  // Next's popstate handler ignores such entries, so a later router.back() onto one (closing a
  // panel) would change the URL without rendering the page. Carry Next's history state over.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.<HTMLAnchorElement>('a[href^="#"]');
      if (!a || e.defaultPrevented || isModified(e) || a.hash === location.hash) return;
      const state = history.state;
      addEventListener('hashchange', () => history.replaceState(state, ''), { once: true });
    };
    // Header navigation is one move (item 7): an open panel is dismissed instantly, no exit animation.
    const onHeader = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.<HTMLAnchorElement>('body > header a[href]');
      if (!a || isModified(e) || !document.documentElement.dataset.panel) return;
      softNav.dismiss();
      // Gone now, so the route change can't cross-fade it out either.
      document.querySelectorAll<HTMLElement>('dialog[open]').forEach((d) => (d.style.visibility = 'hidden'));
    };
    document.addEventListener('click', onClick);
    document.addEventListener('click', onHeader, true);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('click', onHeader, true);
    };
  }, []);

  return null;
}
