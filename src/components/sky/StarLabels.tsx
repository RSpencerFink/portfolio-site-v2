'use client';

import { Insignia } from '@/components/Insignia';
import { SkyLink } from '@/components/panels/SkyLink';
import { education } from '@/content/site';
import { jobs } from '@/content/work';
import { projects } from '@/content/projects';
import { cameraRig, type Vec3 } from './cameraRig';
import { labelLevel, MARK_H, MARK_W, markPath, markShare, overviewPose, pxPerUnit, type ChartLayout, type ChartStar } from './chart';
import { hoverStore } from './hover';
import { DoorLink, doorFound, doorStore } from './Door';
import type { FrameInfo } from './Scene';
import s from './SkyHost.module.css';

// Every label reads left of its star except Brava (the arrow's tip) and the lodestar.
const LEFT = new Set(['hypha', 'meta', 'dbox', 'prizm-imagery', 'georgia-tech', 'app-academy', 'emerson-college', 'observer']);

function sublineFor(star: ChartStar): string | undefined {
  const job = jobs.find((j) => j.slug === star.id);
  if (job) return job.dates;
  const project = projects.find((p) => p.slug === star.id);
  if (project) return `${project.kind} · ${project.status}`;
  const school = education.find((e) => e.slug === star.id);
  if (school) return school.dates;
  if (star.id === 'observer') return 'About';
}

/* ------------------------------------------------------------------------ */
/* Imperative sync: the scene calls syncLabels() once per rendered frame.     */

const nodes = new Map<string, HTMLElement>();
const reg = (key: string) => (el: HTMLElement | SVGSVGElement | null) => {
  if (el) nodes.set(key, el as HTMLElement);
  else nodes.delete(key);
};
let lastScale = 1;
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

/*
 * H1: the letterbox leaves the sky outside the letters at ~14 %, so a label there reads as clutter.
 * Labels whose anchor or text ends fall outside the RSF letterforms (rsf-mark.svg at the letterbox's current
 * transform) fade with the letterbox instead. Per-element opacity, never a CSS mask (flicker, item 4).
 */
/** The letters rasterised once at 1 px per viewBox unit (alpha); a lookup is cheap enough to test whole label boxes every frame. */
let mark: { alpha: Uint8ClampedArray; w: number; h: number } | null = null;
let markRequested = false;
function loadMark() {
  if (markRequested) return;
  markRequested = true;
  markPath().then((d) => {
    const canvas = document.createElement('canvas');
    const [w, h] = [Math.ceil(MARK_W), Math.ceil(MARK_H)];
    Object.assign(canvas, { width: w, height: h });
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!d || !ctx) return;
    ctx.fill(new Path2D(d));
    const rgba = ctx.getImageData(0, 0, w, h).data;
    const alpha = new Uint8ClampedArray(w * h);
    for (let i = 0; i < alpha.length; i++) alpha[i] = rgba[i * 4 + 3];
    mark = { alpha, w, h };
    // Ask for a frame (the loop runs on demand under reduced motion), so the labels get their first verdict now.
    cameraRig.setAmbient(cameraRig.getState().ambient);
  });
}

/** Is screen point (x, y) inside the letters? Mirrors `.letterbox` in SkyHost.module.css. */
function insideMark(x: number, y: number, f: FrameInfo) {
  if (!mark) return false;
  const markW = f.width * markShare(f.width / f.height);
  const scale = f.resolved.mask.scale;
  const ox = f.width / 2 + markW * 0.02;
  const oy = f.height / 2;
  const lx = ox + (x - ox) / scale - (f.width - markW) / 2;
  const ly = oy + (y - oy) / scale - (f.height - (markW * MARK_H) / MARK_W) / 2;
  const k = MARK_W / markW;
  const px = Math.floor(lx * k);
  const py = Math.floor(ly * k);
  return px >= 0 && py >= 0 && px < mark.w && py < mark.h && mark.alpha[py * mark.w + px] > 127;
}

/** A label's text box as offsets from its anchor [left, right, top, bottom], measured once (the text never changes). */
const spans = new Map<HTMLElement, [number, number, number, number]>();
function spanOf(el: HTMLElement) {
  let span = spans.get(el);
  if (!span) {
    const a = el.getBoundingClientRect();
    const t = el.querySelector(`.${s.text}, .${s.cname}`)?.getBoundingClientRect();
    if (!t?.width) return [0, 0, 0, 0] as const; // not laid out yet: the anchor alone, measure again next frame
    span = [t.left - a.left, t.right - a.left, t.top - a.top, t.bottom - a.top];
    spans.set(el, span);
  }
  return span;
}

/** The anchor and the label's whole text box (a grid every ≤ 4 px), so a label never straddles a counter or a gap. */
function labelInside(x: number, y: number, el: HTMLElement, f: FrameInfo) {
  if (!insideMark(x, y, f)) return false;
  const [l, r, t, b] = spanOf(el);
  const cols = Math.max(1, Math.ceil((r - l) / 4));
  for (const dy of [t, (t + b) / 2, b]) for (let i = 0; i <= cols; i++) if (!insideMark(x + l + ((r - l) * i) / cols, y + dy, f)) return false;
  return true;
}

