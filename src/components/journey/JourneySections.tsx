import type { CSSProperties } from 'react';
import Link from 'next/link';
import { SkyLink } from '@/components/panels/SkyLink';
import { Insignia } from '@/components/Insignia';
import { HALO, type SpectralClass } from '@/components/sky/types';
import { education, person, resume } from '@/content/site';
import { jobs } from '@/content/work';
import { featured } from '@/content/projects';
import { ProjectFacts, ProjectPreview } from '@/components/featured/Featured';
import { constellations } from '@/content/sky';
import j from './Journey.module.css';
import { pad } from '@/lib/format';

const c = Object.fromEntries(constellations.map((k) => [k.id, k]));

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
function Rail({ label, items }: { label: string; items: string[] }) {
  return (
    <div className={`${j.rail} ${j.motionOnly}`} data-rail>
      <p className={`label ${j.hint}`} aria-hidden="true">Scroll to travel ↓</p>
      <nav aria-label={label}>
        <ol>
          {items.map((name, i) => (
            <li key={name}>
              <button type="button" className={`label-s ${j.tick}`} data-dwell={i} aria-current={i === 0 ? 'step' : undefined}>
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
 * The home journey (spec §1 rows 1–8): hero, The Engineer, the
 * featured build, hand-off to the chart. Real HTML in every mode. Without JS or under
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
          <h1 id="hero-title" className="visually-hidden">{person.name}</h1>
        </div>
        <p className={`label ${j.enter}`} aria-hidden="true" data-hero-fade>
          Scroll to enter ↓
        </p>
      </section>

      <section id="work" className={`${j.section} ${j.workSection}`} aria-labelledby="work-title">
        <div className={j.stage} data-stage="work">
          <header className={`${j.layer} ${j.complete}`} data-slide="5" data-target="work" tabIndex={-1}>
            <h2 id="work-title" className="display-l">{c.work.name}</h2>
            <p className="label">{c.work.subline}</p>
            <p>
              <a className={`label ${j.pill}`} href={resume.href} target="_blank" rel="noopener noreferrer">{resume.label} ↓</a>
            </p>
          </header>

          <ol className={j.slides}>
            {jobs.map((job, i) => {
              const dense = job.sections.length > 0;
              return (
                <li key={job.slug} className={`${j.layer} ${j.slide}`} data-slide={i} data-target={job.slug} data-dense={dense || undefined} data-current={job.current || undefined} tabIndex={-1} aria-labelledby={`job-${job.slug}`}>
                  <FocalStar spectral={job.star.spectral} />
                  <article className={j.content}>
                    {/* Focal frames: 64 px above the name, or 56 px beside it in the dense frame. The static list (R3 · RM) uses the first, at 36 px. */}
                    <Insignia job={job} size={64} className={dense ? j.rowOnly : undefined} />
                    {job.current && <p className={`label ${j.kicker}`}>Now</p>}
                    <h3 id={`job-${job.slug}`} className={`display-xl ${j.title}`}>
                      <SkyLink href={`/work/${job.slug}`}>{job.company}</SkyLink>
                      {dense && <Insignia job={job} size={56} className={j.focalOnly} />}
                    </h3>
                    <p className={`label ${j.roleLine}`}>
                      <span className={j.role}>{job.title}</span>
                      <span className={j.sep}> · </span>
                      <span className={j.dates}>{job.dates}</span>
                    </p>
                    {/* A stop taller than the screen: this column scrolls first, then the stepper moves on (stepper.ts). */}
                    <div className={j.scroll} data-scroll tabIndex={0} role="region" aria-label={`${job.company} details`}>
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
                    </div>
                    <p className={`label ${j.more}`} aria-hidden="true">More ↓</p>
                  </article>
                </li>
              );
            })}
          </ol>

          <div id="origins" className={`${j.layer} ${j.origins}`} data-slide="5">
            <h3 className="heading">{c.origins.name}</h3>
            <p className="label">{c.origins.subline}</p>
            <ul>
              {education.map((e) => (
                <li key={e.slug}>
                  <p className="body-strong">{e.name}</p>
                  <p className="label-s">
                    {[e.location, e.dates].filter(Boolean).join(' · ')}
                  </p>
                  <p className="body">{e.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <Rail label={`${c.work.name}: stars`} items={jobs.map((x) => x.company)} />

          {/* R3 · RM: the rest of the sky, as an index beside the Work list (static layout only). */}
          <nav className={`${j.skyIndex} ${j.staticOnly}`} aria-labelledby="sky-index-title">
            <h3 id="sky-index-title" className="label">Sky index</h3>
            <ul className="body-l">
              <li><a href="#projects">{c.projects.name} · {featured.name}</a></li>
              <li><a href="#origins">{c.origins.name} · {education.length} schools</a></li>
              <li><Link href="/about">The Observer · About</Link></li>
            </ul>
          </nav>
        </div>
      </section>

      <section id="projects" className={j.section} aria-labelledby="projects-title">
        {/* Paper R4 · P · Featured — Section-8-Scout: one stop after Work. */}
        <div className={j.stage} data-stage="projects">
          <article className={`${j.layer} ${j.slide} ${j.featured}`} data-slide="0" data-target={featured.slug} tabIndex={-1} aria-labelledby="projects-title">
            <FocalStar spectral={featured.star.spectral} />
            <div className={`${j.content} ${j.stack}`}>
              <p className={`label ${j.kicker}`}>The Builder</p>
              <h2 id="projects-title" className={`display-xl ${j.title}`} data-long>
                <SkyLink href={`/projects/${featured.slug}`}>{featured.name}</SkyLink>
              </h2>
              <ProjectFacts project={featured} />
            </div>
            <div className={j.previewCol}>
              <ProjectPreview project={featured} sizes="(max-width: 768px) 100vw, 34vw" />
            </div>
          </article>
          <p className={`label ${j.hint} ${j.motionOnly}`} aria-hidden="true">Scroll to travel ↓</p>
          <p className={`label ${j.counter} ${j.motionOnly}`} aria-hidden="true">The Builder</p>
        </div>
      </section>

      {/* Pull 2 (T6): hand-off to the full chart. Decorative; the chart and its HTML mirror follow. */}
      <div id="chart" className={`${j.handoff} ${j.motionOnly}`} aria-hidden="true">
        <div className={j.handoffInner}>
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG, no optimisation needed */}
          <img src="/logo/rsf.svg" alt="" className={`${j.pole} ${j.fallback}`} data-pole />
        </div>
      </div>
    </div>
  );
}
