import { constellations, helperStars, POLE_STAR, stars } from '@/content/sky';
import type { Vec3 } from './cameraRig';
import type { ChartPoint, Star } from './types';

/**
 * Chart space. The H3 chart lies on the z = 0 plane; the camera looks down −z.
 * Landscape: 1 world unit = 100 px of the 1440 × 900 artboard (spec §5).
 * Portrait: 1 unit = 50 px of the 390 × 844 mobile artboard, with each
 * constellation re-placed as a group to match R3 · M-H3 (spec §5, last para).
 */
export type Layout = 'landscape' | 'portrait';
export const OVERVIEW_FOV = 62;

const PLANE = {
  landscape: { w: 14.4, h: 9, px: [1440, 900] },
  portrait: { w: 7.8, h: 16.88, px: [390, 844] },
} as const;

// Portrait group placement in mobile-artboard px: [left, top, width] of the group's star bbox.
const PORTRAIT_GROUPS: Record<string, [number, number, number]> = {
  work: [30, 96, 210], // Brava's label keeps ≥ 24 px from the right edge (spec §8)
  projects: [230, 262, 120],
  origins: [24, 500, 150],
  painter: [226, 560, 140],
  filmmaker: [40, 676, 186],
};

// Portrait constellation-name anchors (top-left of the block) in mobile-artboard px, from R3 · M-H3.
const PORTRAIT_NAMES: Record<string, [number, number]> = {
  work: [30, 244],
  projects: [226, 292],
  origins: [24, 612],
  painter: [236, 520],
  filmmaker: [40, 642],
};

const positioned = [...stars.filter((s): s is Star & { position: ChartPoint } => !!s.position), ...helperStars];
const groupOf = new Map<string, string>();
const lodestars = new Set(constellations.map((c) => c.lodestar));
for (const c of constellations) for (const id of [...Object.keys(c.stars), ...Object.keys(c.helpers ?? {})]) groupOf.set(id, c.id);

function portraitTransform(group: string) {
  const pts = positioned.filter((s) => groupOf.get(s.id) === group).map((s) => s.position);
  const xs = pts.map((p) => p[0] * 1440);
  const ys = pts.map((p) => p[1] * 900);
  const [left, top, width] = PORTRAIT_GROUPS[group];
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const span = Math.max(...xs) - minX;
  // A one-star group (the featured build) sits at the centre of its box.
  const s = span ? width / span : 0;
  return (p: ChartPoint): [number, number] => [left + (span ? (p[0] * 1440 - minX) * s : width / 2), top + (p[1] * 900 - minY) * s];
}
const portraitFns = Object.fromEntries(Object.keys(PORTRAIT_GROUPS).map((g) => [g, portraitTransform(g)]));

/** Normalised chart point → world position. `group` re-places it in portrait. */
export function toWorld(p: ChartPoint, layout: Layout, group?: string): Vec3 {
  const plane = PLANE[layout];
  let [x, y] = p;
  if (layout === 'portrait') {
    const [px, py] = group && portraitFns[group] ? portraitFns[group](p) : [p[0] * 390, p[1] * 844];
    x = px / 390;
    y = py / 844;
  }
  return [(x - 0.5) * plane.w, (0.5 - y) * plane.h, 0];
}

export interface ChartStar extends Star {
  world: Vec3;
  group: string;
  /** Extra bright, with a four-point glint (constellation `lodestar`). */
  lodestar?: boolean;
}

export interface ChartLayout {
  layout: Layout;
  stars: ChartStar[];
  byId: Map<string, ChartStar>;
  names: { id: string; name: string; subline: string; world: Vec3 }[];
  pole: Vec3;
  /** Pole star mark size in world units. */
  poleSize: [number, number];
  plane: { w: number; h: number };
}

const cache = new Map<Layout, ChartLayout>();
export function chartLayout(layout: Layout): ChartLayout {
  const hit = cache.get(layout);
  if (hit) return hit;
  const list = positioned.map((s) => {
    const group = groupOf.get(s.id) ?? '';
    return { ...s, group, world: toWorld(s.position, layout, group), lodestar: lodestars.has(s.id) };
  });
  const out: ChartLayout = {
    layout,
    stars: list,
    byId: new Map(list.map((s) => [s.id, s])),
    names: constellations.map((c) => ({
      id: c.id,
      name: c.name,
      subline: c.subline,
      world:
        layout === 'portrait' && PORTRAIT_NAMES[c.id]
          ? toWorld([PORTRAIT_NAMES[c.id][0] / 390, PORTRAIT_NAMES[c.id][1] / 844], layout)
          : toWorld(c.namePosition ?? [0.5, 0.5], layout, c.id),
    })),
    pole: layout === 'portrait' ? [0, -0.35, 0] : toWorld(POLE_STAR.position, layout),
    poleSize: layout === 'portrait' ? [2.2, 1.06] : [POLE_STAR.markSize[0] / 100, POLE_STAR.markSize[1] / 100],
    plane: PLANE[layout],
  };
  cache.set(layout, out);
  return out;
}

