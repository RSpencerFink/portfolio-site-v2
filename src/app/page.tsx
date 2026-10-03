import type { Metadata } from 'next';
import { SkyLink } from '@/components/panels/SkyLink';
import { Insignia } from '@/components/Insignia';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, education, person, resume, tech } from '@/content/site';
import { jobs } from '@/content/work';
import { projects } from '@/content/projects';
import { paintings } from '@/content/paintings';
import { films } from '@/content/films';
import { constellations } from '@/content/sky';
import { pageMeta, personLd, PERSON_ID } from '@/lib/seo';
import s from './mirror.module.css';

export const metadata: Metadata = {
  ...pageMeta({
    title: `${person.name} | CTO & Co-founder, Brava`,
    description: `${person.name} is a software engineer and visual artist, currently CTO & Co-founder of Brava. Previously Hypha and Meta.`,
    path: '/',
    type: 'profile',
  }),
  title: { absolute: `${person.name} | CTO & Co-founder, Brava` },
};

const c = Object.fromEntries(constellations.map((k) => [k.id, k]));

function SectionHead({ id }: { id: string }) {
  return (
    <div className={s.sectionHead}>
      <h2 id={`${id}-title`} className="display-l">{c[id].name}</h2>
      <p className="label" style={{ margin: 0 }}>{c[id].subline}</p>
    </div>
  );
}

/** The home sky's HTML mirror: what no-JS visitors, reduced motion and crawlers read (spec §9, §10). */
export default function Home() {
  return (
    <main id="main" className={s.main}>
      <JsonLd
        data={{
          '@graph': [
            personLd(),
            { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: person.name, publisher: { '@id': PERSON_ID } },
          ],
        }}
      />
      {/* #journey wraps the pinned sequences; the scroll track drives journeyProgress from it. */}
      <div id="journey">
        <section className={s.hero} aria-labelledby="hero-title">
          <h1 id="hero-title" className="display-xl">{person.name}</h1>
          <p className="label" style={{ margin: 0 }}>{person.identities.join(' · ')}</p>
          <p className="body-l" style={{ margin: 0 }}>Currently — {person.currently}</p>
        </section>

        <section id="work" className={s.section} aria-labelledby="work-title">
          <nav aria-label={c.work.name}>
            <SectionHead id="work" />
            <ol className={s.list} style={{ marginTop: 28 }}>
              {jobs.map((j) => (
                <li key={j.slug} className={s.row}>
                  <Insignia job={j} size={36} />
                  <div>
                    <SkyLink href={`/work/${j.slug}/`} className="heading">{j.company}</SkyLink>
                    <p className="label">{j.current ? 'Now · ' : ''}{j.title} · {j.dates}</p>
                    {j.description && <p className="body-l">{j.description}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </nav>
          <p><a className={`label ${s.pill}`} href={resume.href}>{resume.label}</a></p>
          <div>
            <h3 className="heading">{c.origins.name}</h3>
            <p className="label">{c.origins.subline}</p>
            <ul className={s.stack} style={{ marginTop: 16 }}>
              {education.map((e) => (
                <li key={e.slug}>
                  <p className="body-strong">{e.name}</p>
                  <p className="label-s">{e.location} · {e.dates}</p>
                  <p className="body">{e.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="projects" className={s.section} aria-labelledby="projects-title">
          <nav aria-label={c.projects.name}>
            <SectionHead id="projects" />
            <ol className={s.list} style={{ marginTop: 28 }}>
              {projects.map((p, i) => (
                <li key={p.slug} className={s.stack}>
                  <p className="label-s">Project {String(i + 1).padStart(2, '0')}</p>
                  <SkyLink href={`/projects/${p.slug}/`} className="heading">{p.name}</SkyLink>
                  <p className="body-l">{p.description}</p>
                  <p className="mono-body">{p.tech.join(' · ')}</p>
                </li>
              ))}
            </ol>
          </nav>
        </section>
      </div>

      <section className={s.section} aria-labelledby="observer-title">
        <h2 id="observer-title" className="display-l">The Observer</h2>
        <p className="body-l">
          <SkyLink href="/about/">{person.name}</SkyLink>: {person.identities.join(' · ')}. You are here.
        </p>
      </section>

      <section className={s.section} aria-labelledby="painter-title">
        <nav aria-label={c.painter.name}>
          <SectionHead id="painter" />
          <ul className={s.chips} style={{ marginTop: 28 }}>
            {paintings.map((p) => (
              <li key={p.slug} className="mono-body"><SkyLink href={`/visual-arts/analog/${p.slug}/`}>{p.title}</SkyLink></li>
            ))}
          </ul>
        </nav>
      </section>

      <section className={s.section} aria-labelledby="filmmaker-title">
        <nav aria-label={c.filmmaker.name}>
          <SectionHead id="filmmaker" />
          <ul className={s.chips} style={{ marginTop: 28 }}>
            {films.map((f) => (
              <li key={f.slug} className="mono-body"><SkyLink href={`/visual-arts/digital/${f.slug}/`}>{f.title}</SkyLink></li>
            ))}
          </ul>
        </nav>
      </section>

      <section className={s.section} aria-labelledby="catalogue-title">
        <h2 id="catalogue-title" className="heading">Star catalogue</h2>
        {tech.map((t) => (
          <div key={t.heading}>
            <h3 className="label">{t.heading}</h3>
            <p className="mono-body">{t.items.join(' · ')}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
