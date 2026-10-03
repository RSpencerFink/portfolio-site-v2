import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PanelFrame } from '@/components/panels/PanelFrame';
import { JsonLd } from '@/components/JsonLd';
import { ProjectFacts, ProjectPreview } from '@/components/featured/Featured';
import { projects } from '@/content/projects';
import { absoluteUrl } from '@/content/site';
import { pageMeta, PERSON_ID } from '@/lib/seo';
import e from '@/components/panels/Entity.module.css';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug)!;
  return pageMeta({ title: `${p.name}: The Builder`, description: p.description, path: `/projects/${p.slug}`, image: p.preview.src });
}

/** The featured build's panel: the journey stop's content with a larger preview. */
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) notFound();

  return (
    <PanelFrame slug={p.slug} title={p.name} kicker="The Builder / Projects">
      <JsonLd
        data={{
          '@type': 'SoftwareApplication',
          name: p.name,
          applicationCategory: 'BrowserApplication',
          operatingSystem: 'Chrome',
          description: p.description,
          url: p.live.url,
          image: absoluteUrl(p.preview.src),
          author: { '@id': PERSON_ID },
          keywords: p.tech.join(', '),
        }}
      />
      <div className={e.stack}>
        <ProjectFacts project={p} />
        <ProjectPreview project={p} sizes="(max-width: 760px) 100vw, 680px" />
      </div>
    </PanelFrame>
  );
}
