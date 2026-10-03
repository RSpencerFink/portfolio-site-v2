'use client';

import { createContext, use, useEffect, useEffectEvent, useLayoutEffect, useRef, useState, useSyncExternalStore, ViewTransition, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cameraRig } from '@/components/sky/cameraRig';
import { softNav, useArrivedFromSky } from './softNav';
import styles from './PanelFrame.module.css';
import './transitions.css';
import { isModified } from '@/lib/events';

export interface StepItem {
  href: string;
  name: string;
}

interface Props {
  /** Star id (entity slug, or "observer"): the camera centres this star. */
  slug: string;
  title: string;
  /** Breadcrumb, e.g. "Star 03 / The Engineer". */
  kicker?: string;
  /** Insignia or headshot above the title. */
  lead?: ReactNode;
  /** Line under the title (identities, role). */
  subline?: ReactNode;
  prev?: StepItem;
  next?: StepItem;
  /** Footer centre, e.g. "03 / 05". */
  counter?: string;
  /** Accessible name of the prev/next footer. */
  stepLabel?: string;
  /**
   * `text` (jobs, projects, About): a reading column under the centred star.
   * `media` (paintings): the work first, title and caption below.
   * `cinema` (films): player first; the page renders its own h1 with id `${slug}-title`.
   */
  variant?: 'text' | 'media' | 'cinema';
  children: ReactNode;
}

const titleId = (slug: string) => `${slug}-title`;

/** null on a full page; otherwise how the panel was reached ('direct': no sky page behind it in history). */
const PanelMode = createContext<'sky' | 'direct' | null>(null);
/** Which footer link to focus after a step lands (the new panel is a fresh mount). */
let stepFocus: string | null = null;

/** False for the server HTML and the hydration pass, true after: with JS, every entity route is a panel. */
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);
function noop() {
  return () => {};
}

/** Where Close goes from a panel with no sky page behind it: the painting or film constellation, else the home sky chart. */
const parentOf = (path: string) => (path.startsWith('/visual-arts/') ? path.slice(0, path.lastIndexOf('/')) : '/#chart');

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The panel's exit (T8): the column fades and sinks 12 px while the camera flies back; 200 ms crossfade under reduced motion. */
function fadeOut(el: HTMLElement, detached = false) {
  if (detached) {
    // A copy of a panel React has already removed (browser Back): inert, no duplicate ids, removed when done.
    el.inert = true;
    el.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    el.querySelectorAll('iframe, video').forEach((n) => n.remove()); // no second Vimeo player
    el.removeAttribute('aria-labelledby');
    document.body.append(el);
  }
  const reduce = reduceMotion();
  const out = el.animate([{}, { opacity: 0, translate: reduce ? '0 0' : '0 12px' }], {
    duration: reduce ? 200 : 240,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    fill: 'forwards',
  });
  return out.finished.finally(() => detached && el.remove());
}

/**
 * Prev/next links. In panel mode they record the sibling as a panel path
 * (keeping the panel's origin) and replace history, so Close always returns
 * to the page the star was clicked on, or to the parent page. On a full page
 * they are plain links.
 */
export function StepLink({ href, rel, className, children }: { href: string; rel?: 'prev' | 'next'; className?: string; children: ReactNode }) {
  const panel = use(PanelMode);
  return (
    <Link
      href={href}
      rel={rel}
      className={className}
      replace={!!panel}
      scroll={!panel}
      onClick={(e) => {
        if (!panel || isModified(e)) return;
        softNav.set(href, panel === 'direct');
        stepFocus = rel ?? null;
      }}
    >
      {children}
    </Link>
  );
}

/**
 * Renders an entity page as a centred, camera-led panel whenever JS runs,
 * and as a full page in the server HTML (no JS, crawlers; hidden until
 * hydration with JS). One layout path for every way in: the camera flies to
 * the entity's star and centres it in the upper middle, the sky dims and
 * drops its labels and lines, and the content reads in a centred column
 * below it. The site header stays usable above the panel.
 *
 * Reached by clicking a star, Close / Back to sky / Esc go back in history
 * to the page the star was on and its SkyLink takes focus again. Reached any
 * other way (direct load, reload, a plain link) it fades in (T20) and Close
 * opens the parent page. ← → step through siblings without leaving the panel.
 */
