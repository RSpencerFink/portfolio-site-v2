import type { Metadata } from 'next';
import { SkyLink } from '@/components/panels/SkyLink';
import { JourneySections } from '@/components/journey/JourneySections';
import { HomeJourney } from '@/components/journey/HomeJourney';
import { ChartExplore } from '@/components/sky/ChartExplore';
import { DoorLink } from '@/components/sky/Door';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, person } from '@/content/site';
import { jobs } from '@/content/work';
import { projects } from '@/content/projects';
import { constellations, door } from '@/content/sky';
import { pageMeta, personLd, PERSON_ID } from '@/lib/seo';
import s from './mirror.module.css';

export const metadata: Metadata = {
  ...pageMeta({
    title: `${person.name} | CTO & Co-founder, Brava`,
    description: `${person.name} is an engineering leader, currently CTO & Co-founder of Brava. Previously Hypha and Meta.`,
    path: '/',
    type: 'profile',
  }),
  title: { absolute: `${person.name} | CTO & Co-founder, Brava` },
};

const c = Object.fromEntries(constellations.map((k) => [k.id, k]));

function SectionHead({ id, titleId = `${id}-title` }: { id: string; titleId?: string }) {
  return (
    <div className={s.sectionHead}>
      <h2 id={titleId} className="display-l">{c[id].name}</h2>
      <p className="label" style={{ margin: 0 }}>{c[id].subline}</p>
    </div>
  );
}

/** The home sky's HTML mirror: what no-JS visitors, reduced motion and crawlers read (spec §9, §10). */
export default function Home() {
  return (
    <main id="main" style={{ position: 'relative', zIndex: 'var(--z-content)' }}>
      <JsonLd
        data={{
          '@graph': [
            personLd(),
            { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: person.name, publisher: { '@id': PERSON_ID } },
          ],
        }}
      />
      <JourneySections />
      <HomeJourney />

      <div className={s.main}>
        {/*
          Desktop full motion: the journey's Work and Projects stops are hidden
          once their pin has passed, so the chart's keyboard and screen-reader
          index for those stars lives here (spec §9 tab order). Other modes show
          the journey lists themselves, so these stay display:none there.
        */}
        {[
          { id: 'work', items: jobs.map((x) => ({ href: `/work/${x.slug}`, name: x.company, sub: x.dates })) },
          { id: 'projects', items: projects.map((x) => ({ href: `/projects/${x.slug}`, name: x.name, sub: undefined })) },
        ].map(({ id, items }) => (
          // A plain div: the journey's #work / #projects sections already own these region names.
          <div key={id} className={`${s.section} ${s.pinnedOnly}`}>
            <nav aria-label={c[id].name}>
              <SectionHead id={id} titleId={`index-${id}-title`} />
              <ul className={s.chips} style={{ marginTop: 28 }}>
                {items.map((x) => (
                  <li key={x.href} className="mono-body">
                    <SkyLink href={x.href}>{x.name}</SkyLink>
                    {x.sub && <span className={s.sub}> · {x.sub}</span>}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        ))}

        <section className={s.section} aria-labelledby="observer-title">
          <h2 id="observer-title" className="display-l">The Observer</h2>
          <p className="body-l">
            <SkyLink href="/about">{person.name}</SkyLink>: {person.identities.join(' · ')}.
          </p>
        </section>

        {/*
          The door (spec §12b), last in the chart's tab order. Its name is for assistive tech only; on
          screen it is three faint stars (visible where this mirror is: reduced motion, no JS, focus).
        */}
        <DoorLink className={s.door}>
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M5 7 15 12 9 19" />
            <circle cx="5" cy="7" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="19" r="1.5" />
          </svg>
          <span className="visually-hidden">{door.label}</span>
        </DoorLink>
      </div>
      <ChartExplore />
    </main>
  );
}
