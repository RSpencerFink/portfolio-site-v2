import type { Metadata } from 'next';
import Link from 'next/link';
import { paintings } from '@/content/paintings';
import { films } from '@/content/films';
import { pageMeta } from '@/lib/seo';
import s from '../mirror.module.css';

export const metadata: Metadata = pageMeta({
  title: 'Visual Arts',
  description: `Visual arts by R. Spencer Fink: ${paintings.length} paintings (Analog) and ${films.length} films and music videos (Digital).`,
  path: '/visual-arts/',
});

// Spec §2 calls for a redirect to /visual-arts/analog; static export has no
// server redirects, so this is a small hub that links both segments.
export default function VisualArtsPage() {
  return (
    <main id="main" className={s.main}>
      <h1 className="display-s">Visual Arts</h1>
      <ul className={s.list} style={{ marginTop: 32 }}>
        <li className={s.stack}>
          <Link className="heading" href="/visual-arts/analog/">The Painter · Analog</Link>
          <p className="body">{paintings.length} paintings, acrylic and acrylic on collage on canvas.</p>
        </li>
        <li className={s.stack}>
          <Link className="heading" href="/visual-arts/digital/">The Filmmaker · Digital</Link>
          <p className="body">{films.length} films and music videos.</p>
        </li>
      </ul>
    </main>
  );
}
