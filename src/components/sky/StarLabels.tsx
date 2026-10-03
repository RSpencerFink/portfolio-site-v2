'use client';

import { useEffect, ViewTransition } from 'react';
import { Insignia } from '@/components/Insignia';
import { SkyLink } from '@/components/panels/SkyLink';
import { education, person } from '@/content/site';
import { jobs } from '@/content/work';
import { projects } from '@/content/projects';
import { paintings } from '@/content/paintings';
import { cameraRig, type Vec3 } from './cameraRig';
import { labelLevel, overviewPose, pxPerUnit, type ChartLayout, type ChartStar } from './chart';
import { hoverStore } from './hover';
import type { FrameInfo } from './Scene';
import s from './SkyHost.module.css';

const LEFT = new Set(['hypha', 'prizm-imagery', 'walter-white', 'concord']);

function sublineFor(star: ChartStar): string | undefined {
  const job = jobs.find((j) => j.slug === star.id);
  if (job) return job.dates;
  const project = projects.find((p) => p.slug === star.id);
  if (project) return project.live ? (project.live.label.includes('npm') ? 'npm' : 'Live site') : 'Repository';
  const painting = paintings.find((p) => p.slug === star.id);
  if (painting) return painting.size;
  const school = education.find((e) => e.slug === star.id);
  if (school) return school.dates;
  if (star.id === 'observer') return 'You are here · About';
}

/* ------------------------------------------------------------------------ */
/* Imperative sync: the scene calls syncLabels() once per rendered frame.     */

const nodes = new Map<string, HTMLElement>();
const reg = (key: string) => (el: HTMLElement | SVGSVGElement | null) => {
  if (el) nodes.set(key, el as HTMLElement);
  else nodes.delete(key);
};
let last = { focus: '' as string | null, focal: '', hover: '' as string | null, level: '', mask: '', overview: '', stage: '' };

function place(el: HTMLElement | undefined, world: Vec3, f: FrameInfo, margin = 80) {
  if (!el) return null;
  const [nx, ny, nz] = f.project(world);
  const x = ((nx + 1) / 2) * f.width;
  const y = ((1 - ny) / 2) * f.height;
  const on = nz < 1 && x > -margin && x < f.width + margin && y > -margin && y < f.height + margin;
  el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  el.style.visibility = on ? '' : 'hidden';
  return [x, y] as const;
}

const setAttr = (el: Element | undefined, name: string, value: string | null) => {
  if (!el) return;
  if (value === null) el.removeAttribute(name);
  else el.setAttribute(name, value);
};

export function syncLabels(f: FrameInfo, chart: ChartLayout) {
  const root = nodes.get('root');
  if (!root) return;
  const ppu = pxPerUnit(f.pose, f.height);
  const level = f.resolved.quiet ? 'hidden' : labelLevel(chart, ppu, f.height);
  const mask = f.resolved.mask.opacity > 0.01 ? 'on' : 'off';
  const overviewPpu = pxPerUnit(overviewPose(chart, f.width / f.height), f.height);
  // Zoomed in on H3 (T18) still counts as the chart: pole mark and ticks stay.
  const zoomed = cameraRig.getState().view.zoom > 1;
  const overview = mask === 'off' && !f.resolved.quiet && (zoomed || ppu < overviewPpu * 1.3) ? 'on' : 'off';
  if (level !== last.level) root.dataset.level = last.level = level;
  if (mask !== last.mask) root.dataset.mask = last.mask = mask;
  if (overview !== last.overview) root.dataset.overview = last.overview = overview;
  const stage = f.resolved.stage ? 'on' : 'off';
  if (stage !== last.stage) root.dataset.section = last.stage = stage;

  for (const star of chart.stars) place(nodes.get(`star:${star.id}`), star.world, f);
  for (const n of chart.names) place(nodes.get(`name:${n.id}`), n.world, f, 400);

  const pole = nodes.get('pole');
  if (place(pole, chart.pole, f, 400) && pole) pole.style.setProperty('--pole-w', `${(chart.poleSize[0] * ppu).toFixed(1)}px`);

  const [px, py] = chart.pole;
  const { w, h } = chart.plane;
  const step = w * 0.104;
  const ticks: [string, Vec3][] = [
    ['ra-12', [-w / 2 + 0.3, py, 0]],
    ['ra-00', [w / 2 - 0.3, py, 0]],
    ['ra-18', [px, h / 2 - 0.18, 0]],
    ['ra-06', [px, -h / 2 + 0.15, 0]],
    ['dec-80', [px + step * 1.25, py, 0]],
    ['dec-60', [px + step * 2.15, py, 0]],
    ['dec-40', [px + step * 3.15, py, 0]],
    ['dec-20', [px + step * 4.25, py, 0]],
  ];
  for (const [id, world] of ticks) place(nodes.get(`tick:${id}`), world, f, 0);

  // Focus reticle (current / focal) and hover ring. Changing star restarts the draw.
  const focus = f.resolved.focusId;
  const hover = hoverStore.get();
  const reticle = nodes.get('reticle');
  const ring = nodes.get('hover');
  const fs = focus ? chart.byId.get(focus) : undefined;
  if (reticle) {
    if (fs) place(reticle, fs.world, f);
    else reticle.style.visibility = 'hidden';
    setAttr(reticle, 'data-variant', f.resolved.focal ? 'focal' : 'current');
  }
  const focal = f.resolved.focal ? 'focal' : '';
  if (focus !== last.focus || focal !== last.focal) {
    if (last.focus) setAttr(nodes.get(`star:${last.focus}`), 'data-focus', null);
    if (focus) setAttr(nodes.get(`star:${focus}`), 'data-focus', focal);
    if (focus !== last.focus) redraw(reticle);
    last.focus = focus;
    last.focal = focal;
  }
  const hs = hover && hover !== focus ? chart.byId.get(hover) : undefined;
  if (ring) {
    if (hs) place(ring, hs.world, f);
    else ring.style.visibility = 'hidden';
  }
  if (hover !== last.hover) {
    redraw(hs ? ring : undefined);
    last.hover = hover;
  }
}

