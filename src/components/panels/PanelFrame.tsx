'use client';

import { createContext, use, useEffect, useLayoutEffect, useRef, useState, ViewTransition, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cameraRig } from '@/components/sky/cameraRig';
import { softNav, useArrivedFromSky } from './softNav';
import styles from './PanelFrame.module.css';
import './transitions.css';

export interface StepItem {
  href: string;
  name: string;
}

interface Props {
  /** Star id (entity slug, or "observer"); the header dot carries view-transition-name `star-${slug}`. */
  slug: string;
  title: string;
  /** Breadcrumb, e.g. "Star 03 / Constellation of Work". */
  kicker: string;
  /** Insignia or headshot beside the title. */
  lead?: ReactNode;
  /** Line under the title (identities, role). */
  subline?: ReactNode;
  prev?: StepItem;
  next?: StepItem;
  /** Footer centre, e.g. "03 / 05". */
  counter?: string;
  /** Accessible name of the prev/next footer. */
  stepLabel?: string;
  /** `cinema` (films): 1208 px wide, full height on mobile, the page renders its own h1 with id `${slug}-title`. */
  variant?: 'panel' | 'cinema';
  children: ReactNode;
}

const titleId = (slug: string) => `${slug}-title`;

const PanelMode = createContext(false);
/** Which footer link to focus after a step lands (the new panel is a fresh mount). */
let stepFocus: string | null = null;
const MOBILE = '(max-width: 639px)';

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The panel's own exit (T8): slide 24 px right (mobile: down), fade; 200 ms crossfade under reduced motion. */
function slideOut(el: HTMLElement, detached = false) {
  if (detached) {
    // A copy of a panel React has already removed: inert, no duplicate ids, removed when done.
    el.inert = true;
    el.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    el.querySelectorAll('iframe, video').forEach((n) => n.remove()); // no second Vimeo player
    el.removeAttribute('aria-labelledby');
    document.body.append(el);
  }
  const reduce = reduceMotion();
  const to = reduce ? '0 0' : matchMedia(MOBILE).matches ? '0 100%' : '24px 0';
  const out = el.animate([{}, { opacity: 0, translate: to }], { duration: reduce ? 200 : 240, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' });
  return out.finished.finally(() => detached && el.remove());
}

const named = (el: HTMLElement | null | undefined, name: string, cls: string) => {
  if (!el) return;
  el.style.viewTransitionName = name;
  el.style.setProperty('view-transition-class', cls);
};

/**
 * Close as a view transition (T8, the reverse of T7). React's <ViewTransition> only animates
 * updates it runs in startTransition, and a history traversal is committed synchronously in
 * popstate, so this names the elements by hand: the panel exits as `star-panel` (vt-panel slide)
 * and the header dot pairs with the star's sky marker (or the work card) as `star-<slug>` (vt-morph). The update
 * callback resolves once React has committed the page under the panel (popstate) and its marker
 * exists; the sky positions the marker in the frame the new snapshot is taken.
 */
function morphBack(dialog: HTMLDialogElement, slug: string, path: string, back: () => void) {
  named(dialog, 'star-panel', 'vt-panel');
  // The page underneath is not cross-faded (transitions.css): the live sky dollies back on its own.
  document.documentElement.dataset.closing = '';
  named(dialog.querySelector<HTMLElement>('[data-dot]'), `star-${slug}`, 'vt-morph');
  let marker: HTMLElement | null = null;
  const vt = document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        const settle = () => {
          clearTimeout(safety);
          // Let the restored page run its effects (journey pins, scroll restoration) first.
          setTimeout(() => {
            // The work card it was opened from (Painter / Filmmaker), else the star on the sky.
            marker =
              document.querySelector<HTMLElement>(`#main a[href="${path}"] [data-star]`) ??
              document.querySelector<HTMLElement>(`[data-layout] a[href="${path}"]`);
            named(marker, `star-${slug}`, 'vt-morph');
            resolve();
          }, 60);
        };
        const safety = setTimeout(resolve, 1500);
        addEventListener('popstate', settle, { once: true });
        back();
      }),
  );
  softNav.closingUntil(vt.finished);
  vt.finished.finally(() => {
    delete document.documentElement.dataset.closing;
    if (!marker) return;
    marker.style.viewTransitionName = '';
    marker.style.removeProperty('view-transition-class');
  });
}

