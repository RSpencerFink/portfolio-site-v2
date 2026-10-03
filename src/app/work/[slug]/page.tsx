import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PanelFrame } from '@/components/panels/PanelFrame';
import { Insignia } from '@/components/Insignia';
import { JsonLd } from '@/components/JsonLd';
import { Stepper } from '@/components/Stepper';
import { jobs } from '@/content/work';
import { person } from '@/content/site';
import { organizationLd, pageMeta, PERSON_ID } from '@/lib/seo';
import s from '../../mirror.module.css';

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

  return (
    <PanelFrame slug={job.slug} title={job.company} kicker="Constellation of Work">
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
      <div className={s.stack}>
        <div className={s.row}>
          <Insignia job={job} size={44} />
          <div>
            <p className="body-strong">{job.title}</p>
            <p className="label-s">{job.dates}</p>
          </div>
        </div>
        {job.roles.length > 1 && (
          <ul className={s.stack}>
            {job.roles.map((r) => (
              <li key={r.title} className="label">{r.title} · {r.months}</li>
            ))}
          </ul>
        )}
        {job.roles.length === 1 && <p className="label">{job.roles[0].months}</p>}
        {job.description && <p className="body-l">{job.description}</p>}
        {job.sections.map((sec, i) => (
          <section key={sec.heading ?? i} className={s.stack}>
            {sec.heading && <h2 className="heading">{sec.heading}</h2>}
            <ul className={`body-l ${s.bullets}`}>
              {sec.bullets.map((b) => (
                <li key={b.text}>
                  {b.lead && <strong className="body-strong">{b.lead}: </strong>}
                  {b.text}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <Stepper items={jobs} index={index} label="Constellation of Work" toItem={(j) => ({ href: `/work/${j.slug}`, name: j.company })} />
    </PanelFrame>
  );
}
