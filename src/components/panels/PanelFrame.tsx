'use client';

import { ViewTransition, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useArrivedFromSky } from './softNav';
import styles from './PanelFrame.module.css';

interface Props {
  /** Entity slug; the header dot carries view-transition-name `star-${slug}`. */
  slug: string;
  title: string;
  /** Breadcrumb, e.g. "Constellation of Work". */
  kicker: string;
  children: ReactNode;
}

/**
 * Renders an entity page as a panel over the sky when the visitor arrived by
 * clicking a star, and as a full page otherwise (direct load, no JS, crawler).
 * Server HTML is always the full page. The panels track owns open/close
 * animation, focus trap, Esc and prev/next keys.
 */
export function PanelFrame({ slug, title, kicker, children }: Props) {
  const asPanel = useArrivedFromSky(usePathname());
  const titleId = `${slug}-title`;

  const header = (
    <header className={styles.header}>
      <p className="label">
        <ViewTransition name={`star-${slug}`}>
          <span className={styles.dot} aria-hidden="true" />
        </ViewTransition>
        {kicker}
      </p>
      <h1 id={titleId} className="display-m">
        {title}
      </h1>
    </header>
  );

  if (!asPanel) {
    return (
      <main id="main" className={styles.page}>
        <article>
          {header}
          {children}
        </article>
      </main>
    );
  }

  return (
    <div role="dialog" aria-labelledby={titleId} className={styles.panel}>
      <Link href="/" className={`label ${styles.close}`}>
        Close
      </Link>
      <article>
        {header}
        {children}
      </article>
    </div>
  );
}
