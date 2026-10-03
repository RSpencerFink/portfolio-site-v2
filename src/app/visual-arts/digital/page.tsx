import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ViewTransition, type CSSProperties } from 'react';
import { ConstellationLines } from '@/components/panels/ConstellationLines';
import { SkyLink } from '@/components/panels/SkyLink';
import { VisualArtsToggle } from '@/components/panels/VisualArtsToggle';
import { films, vimeoUrl } from '@/content/films';
import { pageMeta } from '@/lib/seo';
import s from '../visual-arts.module.css';
import { starSlot } from '../field';
import { pad } from '@/lib/format';

export const metadata: Metadata = pageMeta({
  title: 'The Filmmaker: Digital',
  description: `${films.length} films and music videos directed by R. Spencer Fink.`,
  path: '/visual-arts/digital',
  image: films.find((f) => f.still)!.still,
});

/** R3 · A4. Film stills with timecode chips; hover or focus shows the logline. */
export default function DigitalPage() {
  return (
    <main id="main" className={s.main}>
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
        <div className={s.filmsWrap}>
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
                          <span className={`label-s ${s.timecode}`} aria-hidden="true">
                            00:00:00:00
                          </span>
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
          <section className={s.index} aria-labelledby="film-index">
            <h2 id="film-index" className="label">
              Index
            </h2>
            <ol className="label">
              {films.map((f, i) => (
                <li key={f.slug}>
                  <span aria-hidden="true">{pad(i + 1)}</span>
                  <SkyLink href={`/visual-arts/digital/${f.slug}`}>{f.title}</SkyLink>
                  <a href={vimeoUrl(f)} className={s.vimeo} aria-label={`${f.title} on Vimeo`}>
                    Vimeo <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </ViewTransition>
    </main>
  );
}