/**
 * Prev/next and "nearby" links. In panel mode they record the sibling as a
 * panel path and replace history, so Close (history back) always returns to
 * the page the star was clicked on. On a full page they are plain links.
 */
export function StepLink({ href, rel, className, children }: { href: string; rel?: 'prev' | 'next'; className?: string; children: ReactNode }) {
  const panel = use(PanelMode);
  return (
    <Link
      href={href}
      rel={rel}
      className={className}
      replace={panel}
      scroll={!panel}
      onClick={() => {
        if (!panel) return;
        softNav.set(href);
        stepFocus = rel ?? null;
      }}
    >
      {children}
    </Link>
  );
}

/**
 * Renders an entity page as a panel over the sky when the visitor arrived by
 * clicking a star, and as a full page otherwise (direct load, no JS, crawler).
 * Server HTML is always the full page.
 *
 * Panel mode: native modal <dialog> (focus containment, inert page, Esc),
 * Close / Esc / backdrop click go back to the page the star was on and its
 * SkyLink takes focus again, ← → step through siblings without leaving the
 * panel. Below 640 px the panel is a draggable bottom sheet (peek 36 % / full 8 %
 * / dismiss); films stay full height.
 */
export function PanelFrame({ slug, title, kicker, lead, subline, prev, next, counter, stepLabel, variant = 'panel', children }: Props) {
  const pathname = usePathname();
  const asPanel = useArrivedFromSky(pathname);
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ y: number; t: number; v: number; top: number } | null>(null);
  const [snap, setSnap] = useState<'peek' | 'full'>('peek');
  const closing = useRef(false);

  // T7 / T20: camera on this star, sky dimmed, in both modes.
  useEffect(() => {
    cameraRig.setTarget(slug);
    cameraRig.setDim(variant === 'cinema' ? 0.45 : 0.55);
    return () => {
      cameraRig.setTarget(null);
      cameraRig.setDim(1);
    };
  }, [slug, variant]);

  // Layout effect: the dialog must be open before React snapshots the new view.
  useLayoutEffect(() => {
    if (!asPanel) return;
    const dialog = ref.current!;
    dialog.showModal();
    // Consumed: after a browser Back, a plain link to this path opens the full page.
    softNav.set(null);
    // Hides the site header/footer behind the panel (transitions.css).
    document.documentElement.dataset.panel = variant;
    if (stepFocus) dialog.querySelector<HTMLElement>(`a[rel="${stepFocus}"]`)?.focus();
    stepFocus = null;
    return () => {
      delete document.documentElement.dataset.panel;
      // Browser Back (popstate) unmounts the panel synchronously, so no view transition can
      // snapshot it first. A detached copy slides out instead. Steps (softNav set) and Close skip this.
      if (closing.current || softNav.get() !== null) return;
      slideOut(dialog.cloneNode(true) as HTMLElement, true);
      softNav.close(pathname); // focus goes back to the star's link, as with Close
    };
  }, [asPanel, variant, pathname]);

  // T8. Close / Esc / backdrop go back in history (Back then leaves the page, as expected).
  // Where the View Transitions API exists, the back navigation runs inside one: the panel
  // slides out and its header dot morphs back into the star (the reverse of T7).
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    softNav.close(pathname);
    const dialog = ref.current;
    if (dialog && 'startViewTransition' in document) return morphBack(dialog, slug, pathname, () => router.back());
    (dialog ? slideOut(dialog) : Promise.resolve()).finally(() => router.back());
  };

  const step = (item: StepItem | undefined, rel: 'prev' | 'next') => {
    if (!item) return;
    softNav.set(item.href);
    stepFocus = rel;
    router.replace(item.href, { scroll: false });
  };

  const dot = (
    <ViewTransition name={`star-${slug}`} share="vt-morph" default="none">
      <span className={styles.dot} aria-hidden="true" data-dot />
    </ViewTransition>
  );

  const titleBlock =
    variant === 'cinema' ? null : (
      <div className={styles.titleRow}>
        {lead}
        <div className={styles.titleText}>
          <h1 id={titleId(slug)} className="display-m">
            {title}
          </h1>
          {subline}
        </div>
      </div>
    );

  const footer = (prev || next || counter) && (
    <nav aria-label={stepLabel ?? 'Step through stars'} className={`label ${styles.footer}`}>
      {prev ? (
        <StepLink href={prev.href} rel="prev">
          <span aria-hidden="true">←</span>
          <span className={styles.stepName}>{prev.name}</span>
        </StepLink>
      ) : (
        <span />
      )}
      <span className={styles.counter}>{counter}</span>
      {next ? (
        <StepLink href={next.href} rel="next">
          <span className={styles.stepName}>{next.name}</span>
          <span aria-hidden="true">→</span>
        </StepLink>
      ) : (
        <span />
      )}
    </nav>
  );

  if (!asPanel) {
    return (
      <main id="main" className={`${styles.page} ${variant === 'cinema' ? styles.pageWide : ''}`}>
        <article aria-labelledby={titleId(slug)}>
          <p className={`label ${styles.kicker}`}>
            {dot}
            {kicker}
          </p>
          {titleBlock}
          {children}
        </article>
        {footer}
      </main>
    );
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (variant === 'cinema' || !matchMedia(MOBILE).matches || (e.target as Element).closest('a, button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, t: e.timeStamp, v: 0, top: ref.current!.getBoundingClientRect().top };
    ref.current!.style.transition = 'none';
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.y;
    d.v = dy / Math.max(1, e.timeStamp - d.t);
    d.y = e.clientY;
    d.t = e.timeStamp;
    // The sheet follows the finger 1:1, never above the full snap.
    d.top = Math.max(innerHeight * 0.08, d.top + dy);
    ref.current!.style.top = `${d.top}px`;
  };
  const onPointerUp = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    ref.current!.style.transition = '';
    ref.current!.style.top = '';
    // MO-9: nearest snap by position; a fling (> 0.5 px/ms) goes one snap in its direction.
    const snaps = [0.08, 0.36, 1].map((f) => f * innerHeight);
    let i = snaps.reduce((best, s, k) => (Math.abs(s - d.top) < Math.abs(snaps[best] - d.top) ? k : best), 0);
    if (d.v > 0.5) i = snaps.findIndex((s) => s > d.top + 1);
    if (d.v < -0.5) i = Math.max(0, snaps.findLastIndex((s) => s < d.top - 1));
    if (i === 2 || i === -1) close();
    else setSnap(i === 0 ? 'full' : 'peek');
  };

  return (
    <PanelMode value>
      <ViewTransition name="star-panel" enter="vt-panel" exit="vt-panel" share="vt-fade" default="none">
        <dialog
          ref={ref}
          aria-labelledby={titleId(slug)}
          aria-modal="true"
          className={`${styles.panel} ${variant === 'cinema' ? styles.cinema : ''}`}
          data-snap={snap}
          onCancel={(e) => {
            e.preventDefault();
            close();
          }}
          onKeyDown={(e) => {
            if (e.defaultPrevented) return;
            if (e.key === 'Escape') {
              e.preventDefault();
              close();
            }
            // A modal <dialog> lets Tab leave for the browser chrome; keep it cycling inside.
            if (e.key === 'Tab') {
              const all = [...e.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), iframe')].filter((el) =>
                el.checkVisibility({ visibilityProperty: true }),
              );
              const edge = e.shiftKey ? all[0] : all.at(-1);
              if (document.activeElement === edge) {
                e.preventDefault();
                (e.shiftKey ? all.at(-1) : all[0])?.focus();
              }
            }
            const typing = (e.target as Element).closest('input, textarea, select');
            if (!typing && e.key === 'ArrowLeft') step(prev, 'prev');
            if (!typing && e.key === 'ArrowRight') step(next, 'next');
          }}
          onClick={(e) => {
            // Clicks on ::backdrop target the dialog itself, outside its box.
            if (e.target !== e.currentTarget) return;
            const r = e.currentTarget.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
          }}
        >
          <header
            className={styles.bar}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <span className={styles.grabber} aria-hidden="true" />
            <p className={`label ${styles.kicker}`}>
              {dot}
              {kicker}
            </p>
            <button type="button" className={`label ${styles.close}`} onClick={close}>
              Close <span aria-hidden="true">×</span>
            </button>
          </header>
          {/* Focusable so keyboard users can scroll a body with no links in it (axe scrollable-region-focusable). */}
          <div className={styles.body} data-lenis-prevent tabIndex={0}>
            <article>
              {titleBlock}
              {children}
            </article>
          </div>
          {footer}
          <p className={`label ${styles.hint}`} aria-hidden="true">
            Esc to close{prev || next ? ' · ← → step through stars' : ''}
          </p>
        </dialog>
      </ViewTransition>
    </PanelMode>
  );
}
