import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ViewTransition, type CSSProperties } from 'react';
import { ConstellationLines } from '@/components/panels/ConstellationLines';
import { SkyLink } from '@/components/panels/SkyLink';
import { VisualArtsToggle } from '@/components/panels/VisualArtsToggle';
import { ArtWindow } from '@/components/panels/ArtWindow';
import { films } from '@/content/films';
import { pageMeta } from '@/lib/seo';
import s from '../visual-arts.module.css';
import { starSlot } from '../field';

export const metadata: Metadata = pageMeta({
  title: 'The Filmmaker: Digital',
  description: `${films.length} films and music videos directed by R. Spencer Fink.`,
  path: '/visual-arts/digital',
  image: films.find((f) => f.still)!.still,
});

/** R3 · A4. Film stills; hover or focus shows the logline. */
/** The window's pool: every film with a still, a random three per visit; the server HTML shows FALLBACK. */
const work = (f: (typeof films)[number]) => ({ src: f.still!, name: f.title });
const POOL = films.filter((f) => f.still).map(work);
const FALLBACK = ['nightshade', 'spare-key', 'bayonet'].map((slug) => work(films.find((f) => f.slug === slug)!));

export default function DigitalPage() {
  return (
    <main id="main" className={s.main}>
      <ArtWindow pool={POOL} fallback={FALLBACK} />
      <header className={s.head}>
        <ViewTransition name="va-title" share="vt-fade" default="none">
          <h1 className="display-s">The Filmmaker</h1>
        </ViewTransition>
        <Link href="/" className="label">
          <span aria-hidden="true">← </span>Back to sky
        </Link>
        <VisualArtsToggle current="digital" />
      </header>
      <ViewTransition name="va-works" share="vt-swap" default="none">
        <nav aria-label="The Filmmaker" className={s.field}>
          <ConstellationLines className={s.lines} />
          <ol className={s.films}>
            {films.map((f, i) => {
              const logline = f.description.split('\n')[0];
              return (
                <li key={f.slug} style={starSlot(i, [0.8, 1, 0.7, 0.9][i % 4]) as CSSProperties}>
                  <SkyLink href={`/visual-arts/digital/${f.slug}`} className={s.work}>
                    <ViewTransition name={`film-still-${f.slug}`} share="vt-frame" default="none">
                      <span className={s.still} data-star>
                        {f.still ? (
                          <Image src={f.still} width={1280} height={720} sizes="(max-width: 639px) 100vw, 380px" alt="" />
                        ) : (
                          <span className={s.titleCard}>{f.title}</span>
                        )}
                        <span className={s.play} aria-hidden="true" />
                      </span>
                    </ViewTransition>
                    <span className={s.caption}>
                      <span className={`label ${s.name}`}>{f.title}</span>
                      <span className="label-s">{f.roles.join(', ')}</span>
                      {logline && <span className={s.logline}>{logline}</span>}
                    </span>
                  </SkyLink>
                </li>
              );
            })}
          </ol>
        </nav>
      </ViewTransition>
    </main>
  );
}
