import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PanelFrame, StepLink } from '@/components/panels/PanelFrame';
import { JsonLd } from '@/components/JsonLd';
import { FilmView } from '@/components/panels/FilmView';
import { films, vimeoEmbedUrl, vimeoUrl } from '@/content/films';
import { absoluteUrl, person } from '@/content/site';
import { pageMeta, PERSON_ID } from '@/lib/seo';
import v from '@/components/panels/FilmView.module.css';
import { pad } from '@/lib/format';

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
    path: `/visual-arts/digital/${f.slug}`,
    image: f.still,
    type: 'video.other',
  });
}

export default async function FilmPage({ params }: Props) {
  const { slug } = await params;
  const index = films.findIndex((f) => f.slug === slug);
  if (index < 0) notFound();
  const f = films[index];

  const prev = films[index - 1];
  const next = films[index + 1];
  const counter = `${pad(index + 1)} / ${pad(films.length)}`;
  const [lead, ...credits] = f.description.split('\n\n');
  const upNext = Array.from({ length: 6 }, (_, k) => (index + 1 + k) % films.length);

  return (
    <PanelFrame
      slug={f.slug}
      title={f.title}
      kicker={f.title}
      prev={prev && { href: `/visual-arts/digital/${prev.slug}`, name: `Prev · ${prev.title}` }}
      next={next && { href: `/visual-arts/digital/${next.slug}`, name: `${next.title} · Next` }}
      counter={counter}
      stepLabel="The Director"
      variant="cinema"
    >
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
      <FilmView
        slug={f.slug}
        title={f.title}
        roles={f.roles}
        vimeoId={f.vimeoId}
        vimeoUrl={vimeoUrl(f)}
        still={f.still}
        counter={counter}
        info={
          <>
            <p className={`label ${v.number}`}>Film {counter}</p>
            {/* PanelFrame's cinema variant labels the dialog with `${slug}-title`. */}
            <h1 id={`${f.slug}-title`} className="display-s">
              {f.title}
            </h1>
            <p className={`label ${v.roles}`}>{f.roles.join(', ')}</p>
            {lead && <p className={v.lead}>{lead}</p>}
            {credits.length > 0 && (
              <section className={v.credits} aria-labelledby={`${f.slug}-credits`}>
                <h2 id={`${f.slug}-credits`} className="label">
                  Credits
                </h2>
                {credits.map((c) => (
                  <p key={c}>{c}</p>
                ))}
              </section>
            )}
          </>
        }
      >
        <section className={v.next} aria-labelledby={`${f.slug}-next`}>
          <header className="label">
            <h2 id={`${f.slug}-next`} className="label">
              Up next in the constellation
            </h2>
            <span aria-hidden="true">
              {pad(upNext[0] + 1)} — {pad(upNext[5] + 1)}
            </span>
          </header>
          <ol>
            {upNext.map((i) => {
              const x = films[i];
              return (
                <li key={x.slug}>
                  <StepLink href={`/visual-arts/digital/${x.slug}`}>
                    <span className={v.thumb}>
                      {x.still ? <Image src={x.still} width={320} height={180} sizes="140px" alt="" /> : x.title}
                    </span>
                    <span className="label-s">{pad(i + 1)}</span>
                    <span>{x.title}</span>
                  </StepLink>
                </li>
              );
            })}
          </ol>
        </section>
      </FilmView>
    </PanelFrame>
  );
}
