import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PanelFrame } from '@/components/panels/PanelFrame';
import { JsonLd } from '@/components/JsonLd';
import { Stepper } from '@/components/Stepper';
import { projects } from '@/content/projects';
import { absoluteUrl } from '@/content/site';
import { pageMeta, PERSON_ID } from '@/lib/seo';
import s from '../../mirror.module.css';

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

  return (
    <PanelFrame slug={p.slug} title={p.name} kicker="The Builder’s Cluster">
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
      <div className={s.stack}>
        <p className="body-l">{p.description}</p>
        <ul className={s.pills}>
          {p.repo && <li><a className={`label ${s.pill}`} href={p.repo}>Repository ↗</a></li>}
          {p.live && <li><a className={`label ${s.pill}`} href={p.live.url}>{p.live.label} ↗</a></li>}
        </ul>
        <h2 className="heading">Built with</h2>
        <ul className={`mono-body ${s.chips}`}>
          {p.tech.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </div>
      <Stepper items={projects} index={index} label="The Builder’s Cluster" toItem={(x) => ({ href: `/projects/${x.slug}`, name: x.name })} />
    </PanelFrame>
  );
}
