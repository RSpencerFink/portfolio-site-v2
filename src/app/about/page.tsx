import type { Metadata } from 'next';
import { PanelFrame } from '@/components/panels/PanelFrame';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, person, resume, socials, srcSet } from '@/content/site';
import { pageMeta, personLd } from '@/lib/seo';
import s from '../mirror.module.css';

export const metadata: Metadata = {
  ...pageMeta({
    title: 'About',
    description: `${person.name}: ${person.identities.join(' and ')}. ${person.currently}.`,
    path: '/about/',
    image: `${person.headshot.base}_800.jpg`,
    type: 'profile',
  }),
  alternates: { canonical: '/about/', types: { 'application/pdf': resume.href } },
};

export default function AboutPage() {
  const { headshot } = person;
  return (
    <PanelFrame slug="observer" title={person.name} kicker="The Observer">
      <JsonLd data={{ '@type': 'ProfilePage', url: `${SITE_URL}/about/`, mainEntity: personLd() }} />
      <div className={s.stack}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, srcset variants pre-generated */}
        <img
          className={s.media}
          src={`${headshot.base}_800.jpg`}
          srcSet={srcSet(headshot.base)}
          sizes="(max-width: 640px) 100vw, 320px"
          width={headshot.width}
          height={headshot.height}
          style={{ width: 320 }}
          alt={`Portrait of ${person.name}`}
        />
        <p className="label">{person.identities.join(' · ')}</p>
        <p className="body-l">{person.bio}</p>
        <p className="body-l">Currently — {person.currently}</p>
        <h2 className="heading">Reach</h2>
        <ul className={s.pills}>
          {socials.map((x) => (
            <li key={x.label}><a className={`label ${s.pill}`} href={x.url} rel="me noopener">{x.label}</a></li>
          ))}
          <li><a className={`label ${s.pill}`} href={resume.href}>{resume.label}</a></li>
        </ul>
      </div>
    </PanelFrame>
  );
}