export const layoutFor = (w: number, h: number): Layout => (w / h < 1 ? 'portrait' : 'landscape');

/* ------------------------------------------------------------------------ */
/* Poses                                                                    */

export interface Pose {
  pos: Vec3;
  look: Vec3;
  fov: number;
}

const tanHalf = (fov: number) => Math.tan(((fov / 2) * Math.PI) / 180);

/** Camera straight above `look`, showing `h` world units of height. */
function poseAt(look: Vec3, h: number, fov: number): Pose {
  const d = h / 2 / tanHalf(fov);
  return { pos: [look[0], look[1], d], look, fov };
}

/** Put world point `p` at viewport fraction (fx, fy) with `h` units visible. */
export function focus(p: Vec3, h: number, fov: number, aspect: number, fx: number, fy: number): Pose {
  const halfH = h / 2;
  const halfW = halfH * aspect;
  return poseAt([p[0] - (2 * fx - 1) * halfW, p[1] + (2 * fy - 1) * halfH, 0], h, fov);
}

export function overviewPose(c: ChartLayout, aspect: number): Pose {
  const { w, h } = c.plane;
  const fitH = Math.max(h, w / aspect);
  return poseAt([0, 0, 0], fitH * 1.02, OVERVIEW_FOV);
}

/** Visible-height scale of the focal views: desktop ~300 px per unit, portrait ~140. */
export const focalH = (c: ChartLayout) => (c.layout === 'portrait' ? 6 : 3);
/** Panel view (T7): the star centred in the upper middle, above the reading column, closer than H3. */
export function panelPose(c: ChartLayout, id: string, aspect: number): Pose | null {
  const s = c.byId.get(id);
  if (!s) return null;
  return c.layout === 'portrait' ? focus(s.world, 9, 46, aspect, 0.5, 0.15) : focus(s.world, 5.2, 46, aspect, 0.5, 0.2);
}

/** Frame a set of stars inside a viewport box (fx, fy = box centre, frac = share of width). */
export function framePose(c: ChartLayout, ids: string[], aspect: number, fov: number, fx: number, fy: number, frac: number): Pose {
  const pts = ids.map((id) => c.byId.get(id)!.world);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const w = Math.max(...xs) - Math.min(...xs);
  const hh = Math.max(...ys) - Math.min(...ys);
  const h = Math.max(w / frac / aspect, hh / 0.5);
  return focus([cx, cy, 0], h, fov, aspect, fx, fy);
}

/** The overview moved by the H3 explore view (T18): pan the look-at point, dolly in by `zoom`. */
export function explorePose(o: Pose, v: { x: number; y: number; zoom: number }): Pose {
  const look: Vec3 = [o.look[0] + v.x, o.look[1] + v.y, 0];
  return { pos: [look[0], look[1], o.pos[2] / v.zoom], look, fov: o.fov };
}

export function heroPose(c: ChartLayout, aspect: number): Pose {
  // H1: the chart a little closer than H3, so the letters frame Work and the Painter.
  const o = overviewPose(c, aspect);
  const scale = c.layout === 'portrait' ? 0.55 : 0.84;
  const d = o.pos[2] * scale;
  const look: Vec3 = c.layout === 'portrait' ? [0, 2.5, 0] : [0, 1.4, 0];
  return { pos: [look[0], look[1], d], look, fov: OVERVIEW_FOV };
}

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
export const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  pos: lerp3(a.pos, b.pos, t),
  look: lerp3(a.look, b.look, t),
  fov: lerp(a.fov, b.fov, t),
});

/** Screen pixels per world unit at the look-at point. Drives label LOD (T15). */
export const pxPerUnit = (pose: Pose, viewportH: number) => {
  const d = Math.hypot(pose.pos[0] - pose.look[0], pose.pos[1] - pose.look[1], pose.pos[2] - pose.look[2]);
  return viewportH / (2 * d * tanHalf(pose.fov));
};

export type LabelLevel = 'full' | 'names' | 'hidden';
export function labelLevel(c: ChartLayout, ppu: number, viewportH: number): LabelLevel {
  // Normalise by the H3 scale so thresholds hold at any viewport size.
  const zoom = ppu / (viewportH / (c.plane.h * 1.02));
  if (c.layout === 'portrait') return zoom > 2.6 ? 'hidden' : zoom >= 1.6 ? 'full' : 'names';
  // 2.6 keeps labels up at the 2.5× explore limit (T18) and hides them in the W/P focal views (~3×).
  return zoom > 2.6 ? 'hidden' : 'full';
}
