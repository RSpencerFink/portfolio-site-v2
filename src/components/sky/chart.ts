import { CatmullRomCurve3, Vector3 } from 'three';
import { constellations, POLE_STAR, stars } from '@/content/sky';
import type { CameraState, Vec3 } from './cameraRig';
import { SEGMENTS, type Segment } from './cameraRig';
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
  work: [40, 100, 190],
  projects: [262, 226, 96],
  origins: [44, 396, 96],
  painter: [226, 540, 128],
  filmmaker: [40, 660, 196],
};

// Portrait constellation-name anchors (top-left of the block) in mobile-artboard px, from R3 · M-H3.
const PORTRAIT_NAMES: Record<string, [number, number]> = {
  work: [40, 196],
  projects: [232, 292],
  origins: [52, 530],
  painter: [230, 482],
  filmmaker: [40, 712],
};

const positioned = stars.filter((s): s is Star & { position: ChartPoint } => !!s.position);
const groupOf = new Map<string, string>();
for (const c of constellations) for (const id of c.starIds) groupOf.set(id, c.id);

function portraitTransform(group: string) {
  const pts = positioned.filter((s) => groupOf.get(s.id) === group).map((s) => s.position);
  const xs = pts.map((p) => p[0] * 1440);
  const ys = pts.map((p) => p[1] * 900);
  const [left, top, width] = PORTRAIT_GROUPS[group];
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const s = width / (Math.max(...xs) - minX);
  return (p: ChartPoint): [number, number] => [left + (p[0] * 1440 - minX) * s, top + (p[1] * 900 - minY) * s];
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
    return { ...s, group, world: toWorld(s.position, layout, group) };
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
function focus(p: Vec3, h: number, fov: number, aspect: number, fx: number, fy: number): Pose {
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
const focalH = (c: ChartLayout) => (c.layout === 'portrait' ? 6 : 3);
const fxFocal = (c: ChartLayout) => (c.layout === 'portrait' ? 0.5 : 0.4);
const fyFocal = (c: ChartLayout) => (c.layout === 'portrait' ? 0.3 : 0.47);

export function starPose(c: ChartLayout, id: string, aspect: number, fov = 38): Pose | null {
  const s = c.byId.get(id);
  return s ? focus(s.world, focalH(c), fov, aspect, fxFocal(c), fyFocal(c)) : null;
}

/** Panel view (T7): star nudged to the left third, closer than H3. */
export function panelPose(c: ChartLayout, id: string, aspect: number): Pose | null {
  const s = c.byId.get(id);
  if (!s) return null;
  return c.layout === 'portrait'
    ? focus(s.world, 9, 46, aspect, 0.5, 0.22)
    : focus(s.world, 5.2, 46, aspect, 0.3, 0.5);
}

/** Frame a set of stars inside a viewport box (fx, fy = box centre, frac = share of width). */
function framePose(c: ChartLayout, ids: string[], aspect: number, fov: number, fx: number, fy: number, frac: number): Pose {
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

export function heroPose(c: ChartLayout, aspect: number): Pose {
  // H1: the chart a little closer than H3, so the letters frame Work and the Painter.
  const o = overviewPose(c, aspect);
  const scale = c.layout === 'portrait' ? 0.55 : 0.84;
  const d = o.pos[2] * scale;
  const look: Vec3 = c.layout === 'portrait' ? [0, 2.5, 0] : [0, 1.4, 0];
  return { pos: [look[0], look[1], d], look, fov: OVERVIEW_FOV };
}

/* ------------------------------------------------------------------------ */
/* Journey                                                                  */

const WORK = ['brava', 'hypha', 'meta', 'dbox', 'prizm-imagery'];
const PROJECTS = ['section-8-scout', 'freecast', 'react-dynamic-image', 'concord', 'react-2048', 'brickbreaker'];
const total = SEGMENTS.reduce((a, [, vh]) => a + vh, 0);

/** Global journey progress → segment + local 0–1 (spec §7 vh table). */
export function segmentAt(progress: number): [Segment, number] {
  let at = Math.min(Math.max(progress, 0), 1) * total;
  for (const [seg, vh] of SEGMENTS) {
    if (at <= vh) return [seg, at / vh];
    at -= vh;
  }
  return ['pull2', 1];
}

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  pos: lerp3(a.pos, b.pos, t),
  look: lerp3(a.look, b.look, t),
  fov: lerp(a.fov, b.fov, t),
});

/** H1 → H2 mask (T2): scale 1 → 2.2 (0–60 vh) → 6.4 (60–140 vh); opacity 1 → 0 (187–220 vh). */
export function heroMask(seg: Segment, t: number) {
  if (seg !== 'hero') return { scale: 6.4, opacity: 0 };
  const vh = t * 220;
  const scale = vh < 60 ? lerp(1, 2.2, easeInOut(vh / 60)) : lerp(2.2, 6.4, easeInOut(clamp01((vh - 60) / 80)));
  return { scale, opacity: 1 - clamp01((vh - 187) / 33) };
}

/**
 * A star-to-star pinned sequence (T3/T4): per stop interval, content exits
 * (0–20%), the camera travels a CatmullRom path (20–70%), then holds.
 */
function travel(poses: Pose[], ids: string[], t: number) {
  const n = poses.length - 1;
  const i = Math.min(Math.floor(t * n), n - 1);
  const e = easeInOut(clamp01((t * n - i - 0.2) / 0.5));
  const curve = new CatmullRomCurve3(poses.map((p) => new Vector3(...p.look)));
  const look = curve.getPoint((i + e) / n);
  const pose = lerpPose(poses[i], poses[i + 1], e);
  const dLook: Vec3 = [look.x - pose.look[0], look.y - pose.look[1], 0];
  return {
    pose: { ...pose, look: [look.x, look.y, 0] as Vec3, pos: [pose.pos[0] + dLook[0], pose.pos[1] + dLook[1], pose.pos[2]] as Vec3 },
    focusId: ids[Math.min(e < 0.5 ? i : i + 1, ids.length - 1)],
    /** 1 when parked on a stop (reticle drawn), 0 mid-travel. */
    arrived: e < 0.05 || e > 0.95 ? 1 : 0,
  };
}

export interface Resolved {
  pose: Pose;
  focusId: string | null;
  /** Focal (W/P/panel) styling vs the small H3 "current" ring. */
  focal: boolean;
  mask: { scale: number; opacity: number };
  /** 0–1 extra nebula-core glow inside the mark (H1/H2). */
  heroGlow: number;
  /** Backdrop only (a full page off the home route): no labels, no pole mark. */
  quiet?: boolean;
}

/** Where the camera wants to be for this rig state. Pure; the scene damps toward it. */
export function resolve(state: CameraState, c: ChartLayout, aspect: number, isHome: boolean, onHomeRoute = isHome): Resolved {
  const overview = overviewPose(c, aspect);
  const noMask = { scale: 6.4, opacity: 0 };
  const { target } = state;
  if (target && target !== 'overview' && typeof target === 'object') {
    return { pose: { pos: target.position, look: target.lookAt, fov: 46 }, focusId: null, focal: false, mask: noMask, heroGlow: 0 };
  }
  if (typeof target === 'string' && target !== 'overview') {
    const pose = panelPose(c, target, aspect);
    if (pose) return { pose, focusId: target, focal: true, mask: noMask, heroGlow: 0 };
  }
  if (target === 'overview' || !isHome) {
    return { pose: overview, focusId: target ? 'brava' : null, focal: false, mask: noMask, heroGlow: 0, quiet: !target && !onHomeRoute };
  }

  const [seg, t] = segmentAt(state.progress);
  const mask = state.mask ?? heroMask(seg, t);
  const workPoses = [
    ...WORK.slice(0, 4).map((id) => starPose(c, id, aspect, 38)!),
    framePose(c, WORK, aspect, 38, 0.47, 0.35, c.layout === 'portrait' ? 0.8 : 0.6),
  ];
  const projectPoses = PROJECTS.map((id) => starPose(c, id, aspect, 46)!);
  switch (seg) {
    case 'hero': {
      const e = easeInOut(t);
      return { pose: lerpPose(heroPose(c, aspect), workPoses[0], e), focusId: 'brava', focal: e > 0.6, mask, heroGlow: 1 - t };
    }
    case 'work': {
      const r = travel(workPoses, WORK, t);
      const complete = t > 0.95;
      return { pose: r.pose, focusId: complete ? 'brava' : r.focusId, focal: !complete, mask, heroGlow: 0 };
    }
    case 'pull1':
      return { pose: lerpPose(workPoses[4], projectPoses[0], easeInOut(t)), focusId: t > 0.5 ? PROJECTS[0] : 'brava', focal: t > 0.5, mask, heroGlow: 0 };
    case 'projects': {
      const r = travel(projectPoses, PROJECTS, t);
      return { pose: r.pose, focusId: r.focusId, focal: true, mask, heroGlow: 0 };
    }
    default: {
      const e = easeInOut(t);
      return { pose: lerpPose(projectPoses[5], overview, e), focusId: e > 0.5 ? 'brava' : PROJECTS[5], focal: e < 0.5, mask, heroGlow: 0 };
    }
  }
}

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
  return zoom > 2.3 ? 'hidden' : 'full';
}
