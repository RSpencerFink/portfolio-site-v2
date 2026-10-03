import type { Metadata } from 'next';
import Image from 'next/image';
import { SkyLink } from '@/components/panels/SkyLink';
import { films } from '@/content/films';
import { pageMeta } from '@/lib/seo';
import s from '../../mirror.module.css';

export const metadata: Metadata = pageMeta({
  title: 'The Filmmaker: Digital',
  description: `${films.length} films and music videos directed by R. Spencer Fink.`,
  path: '/visual-arts/digital',
  image: films.find((f) => f.still)!.still,
});

export default function DigitalPage() {
  return (
    <main id="main" className={s.main}>
      <p className="label">Visual Arts · Digital</p>
      <h1 className="display-s">The Filmmaker</h1>
      <nav aria-label="The Filmmaker" style={{ marginTop: 32 }}>
        <ol className={s.grid}>
          {films.map((f) => (
            <li key={f.slug}>
              <SkyLink href={`/visual-arts/digital/${f.slug}`}>
                <figure>
                  {f.still ? (
                    <Image src={f.still} width={1280} height={720} sizes="(max-width: 480px) 100vw, 300px" alt="" />
                  ) : (
                    <span className={`display-s ${s.card}`}>{f.title}</span>
                  )}
                  <figcaption>
                    <span className="body-strong">{f.title}</span>
                    <br />
                    <span className="label-s">{f.roles.join(', ')}</span>
                  </figcaption>
                </figure>
              </SkyLink>
            </li>
          ))}
        </ol>
      </nav>
    </main>
  );
}
