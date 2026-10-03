import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PanelFrame } from '@/components/panels/PanelFrame';
import { JsonLd } from '@/components/JsonLd';
import { Stepper } from '@/components/Stepper';
import { paintings } from '@/content/paintings';
import { absoluteUrl, srcSet } from '@/content/site';
import { pageMeta, PERSON_ID } from '@/lib/seo';
import s from '../../../mirror.module.css';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => paintings.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = paintings.find((x) => x.slug === slug)!;
  return pageMeta({
    title: `${p.title}: painting`,
    description: `${p.title}, ${p.medium}, ${p.size}. A painting by R. Spencer Fink.`,
    path: `/visual-arts/analog/${p.slug}/`,
    image: `${p.image}_800.jpg`,
    type: 'article',
  });
}

export default async function PaintingPage({ params }: Props) {
  const { slug } = await params;
  const index = paintings.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const p = paintings[index];

  return (
    <PanelFrame slug={p.slug} title={p.title} kicker="The Painter · Analog">
      <JsonLd
        data={{
          '@type': 'VisualArtwork',
          name: p.title,
          artform: 'Painting',
          artMedium: p.medium,
          width: { '@type': 'QuantitativeValue', value: p.widthIn, unitCode: 'INH' },
          height: { '@type': 'QuantitativeValue', value: p.heightIn, unitCode: 'INH' },
          image: absoluteUrl(`${p.image}_1500.jpg`),
          url: absoluteUrl(`/visual-arts/analog/${p.slug}/`),
          creator: { '@id': PERSON_ID },
        }}
      />
      <figure className={s.stack} style={{ margin: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, srcset variants pre-generated */}
        <img
          className={s.media}
          src={`${p.image}_800.jpg`}
          srcSet={srcSet(p.image)}
          sizes="(max-width: 760px) 100vw, 700px"
          width={800}
          height={p.height800}
          alt={`${p.title}, ${p.medium.toLowerCase()} by R. Spencer Fink`}
        />
        <figcaption className="label">{p.medium} · {p.size}</figcaption>
      </figure>
      <Stepper items={paintings} index={index} label="The Painter" toItem={(x) => ({ href: `/visual-arts/analog/${x.slug}/`, name: x.title })} />
    </PanelFrame>
  );
}
