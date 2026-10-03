import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PanelFrame } from '@/components/panels/PanelFrame';
import { Insignia } from '@/components/Insignia';
import { JsonLd } from '@/components/JsonLd';
import { jobs } from '@/content/work';
import { person } from '@/content/site';
import { organizationLd, pageMeta, PERSON_ID } from '@/lib/seo';
import e from '@/components/panels/Entity.module.css';
import { pad } from '@/lib/format';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => jobs.map((j) => ({ slug: j.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = jobs.find((j) => j.slug === slug)!;
  return pageMeta({
    title: `${job.company}: ${job.title}, ${job.dates}`,
    description: job.description ?? `${person.name}: ${job.title} at ${job.company}, ${job.dates}.`,
    path: `/work/${job.slug}`,
  });
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const index = jobs.findIndex((j) => j.slug === slug);
  if (index < 0) notFound();
  const job = jobs[index];

  // The chart runs right to left in time: ← is the older star (A2: ← DBOX · 03 / 05 · Hypha →).
  const older = jobs[index + 1];
  const newer = jobs[index - 1];
  let n = 0;

  return (
    <PanelFrame
      slug={job.slug}
      title={job.company}
      kicker={`Star ${pad(index + 1)} / The Engineer`}
      lead={<Insignia job={job} size={56} />}
      prev={older && { href: `/work/${older.slug}`, name: older.company }}
      next={newer && { href: `/work/${newer.slug}`, name: newer.company }}
      counter={`${pad(index + 1)} / ${pad(jobs.length)}`}
      stepLabel="The Engineer"
    >
      <JsonLd
        data={{
          '@graph': [
            organizationLd(job),
            {
              '@type': 'Person',
              '@id': PERSON_ID,
              name: person.name,
              hasOccupation: job.roles.map((r) => ({
                '@type': 'Role',
                roleName: r.title,
                startDate: r.startDate,
                ...(r.endDate && { endDate: r.endDate }),
                [job.current ? 'worksFor' : 'alumniOf']: { '@id': organizationLd(job)['@id'] },
              })),
            },
          ],
        }}
      />
      <div className={e.stack}>
        <p className={e.role}>
          {job.title} · {job.dates}
        </p>
        <ul className={`label-s ${e.roles}`} aria-label="Roles">
          {job.roles.map((r) => (
            <li key={r.title}>
              <span>{r.title}</span>
              <span>{r.months}</span>
            </li>
          ))}
        </ul>
        {job.description && <p className="body-l">{job.description}</p>}
        {job.sections.map((sec, i) => (
          <section key={sec.heading ?? i} className={e.section}>
            {sec.heading && <h2 className="heading">{sec.heading}</h2>}
            <ol className={e.items}>
              {sec.bullets.map((b) => (
                <li key={b.text}>
                  <span className={`label-s ${e.num}`} aria-hidden="true">{pad(++n)}</span>
                  <div>
                    {b.lead && <p className="body-strong">{b.lead}</p>}
                    <p className={e.body}>{b.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </PanelFrame>
  );
}
