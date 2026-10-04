import Image from 'next/image';
import Link from 'next/link';
import { person, resume, socials } from '@/content/site';
import { MenuButton } from './MenuButton';
import styles from './SiteChrome.module.css';

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <a href="#main" className={`visually-hidden ${styles.skip}`}>
        Skip to content
      </a>
      <Link href="/" className={`label ${styles.home}`} aria-label={`${person.name}, home`}>
        <Image src="/logo/rsf.svg" alt="" width={50} height={24} priority />
      </Link>
      <nav aria-label="Primary" className={styles.nav}>
        <MenuButton className={`label ${styles.menu}`} controls="primary-links" />
        <ul id="primary-links" className={`label ${styles.links}`}>
          <li><Link href="/#work">Work</Link></li>
          <li><Link href="/#projects">Projects</Link></li>
          <li><Link href="/about">About</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <ul className={`label ${styles.links}`}>
        {socials.map((s) => (
          <li key={s.label}>
            <a href={s.url} target="_blank" rel="me noopener noreferrer">{s.label}</a>
          </li>
        ))}
        <li><a href={resume.href} target="_blank" rel="noopener noreferrer">{resume.label}</a></li>
      </ul>
    </footer>
  );
}
