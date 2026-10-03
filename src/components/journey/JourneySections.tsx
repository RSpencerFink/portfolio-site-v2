import type { CSSProperties } from 'react';
import { SkyLink } from '@/components/panels/SkyLink';
import { Insignia } from '@/components/Insignia';
import { HALO } from '@/components/sky/types';
import type { SpectralClass } from '@/components/sky/types';
import { education, person, resume } from '@/content/site';
import { jobs } from '@/content/work';
import { projects } from '@/content/projects';
import { constellations } from '@/content/sky';
import j from './Journey.module.css';

const c = Object.fromEntries(constellations.map((k) => [k.id, k]));
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * CSS stand-in for the canvas focal star (spec §4: 14 px core, tinted glow,
 * 34 px reticle with N/E/S/W ticks). Hidden once the sky track sets
 * `<html data-sky="live">`, and in the static layout.
 */
function FocalStar({ spectral }: { spectral: SpectralClass }) {
  return (
    <div className={j.focal} style={{ '--tint': HALO[spectral] } as CSSProperties} aria-hidden="true">
      <span className={j.reticle} />
      <span className={j.core} />
    </div>
  );
}

/** Desktop: rail of buttons on the right edge. Mobile: dot row + counter at the bottom (spec §6 ProgressRail). */
function Rail({ label, items, offset, hint }: { label: string; items: string[]; offset: number; hint: string }) {
  return (
    <div className={`${j.rail} ${j.motionOnly}`} data-rail>
      <p className={`label ${j.hint}`} aria-hidden="true">{hint}</p>
      <nav aria-label={label}>
        <ol>
          {items.map((name, i) => (
            <li key={name}>
              <button type="button" className={`label-s ${j.tick}`} data-dwell={i + offset} aria-current={i === 0 ? 'step' : undefined}>
                <span className={j.tickLabel}>{name}</span>
                <span className={j.mark} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <p className={`label ${j.counter}`} aria-hidden="true" data-counter>
        01 / {pad(items.length)}
      </p>
    </div>
  );
}

/**
 * The home journey (spec §1 rows 1–8): hero, Constellation of Work, Builder's
 * Cluster, hand-off to the chart. Real HTML in every mode. Without JS or under
 * reduced motion it is the static R3 · RM layout; <HomeJourney/> sets
 * `<html data-journey="pinned|mobile">` and drives it with ScrollTrigger.
 * Each `[data-slide]` is one resting state ("dwell") of its stage.
 */
export function JourneySections() {
  return (
    <div id="journey" className={j.journey}>
      <section id="hero" className={j.hero} aria-labelledby="hero-title">
        <div className={`${j.heroSky} ${j.fallback}`} aria-hidden="true" data-mask />
        <div className={`${j.mask} ${j.fallback}`} aria-hidden="true" data-mask />
        <div className={j.heroText} data-hero-fade>
          <h1 id="hero-title" className={`label ${j.heroName}`}>{person.name}</h1>
          <p className="label-s">{person.identities.join(' · ')}</p>
        </div>
        <p className={`label ${j.enter}`} aria-hidden="true" data-hero-fade>
          Scroll to enter ↓
        </p>
      </section>

      <section id="work" className={j.section} aria-labelledby="work-title">
        <div className={j.stage} data-stage="work" data-offset="0">
          <header className={`${j.layer} ${j.complete}`} data-slide="5" data-target="work" tabIndex={-1}>
            <h2 id="work-title" className="display-l">{c.work.name}</h2>
            <p className="label">{c.work.subline}</p>
            <p>
              <a className={`label ${j.pill}`} href={resume.href}>{resume.label} ↓</a>
            </p>
          </header>

          <ol className={j.slides}>
            {jobs.map((job, i) => {
              const dense = job.sections.length > 0;
              return (
                <li key={job.slug} className={`${j.layer} ${j.slide}`} data-slide={i} data-target={job.slug} data-dense={dense || undefined} tabIndex={-1} aria-labelledby={`job-${job.slug}`}>
                  <FocalStar spectral={job.star.spectral} />
                  <article className={j.content}>
                    {!dense && <Insignia job={job} size={64} />}
                    {job.current && <p className={`label ${j.kicker}`}>Now</p>}
                    <h3 id={`job-${job.slug}`} className={`display-xl ${j.title}`}>
                      <SkyLink href={`/work/${job.slug}`}>{job.company}</SkyLink>
                      {dense && <Insignia job={job} size={56} />}
                    </h3>
                    <p className="label">
                      {job.title} · {job.dates}
                    </p>
                    {job.description && <p className={`body-l ${j.lede}`}>{job.description}</p>}
                    {dense && (
                      <div className={j.columns}>
                        {job.sections.map((sec, k) => (
                          <div key={sec.heading ?? k}>
                            {sec.heading && <h4 className={`heading ${j.colHead}`}>{sec.heading}</h4>}
                            <ul className={j.bullets}>
                              {sec.bullets.map((b) => (
                                <li key={b.text}>
                                  {b.lead && <p className="body-strong">{b.lead}</p>}
                                  <p className="body-l">{b.text}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                </li>
              );
            })}
          </ol>

          <div className={`${j.layer} ${j.origins}`} data-slide="5">
            <h3 className="heading">{c.origins.name}</h3>
            <p className="label">{c.origins.subline}</p>
            <ul>
              {education.map((e) => (
                <li key={e.slug}>
                  <p className="body-strong">{e.name}</p>
                  <p className="label-s">
                    {e.location} · {e.dates}
                  </p>
                  <p className="body">{e.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <Rail label={`${c.work.name}: stars`} items={jobs.map((x) => x.company)} offset={0} hint="Scroll to travel ↓" />
        </div>
      </section>

      <section id="projects" className={j.section} aria-labelledby="projects-title">
        <div className={j.stage} data-stage="projects" data-offset="1">
          <header className={`${j.layer} ${j.cluster}`} data-slide="0" data-target="projects" tabIndex={-1}>
            <h2 id="projects-title" className="display-l">{c.projects.name}</h2>
            <p className="label">{c.projects.subline}</p>
          </header>

          <ol className={j.slides}>
            {projects.map((p, i) => (
              <li key={p.slug} className={`${j.layer} ${j.slide}`} data-slide={i + 1} data-target={p.slug} data-dense tabIndex={-1} aria-labelledby={`project-${p.slug}`}>
                <FocalStar spectral={p.star.spectral} />
                <article className={j.content}>
                  <p className={`label ${j.kicker}`}>Project {pad(i + 1)}</p>
                  <h3 id={`project-${p.slug}`} className={`display-xl ${j.title}`} data-long={p.name.length > 12 || undefined}>
                    <SkyLink href={`/projects/${p.slug}`}>{p.name}</SkyLink>
                  </h3>
                  <div className={j.columns}>
                    <div className={j.stack}>
                      <p className={`body-l ${j.lede}`}>{p.description}</p>
                      <ul className={j.pills}>
                        {p.live && (
                          <li>
                            <a className={`label ${j.pill} ${j.pillPrimary}`} href={p.live.url} target="_blank" rel="noopener noreferrer">
                              {p.live.label} ↗
                            </a>
                          </li>
                        )}
                        {p.repo && (
                          <li>
                            <a className={`label ${j.pill}`} href={p.repo} target="_blank" rel="noopener noreferrer">
                              Repository ↗
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className={`heading ${j.colHead}`}>Built with</h4>
                      <ul className={`mono-body ${j.builtWith}`}>
                        {p.tech.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ol>

          <Rail label={`${c.projects.name}: stars`} items={projects.map((x) => x.name)} offset={1} hint="Scroll to travel ↓" />
        </div>
      </section>

      {/* Pull 2 (T6): hand-off to the full chart. Decorative; the chart and its HTML mirror follow. */}
      <div id="chart" className={`${j.handoff} ${j.motionOnly}`} aria-hidden="true">
        <div className={j.handoffInner}>
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG, no optimisation needed */}
          <img src="/logo/rsf.svg" alt="" className={`${j.pole} ${j.fallback}`} data-pole />
          <div className={j.cartouche} data-cartouche>
            <p className="display-s">{person.name}</p>
            <p className="label">{person.identities[0]}</p>
          </div>
          <p className={`label ${j.explore}`} data-cartouche>
            Drag to explore · Click a star
          </p>
        </div>
      </div>
    </div>
  );
}
