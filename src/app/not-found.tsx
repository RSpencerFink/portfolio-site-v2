import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Lost in space',
  robots: { index: false, follow: true },
};

/** 404: the calm sky (no panel target off the home route) with a way back. */
export default function NotFound() {
  return (
    <main id="main" className={styles.main}>
      <p className="label">404 / Off the chart</p>
      <h1 className="display-m">Lost in space</h1>
      <p className="body-l">This page drifted out of the chart.</p>
      <Link href="/" className={`label ${styles.home}`}>
        <span aria-hidden="true">←</span>Back to the sky
      </Link>
      <nav aria-label="Elsewhere" className="label">
        <ul className={styles.links}>
          <li><Link href="/#work">Work</Link></li>
          <li><Link href="/about">About</Link></li>
        </ul>
      </nav>
    </main>
  );
}
