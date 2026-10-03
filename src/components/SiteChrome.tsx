import Link from 'next/link';
import { person, resume, socials } from '@/content/site';
import styles from './SiteChrome.module.css';

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <a href="#main" className={`visually-hidden ${styles.skip}`}>
        Skip to content
      </a>
      <Link href="/" className="label">
        {person.name}
      </Link>
      <nav aria-label="Primary">
        <ul className={`label ${styles.links}`}>
          <li><Link href="/#work">Work</Link></li>
          <li><Link href="/#projects">Projects</Link></li>
          <li><Link href="/visual-arts/">Visual Arts</Link></li>
          <li><Link href="/about/">About</Link></li>
          <li><a href={resume.href}>Résumé</a></li>
        </ul>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
      <img src="/images/logo/rsf-FFFFFF.svg" alt="RSF" width={83} height={40} />
      <ul className={`label ${styles.links}`}>
        {socials.map((s) => (
          <li key={s.label}>
            <a href={s.url} rel="me noopener">{s.label}</a>
          </li>
        ))}
        <li><a href={resume.href}>{resume.label}</a></li>
        <li><Link href="/visual-arts/">Visual Arts Portfolio</Link></li>
      </ul>
    </footer>
  );
}
