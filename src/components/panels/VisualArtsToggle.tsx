'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, ViewTransition } from 'react';
import styles from './VisualArtsToggle.module.css';
import './transitions.css';

const tabs = [
  { id: 'analog', label: 'Analog', href: '/visual-arts/analog' },
  { id: 'digital', label: 'Digital', href: '/visual-arts/digital' },
] as const;

/** Set when the arrow keys swap segments, so the new page's toggle takes focus. */
let refocus = false;

/**
 * Analog | Digital (spec §6 Toggle, T10). Two real links so it works without
 * JS; ← → swap segments. The thumb carries `va-toggle` and slides between
 * the two routes; the pages pair `va-title` and `va-works`.
 */
/** `transitionName` false: a second toggle on screen (the window's) must not reuse `va-toggle`. */
export function VisualArtsToggle({ current, transitionName = true }: { current: 'analog' | 'digital'; transitionName?: boolean }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (refocus) ref.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
    refocus = false;
  }, []);
  return (
    <div
      ref={ref}
      role="tablist"
      aria-label="Visual arts"
      className={`label ${styles.toggle}`}
      onKeyDown={(e) => {
        if ((e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || e.altKey || e.metaKey || e.ctrlKey) return;
        const to = tabs.find((t) => t.id !== current)!;
        e.preventDefault();
        refocus = true;
        router.push(to.href);
      }}
    >
      {transitionName ? (
        <ViewTransition name="va-toggle" share="vt-thumb" default="none">
          <span className={styles.thumb} data-pos={current} aria-hidden="true" />
        </ViewTransition>
      ) : (
        <span className={styles.thumb} data-pos={current} aria-hidden="true" />
      )}
      {tabs.map((t) => (
        <Link
          key={t.id}
          role="tab"
          aria-selected={t.id === current}
          tabIndex={t.id === current ? 0 : -1}
          href={t.href}
          className={styles.tab}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
