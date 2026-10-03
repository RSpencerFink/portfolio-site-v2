import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PanelFrame } from '@/components/panels/PanelFrame';
import { JsonLd } from '@/components/JsonLd';
import { paintings } from '@/content/paintings';
import { absoluteUrl } from '@/content/site';
import { pageMeta, PERSON_ID } from '@/lib/seo';
import e from '@/components/panels/Entity.module.css';
import { pad } from '@/lib/format';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => paintings.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = paintings.find((x) => x.slug === slug)!;
  return pageMeta({
    title: `${p.title}: painting`,
    description: `${p.title}, ${p.medium}, ${p.size}. A painting by R. Spencer Fink.`,
    path: `/visual-arts/analog/${p.slug}`,
    image: `${p.image}_800.jpg`,
    type: 'article',
  });
}

export default async function PaintingPage({ params }: Props) {
  const { slug } = await params;
  const index = paintings.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const p = paintings[index];

  const prev = paintings[index - 1];
  const next = paintings[index + 1];

  return (
    <PanelFrame
      slug={p.slug}
      title={p.title}
      kicker={`Painting ${pad(index + 1)} / The Painter`}
      subline={<p className="label" style={{ margin: 0 }}>{p.medium} · {p.size}</p>}
      prev={prev && { href: `/visual-arts/analog/${prev.slug}`, name: prev.title }}
      next={next && { href: `/visual-arts/analog/${next.slug}`, name: next.title }}
      counter={`${pad(index + 1)} / ${pad(paintings.length)}`}
      stepLabel="The Painter"
    >
      <JsonLd
        data={{
          '@type': 'VisualArtwork',
          name: p.title,
          artform: 'Painting',
          artMedium: p.medium,
          width: { '@type': 'QuantitativeValue', value: p.widthIn, unitCode: 'INH' },
          height: { '@type': 'QuantitativeValue', value: p.heightIn, unitCode: 'INH' },
          image: absoluteUrl(`${p.image}_1500.jpg`),
          url: absoluteUrl(`/visual-arts/analog/${p.slug}`),
          creator: { '@id': PERSON_ID },
        }}
      />
      <figure className={e.figure}>
        <Image
          src={`${p.image}_1500.jpg`}
          sizes="(max-width: 760px) 100vw, 540px"
          width={800}
          height={p.height800}
          priority
          alt={`${p.title}, ${p.medium.toLowerCase()} by R. Spencer Fink`}
        />
      </figure>
    </PanelFrame>
  );
}