const outside = new Map<HTMLElement, string>();
/** Settled in/out verdict per label, and a candidate that must hold for HOLD frames before it replaces it. */
const verdicts = new Map<HTMLElement, { inside: boolean; next: boolean; frames: number }>();
const HOLD = 6;
/**
 * Fade a label with the letterbox unless its anchor and its whole text box are inside the letters.
 * Hysteresis: a new verdict must hold for HOLD frames, and none is taken while the mask is scaling fast
 * (`frozen`), so a label near a letter edge never flickers in and out; the change itself eases (CSS).
 */
function letterFade(el: HTMLElement | undefined, at: readonly [number, number] | null, f: FrameInfo, fade: string | null, frozen: boolean) {
  if (!el) return;
  let inside = true;
  if (fade === null || !at) verdicts.delete(el);
  else if (!mark) inside = false; // no verdict until the letters have loaded
  else {
    const v = verdicts.get(el);
    if (!v) {
      inside = labelInside(at[0], at[1], el, f);
      verdicts.set(el, { inside, next: inside, frames: 0 });
    } else {
      if (!frozen) {
        const now = labelInside(at[0], at[1], el, f);
        v.frames = now === v.inside ? 0 : now === v.next ? v.frames + 1 : 1;
        v.next = now;
        if (v.frames >= HOLD) v.inside = now;
      }
      inside = v.inside;
    }
  }
  const value = inside ? '' : (fade ?? '');
  if ((outside.get(el) ?? '') === value) return;
  outside.set(el, value);
  el.style.opacity = value;
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
  // A panel reads over the sky: no labels, names or pole mark behind its column (bare); the focal reticle stays.
  const level = f.resolved.quiet || f.resolved.bare ? 'hidden' : labelLevel(chart, ppu, f.height);
  const mask = f.resolved.mask.opacity > 0.01 ? 'on' : 'off';
  const overviewPpu = pxPerUnit(overviewPose(chart, f.width / f.height), f.height);
  // Zoomed in on H3 (T18) still counts as the chart: the pole mark stays.
  const zoomed = cameraRig.getState().view.zoom > 1;
  const overview = mask === 'off' && !f.resolved.quiet && !f.resolved.bare && (zoomed || ppu < overviewPpu * 1.3) ? 'on' : 'off';
  if (level !== last.level) root.dataset.level = last.level = level;
  if (mask !== last.mask) root.dataset.mask = last.mask = mask;
  if (overview !== last.overview) {
    root.dataset.overview = last.overview = overview;
    // The pole mark is on screen: the header's RSF mark steps aside (one mark at a time).
    document.documentElement.toggleAttribute('data-pole', overview === 'on');
  }
  const stage = f.resolved.stage ? 'on' : 'off';
  if (stage !== last.stage) root.dataset.section = last.stage = stage;

  // Landscape only: portrait already hides every label while the mask is up (SkyHost.module.css).
  const masked = mask === 'on' && chart.layout !== 'portrait';
  if (masked) loadMark();
  const fade = masked ? (1 - f.resolved.mask.opacity).toFixed(2) : null;
  // Mask scale change since the last frame as a share of the scale: above 1.5 % the verdicts hold still.
  const frozen = Math.abs(f.resolved.mask.scale - lastScale) / f.resolved.mask.scale > 0.015;
  lastScale = f.resolved.mask.scale;
  for (const star of chart.stars) {
    const el = nodes.get(`star:${star.id}`);
    letterFade(el, place(el, star.world, f), f, fade, frozen);
  }
  for (const n of chart.names) {
    const el = nodes.get(`name:${n.id}`);
    letterFade(el, place(el, n.world, f, 400), f, fade, frozen);
  }

  // The door: one unlabelled marker at its centre; found when the pointer, a tap, the zoomed view or focus comes near.
  doorStore.set(doorFound(place(nodes.get('door'), chart.door, f), f.width, f.height));

  const pole = nodes.get('pole');
  if (place(pole, chart.pole, f, 400) && pole) pole.style.setProperty('--pole-w', `${(chart.poleSize[0] * ppu).toFixed(1)}px`);

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
  outside.clear();
  verdicts.clear();
  spans.clear();
  last = { focus: '', focal: '', hover: '', level: '', mask: '', overview: '', stage: '' };
};

/* ------------------------------------------------------------------------ */

/**
 * HTML labels over the canvas: crisp text, insignia, reticles and the pole
 * mark, positioned from the camera every frame. Links are pointer
 * targets only (tabIndex −1): the host is aria-hidden and the page's HTML
 * mirror carries the accessible star links.
 */
export function StarLabels({ chart }: { chart: ChartLayout }) {
  const hover = (id: string | null) => () => hoverStore.set(id);
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
      </div>

      {chart.stars.map((star) => {
        if (star.helper || star.door) return null;
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
          'data-lodestar': star.lodestar ? '' : undefined,
          'data-group': star.group,
          onPointerEnter: hover(star.id),
          onPointerLeave: hover(null),
          onClick: hover(null),
        };
        return star.href ? (
          <SkyLink key={star.id} href={star.href} tabIndex={-1} {...props}>
            {inner}
          </SkyLink>
        ) : (
          <div key={star.id} {...props}>
            {inner}
          </div>
        );
      })}

      {/* No text, ever: a 64 px target over the door's stars (spec §12b). The mirror's DoorLink carries the name. */}
      <DoorLink ref={reg('door')} tabIndex={-1} className={s.door}>
        <span className={s.doorHit} />
      </DoorLink>

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
