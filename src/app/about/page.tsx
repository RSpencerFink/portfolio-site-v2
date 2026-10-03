import type { Metadata } from 'next';
import Image from 'next/image';
import { PanelFrame } from '@/components/panels/PanelFrame';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, education, person, resume, socials } from '@/content/site';
import { LLMS_ALTERNATE, pageMeta, personLd } from '@/lib/seo';
import { Insignia } from '@/components/Insignia';
import { jobs } from '@/content/work';
import e from '@/components/panels/Entity.module.css';

export const metadata: Metadata = {
  ...pageMeta({
    title: 'About',
    description: `${person.name}: ${person.identities.join(' and ')}. ${person.currently}.`,
    path: '/about',
    image: `${person.headshot.base}_800.jpg`,
    type: 'profile',
  }),
  alternates: { canonical: '/about', types: { ...LLMS_ALTERNATE, 'application/pdf': resume.href } },
};

export default function AboutPage() {
  const { headshot } = person;
  const brava = jobs.find((j) => j.current)!;
  return (
    <PanelFrame
      slug="observer"
      title={person.name}
      kicker="The Observer / You are here"
      lead={
        <Image
          className={e.headshot}
          src={`${headshot.base}_800.jpg`}
          sizes="96px"
          width={headshot.width}
          height={headshot.height}
          alt={`Portrait of ${person.name}`}
          priority
        />
      }
      subline={<p className="label" style={{ margin: 0 }}>{person.identities.join(' · ')}</p>}
      next={{ href: `/work/${brava.slug}`, name: 'The Engineer' }}
      counter="/about"
      stepLabel="The Observer"
    >
      <JsonLd data={{ '@type': 'ProfilePage', url: `${SITE_URL}/about`, mainEntity: personLd() }} />
      <div className={e.stack}>
        <p className="body-l">{person.bio}</p>
        <section className={e.stack} style={{ gap: 8 }}>
          <h2 className="label">Currently</h2>
          <p className={`body-l ${e.currently}`}>
            <Insignia job={brava} size={28} />
            {person.currently}
          </p>
        </section>
        <section className={e.stack} style={{ gap: 8 }}>
          <h2 className="label">Education</h2>
          <ul className={e.roles}>
            {education.map((s) => (
              <li key={s.slug}>
                <span>
                  {s.name}
                  <span className="label-s" style={{ display: 'block', marginTop: 2 }}>
                    {s.description}
                  </span>
                </span>
                <span className="label-s">{s.dates}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className={e.stack} style={{ gap: 8 }}>
          <h2 className="label">Reach</h2>
          <ul className={e.pills}>
            {socials.map((x) => (
              <li key={x.label}>
                <a className={`label ${e.pill}`} href={x.url} rel="me noopener">
                  {x.label} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
            <li>
              <a className={`label ${e.pill} ${e.pillStrong}`} href={resume.href}>
                {resume.label} <span aria-hidden="true">↓</span>
              </a>
            </li>
          </ul>
        </section>
      </div>
    </PanelFrame>
  );
}