/** Restart the stroke-dashoffset draw (T14). */
function redraw(el: HTMLElement | undefined) {
  if (!el) return;
  el.removeAttribute('data-drawn');
  void el.getBoundingClientRect();
  requestAnimationFrame(() => el.setAttribute('data-drawn', ''));
}

/** Reset cached attributes when the overlay remounts (layout change). */
export const resetLabels = () => {
  last = { focus: '', focal: '', hover: '', level: '', mask: '', overview: '', stage: '' };
};

/* ------------------------------------------------------------------------ */

/**
 * HTML labels over the canvas: crisp text, insignia, reticles, pole mark and
 * RA/Dec ticks, positioned from the camera every frame. Links are pointer
 * targets only (tabIndex −1): the host is aria-hidden and the page's HTML
 * mirror carries the accessible star links.
 *
 * Each linked marker shares `star-<slug>` with its panel's header dot (T7).
 * The marker for the open path unmounts in the same commit the panel mounts,
 * so React pairs the two and the star morphs into the dot (and back on close).
 */
export function StarLabels({ chart, openPath }: { chart: ChartLayout; openPath: string }) {
  const hover = (id: string | null) => () => hoverStore.set(id);
  // The clicked marker unmounts without a pointerleave (it becomes the panel's dot): drop its hover.
  useEffect(() => () => hoverStore.set(null), [openPath]);
  return (
    <div ref={reg('root')} className={s.labels} data-layout={chart.layout}>
      {chart.names.map((n) => (
        <div key={n.id} ref={reg(`name:${n.id}`)} className={s.anchor}>
          <div className={s.cname}>
            <span className={s.cnameTitle}>{n.name}</span>
            <span className="label-s">{n.subline}</span>
          </div>
        </div>
      ))}

      <div ref={reg('pole')} className={`${s.anchor} ${s.pole}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG mark sized per frame */}
        <img src="/logo/rsf-mark.svg" alt="" className={s.poleMark} />
        <div className={s.cartouche}>
          <span className={s.cartoucheName}>{person.name}</span>
          <span className="label-s">Software Engineer</span>
        </div>
      </div>

      {[
        ['ra-12', 'RA 12h'], ['ra-00', 'RA 00h'], ['ra-18', 'RA 18h'], ['ra-06', 'RA 06h'],
        ['dec-80', '+80°'], ['dec-60', '+60°'], ['dec-40', '+40°'], ['dec-20', '+20°'],
      ].map(([id, text]) => (
        <div key={id} ref={reg(`tick:${id}`)} className={`${s.anchor} ${s.tick}`} data-tick={id}>
          <span>{text}</span>
        </div>
      ))}

      {chart.stars.map((star) => {
        const job = jobs.find((j) => j.slug === star.id);
        const sub = sublineFor(star);
        const inner = (
          <>
            <span className={s.hit} />
            <span className={s.text}>
              {job && <Insignia job={job} size={28} />}
              <span className={s.words}>
                <span className={s.starName}>{star.name}</span>
                {sub && <span className={s.sub}>{sub}</span>}
              </span>
            </span>
          </>
        );
        const props = {
          ref: reg(`star:${star.id}`),
          className: s.marker,
          'data-side': LEFT.has(star.id) ? 'left' : 'right',
          'data-observer': star.id === 'observer' ? '' : undefined,
          'data-group': star.group,
          onPointerEnter: hover(star.id),
          onPointerLeave: hover(null),
          onClick: hover(null),
        };
        if (star.href === openPath) return null;
        return star.href ? (
          <ViewTransition key={star.id} name={`star-${star.id}`} share="vt-morph" default="none">
            <SkyLink href={star.href} tabIndex={-1} {...props}>
              {inner}
            </SkyLink>
          </ViewTransition>
        ) : (
          <div key={star.id} {...props}>
            {inner}
          </div>
        );
      })}

      <svg ref={reg('reticle')} className={s.reticle} viewBox="-90 -90 180 180" width="180" height="180" aria-hidden="true">
        <circle className={s.ringSmall} r="8" pathLength={1} />
        <g className={s.focal}>
          <circle className={s.ring} r="34" pathLength={1} />
          <circle className={s.ringDashed} r="52" />
          <path className={s.ticks} d="M0 -78V-68M0 68V78M-78 0H-68M68 0H78" />
        </g>
      </svg>
      <svg ref={reg('hover')} className={s.reticle} viewBox="-90 -90 180 180" width="180" height="180" aria-hidden="true">
        <circle className={s.ring} r="14" pathLength={1} />
        <circle className={s.ringDashed} r="20" />
      </svg>
    </div>
  );
}
