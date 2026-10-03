import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PanelFrame } from '@/components/panels/PanelFrame';
import { JsonLd } from '@/components/JsonLd';
import { Stepper } from '@/components/Stepper';
import { films, vimeoEmbedUrl, vimeoUrl } from '@/content/films';
import { absoluteUrl, person } from '@/content/site';
import { pageMeta, PERSON_ID } from '@/lib/seo';
import s from '../../../mirror.module.css';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => films.map((f) => ({ slug: f.slug }));

const summary = (f: (typeof films)[number]) =>
  f.description.split('\n')[0] || `${f.title}. ${f.roles.join(', ')}: ${person.name}.`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = films.find((x) => x.slug === slug)!;
  return pageMeta({
    title: `${f.title}: film`,
    description: summary(f),
    path: `/visual-arts/digital/${f.slug}/`,
    image: f.still,
    type: 'video.other',
  });
}

export default async function FilmPage({ params }: Props) {
  const { slug } = await params;
  const index = films.findIndex((f) => f.slug === slug);
  if (index < 0) notFound();
  const f = films[index];

  return (
    <PanelFrame slug={f.slug} title={f.title} kicker="The Filmmaker · Digital">
      <JsonLd
        data={{
          '@type': 'VideoObject',
          name: f.title,
          description: f.description || summary(f),
          embedUrl: vimeoEmbedUrl(f),
          url: vimeoUrl(f),
          ...(f.still && { thumbnailUrl: absoluteUrl(f.still) }),
          creator: { '@id': PERSON_ID },
          director: { '@id': PERSON_ID },
        }}
      />
      <div className={s.stack}>
        {/* Poster until the panels track mounts the Vimeo player on first play (spec §7 perf). */}
        <a href={vimeoUrl(f)} aria-label={`Play ${f.title} on Vimeo`}>
          {f.still ? (
            // eslint-disable-next-line @next/next/no-img-element -- static export
            <img className={s.media} src={f.still} width={1280} height={720} alt={`Still from ${f.title}`} />
          ) : (
            <span className={`display-s ${s.card}`}>{f.title}</span>
          )}
        </a>
        <p className="label">{f.roles.join(' · ')}</p>
        {f.description && <p className={`body-l ${s.preLine}`}>{f.description}</p>}
        <p><a className={`label ${s.pill}`} href={vimeoUrl(f)}>Watch on Vimeo ↗</a></p>
      </div>
      <Stepper items={films} index={index} label="The Filmmaker" toItem={(x) => ({ href: `/visual-arts/digital/${x.slug}/`, name: x.title })} />
    </PanelFrame>
  );
}