export function PanelFrame({ slug, title, kicker, lead, subline, prev, next, counter, stepLabel, variant = 'text', children }: Props) {
  const pathname = usePathname();
  const asPanel = useHydrated();
  // The hydration pass rendered the full page: this panel is the first paint of a hard load (T20).
  const [landing] = useState(!asPanel);
  const fromSky = useArrivedFromSky(pathname);
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // T7 / T20: camera centres this star, sky dimmed. Only behind a panel (a full page keeps the calm sky).
  useEffect(() => {
    if (!asPanel) return;
    cameraRig.setTarget(slug);
    cameraRig.setDim(variant === 'cinema' ? 0.45 : 0.55);
    return () => {
      cameraRig.setTarget(null);
      cameraRig.setDim(1);
    };
  }, [slug, variant, asPanel]);

  // Layout effect: the dialog must be open before React snapshots the new view.
  useLayoutEffect(() => {
    if (!asPanel) return;
    const dialog = ref.current!;
    // Non-modal: the site header above the panel stays usable (header navigation, item 7).
    dialog.show();
    // Consumed: after a browser Back, a plain link to this path opens the panel as direct.
    softNav.set(null);
    // Hides the site footer and raises the header over the panel (transitions.css).
    document.documentElement.dataset.panel = variant;
    const focus = stepFocus && dialog.querySelector<HTMLElement>(`a[rel="${stepFocus}"]`);
    (focus || dialog).focus({ preventScroll: true });
    stepFocus = null;
    return () => {
      delete document.documentElement.dataset.panel;
      // Header navigation dismisses instantly; steps (softNav set) and Close have run their own exit.
      if (softNav.takeDismiss() || closing.current || softNav.get() !== null) return;
      // Browser Back (popstate) unmounts the panel synchronously: a detached copy fades out instead.
      fadeOut(dialog.cloneNode(true) as HTMLElement, true);
      softNav.close(pathname); // focus goes back to the star's link, as with Close
    };
  }, [asPanel, variant, pathname]);

  // A panel that fits the viewport is one centred unit (star + content, `data-fit`); a longer one keeps
  // the top-aligned scroller. Either way the camera puts the star --star-gap above the kicker.
  useLayoutEffect(() => {
    if (!asPanel) return;
    const panel = ref.current!;
    const body = bodyRef.current!;
    const article = body.querySelector('article')!;
    const layout = () => {
      panel.dataset.fit = '';
      if (body.scrollHeight > body.clientHeight) delete panel.dataset.fit;
      // Relative to the body, so the landing animation's translate doesn't count.
      const kicker = article.firstElementChild!.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop;
      panel.style.setProperty('--clear', `${kicker}px`);
      if (variant === 'text') cameraRig.setFocalY((kicker - parseFloat(getComputedStyle(panel).getPropertyValue('--star-gap'))) / body.clientHeight);
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(article);
    ro.observe(body);
    return () => {
      ro.disconnect();
      cameraRig.setFocalY(null);
    };
  }, [asPanel, variant]);

  // T8. Close / Back to sky / Esc go back in history (Back then leaves the page, as expected).
  // A panel not opened from the sky has no page behind it in history: it fades out and opens its parent.
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const parent = fromSky ? null : parentOf(pathname);
    // Back on the home chart the star's mirror link would take focus and scroll the page away from H3.
    if (parent === '/#chart') softNav.set(null);
    else softNav.close(pathname);
    const done = ref.current ? fadeOut(ref.current) : Promise.resolve();
    softNav.closingUntil(done);
    done.finally(() => (parent ? router.push(parent) : router.back()));
  };

  const step = (item: StepItem | undefined, rel: 'prev' | 'next') => {
    if (!item) return;
    softNav.set(item.href, !fromSky);
    stepFocus = rel;
    router.replace(item.href, { scroll: false });
  };

  // Esc and ← → anywhere on the page while the panel is open (the dialog is non-modal).
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey) return; // Alt/Cmd+← is the browser's Back
    if ((e.target as Element).closest?.('input, textarea, select, [role="tablist"]')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') step(prev, 'prev');
    else if (e.key === 'ArrowRight') step(next, 'next');
    else return;
    e.preventDefault();
  });
  useEffect(() => {
    if (!asPanel) return;
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [asPanel]);

  const titleBlock =
    variant === 'cinema' ? null : (
      <div className={styles.titleRow}>
        {lead}
        <h1 id={titleId(slug)} className="display-m">
          {title}
        </h1>
        {subline}
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

  const kickerLine = kicker ? <p className={`label ${styles.kicker}`}>{kicker}</p> : null;
  const article = (
    <article aria-labelledby={titleId(slug)} className={styles.column}>
      {kickerLine}
      {variant === 'text' && titleBlock}
      {children}
      {variant === 'media' && titleBlock}
    </article>
  );

  if (!asPanel) {
    return (
      <main id="main" className={`${styles.page} ${variant === 'cinema' ? styles.pageWide : ''}`}>
        {article}
        {footer}
      </main>
    );
  }

  return (
    <PanelMode value={fromSky ? 'sky' : 'direct'}>
      <ViewTransition name="star-panel" enter="vt-panel" exit="vt-panel" share="vt-fade" default="none">
        <dialog
          ref={ref}
          aria-labelledby={titleId(slug)}
          tabIndex={-1}
          className={`${styles.panel} ${styles[variant] ?? ''}`}
          data-landing={landing ? '' : undefined}
          onClick={(e) => {
            // A click on the empty sky around the column closes, like a backdrop.
            if (e.target === e.currentTarget || (e.target as Element).hasAttribute('data-backdrop')) close();
          }}
        >
          <div className={styles.bar}>
            <a
              href={fromSky ? '/' : parentOf(pathname)}
              className={`label ${styles.back}`}
              onClick={(e) => {
                if (isModified(e)) return;
                e.preventDefault();
                close();
              }}
            >
              <span aria-hidden="true">← </span>Back to sky
            </a>
            <button type="button" className={styles.close} aria-label="Close" onClick={close}>
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          {/* Focusable so keyboard users can scroll a body with no links in it (axe scrollable-region-focusable). */}
          <div ref={bodyRef} className={styles.body} data-lenis-prevent data-backdrop tabIndex={0}>
            <div className={styles.unit} data-backdrop>
              {article}
              {footer}
            </div>
          </div>
        </dialog>
      </ViewTransition>
    </PanelMode>
  );
}
