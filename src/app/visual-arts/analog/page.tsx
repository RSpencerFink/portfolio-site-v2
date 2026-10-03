import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ViewTransition, type CSSProperties } from 'react';
import { ConstellationLines } from '@/components/panels/ConstellationLines';
import { SkyLink } from '@/components/panels/SkyLink';
import { VisualArtsToggle } from '@/components/panels/VisualArtsToggle';
import { paintings } from '@/content/paintings';
import { pageMeta } from '@/lib/seo';
import s from '../visual-arts.module.css';
import { starSlot } from '../field';

export const metadata: Metadata = pageMeta({
  title: 'The Painter: Analog',
  description: `${paintings.length} paintings by R. Spencer Fink, acrylic and acrylic on collage on canvas.`,
  path: '/visual-arts/analog',
  image: `${paintings[0].image}_800.jpg`,
});

const pad = (n: number) => String(n).padStart(2, '0');

/** R3 · A3. Paintings float at star positions, sized by real canvas width, joined by constellation lines; hover or focus selects one. */
export default function AnalogPage() {
  return (
    <main id="main" className={s.main}>
      <header className={s.head}>
        <ViewTransition name="va-title" share="vt-fade" default="none">
          <h1 className="display-s">The Painter</h1>
        </ViewTransition>
        <Link href="/" className="label">
          <span aria-hidden="true">← </span>Back to sky
        </Link>
        <p className="label">Analog · {paintings.length} paintings</p>
        <VisualArtsToggle current="analog" />
      </header>
      <ViewTransition name="va-works" share="vt-swap" default="none">
        <nav aria-label="The Painter" className={s.field}>
          <ConstellationLines className={s.lines} />
          <ol className={s.paintings}>
            {paintings.map((p, i) => (
              <li key={p.slug} style={starSlot(i, p.widthIn / 48) as CSSProperties}>
                <SkyLink href={`/visual-arts/analog/${p.slug}`} className={s.work}>
                  <span className={`label ${s.selected}`} aria-hidden="true">
                    Selected · {pad(i + 1)} / {pad(paintings.length)} · Enter to open
                  </span>
                  <span className={s.frame} data-star>
                    <Image
                      src={`${p.image}_800.jpg`}
                      width={800}
                      height={p.height800}
                      sizes="(max-width: 639px) 80vw, 360px"
                      alt=""
                    />
                  </span>
                  <span className={s.caption}>
                    <span className={`label ${s.name}`}>{p.title}</span>
                    <span className="label-s">{p.medium}</span>
                    <span className="label-s">{p.size}</span>
                  </span>
                </SkyLink>
              </li>
            ))}
          </ol>
        </nav>
      </ViewTransition>
    </main>
  );
}
