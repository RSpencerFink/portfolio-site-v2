import type { Metadata } from 'next';
import { SkyLink } from '@/components/panels/SkyLink';
import { paintings } from '@/content/paintings';
import { pageMeta } from '@/lib/seo';
import s from '../../mirror.module.css';

export const metadata: Metadata = pageMeta({
  title: 'The Painter: Analog',
  description: `${paintings.length} paintings by R. Spencer Fink, acrylic and acrylic on collage on canvas.`,
  path: '/visual-arts/analog/',
  image: `${paintings[0].image}_800.jpg`,
});

export default function AnalogPage() {
  return (
    <main id="main" className={s.main}>
      <p className="label">Visual Arts · Analog</p>
      <h1 className="display-s">The Painter</h1>
      <nav aria-label="The Painter" style={{ marginTop: 32 }}>
        <ol className={s.grid}>
          {paintings.map((p) => (
            <li key={p.slug}>
              <SkyLink href={`/visual-arts/analog/${p.slug}/`}>
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
                  <img src={`${p.image}_400.jpg`} width={400} height={Math.round(p.height800 / 2)} alt="" loading="lazy" />
                  <figcaption>
                    <span className="body-strong">{p.title}</span>
                    <br />
                    <span className="label-s">{p.medium} · {p.size}</span>
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
