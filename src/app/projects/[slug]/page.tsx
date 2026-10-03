import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PanelFrame, StepLink } from '@/components/panels/PanelFrame';
import { JsonLd } from '@/components/JsonLd';
import { projects } from '@/content/projects';
import { absoluteUrl } from '@/content/site';
import { pageMeta, PERSON_ID } from '@/lib/seo';
import e from '@/components/panels/Entity.module.css';
import { pad } from '@/lib/format';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug)!;
  return pageMeta({ title: `${p.name}: project`, description: p.description, path: `/projects/${p.slug}` });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const p = projects[index];

  const prev = projects[index - 1];
  const next = projects[index + 1];
  const nearby = [prev, next].filter((x) => x !== undefined);

  return (
    <PanelFrame
      slug={p.slug}
      title={p.name}
      kicker={`Star ${pad(index + 1)} / The Builder’s Cluster`}
      prev={prev && { href: `/projects/${prev.slug}`, name: prev.name }}
      next={next && { href: `/projects/${next.slug}`, name: next.name }}
      counter={`${pad(index + 1)} / ${pad(projects.length)}`}
      stepLabel="The Builder’s Cluster"
    >
      <JsonLd
        data={{
          '@type': p.repo ? 'SoftwareSourceCode' : 'CreativeWork',
          name: p.name,
          description: p.description,
          url: p.live?.url ?? absoluteUrl(`/projects/${p.slug}`),
          author: { '@id': PERSON_ID },
          keywords: p.tech.join(', '),
          ...(p.repo && { codeRepository: p.repo, programmingLanguage: p.tech }),
        }}
      />
      <div className={e.stack}>
        <p className="body-l">{p.description}</p>
        <ul className={e.pills}>
          {p.repo && (
            <li>
              <a className={`label ${e.pill}`} href={p.repo}>
                Repository <span aria-hidden="true">↗</span>
              </a>
            </li>
          )}
          {p.live && (
            <li>
              <a className={`label ${e.pill}`} href={p.live.url}>
                {p.live.label} <span aria-hidden="true">↗</span>
              </a>
            </li>
          )}
        </ul>
        <section className={e.section}>
          <h2 className="heading">Built with</h2>
          <ul className={`mono-body ${e.chips}`}>
            {p.tech.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
        <section className={e.section}>
          <h2 className="heading">Nearby in the cluster</h2>
          <ol className={e.items}>
            {nearby.map((x) => (
              <li key={x.slug}>
                <span className={`label-s ${e.num}`} aria-hidden="true">{pad(projects.indexOf(x) + 1)}</span>
                <div>
                  <StepLink href={`/projects/${x.slug}`} className="body-strong">{x.name}</StepLink>
                  <p className={e.body}>{x.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </PanelFrame>
  );
}
