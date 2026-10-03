import { CatmullRomCurve3, Vector3 } from 'three';
import { constellations } from '@/content/sky';
import { jobs } from '@/content/work';
import { projects } from '@/content/projects';
import type { CameraState, Segment, Vec3 } from './cameraRig';
import { clamp01, easeInOut, explorePose, focalH, focus, framePose, heroPose, lerp, lerpPose, overviewPose, panelPose, type ChartLayout, type Pose } from './chart';

/*
 * Rig state → camera pose. Uses three (CatmullRomCurve3), so it lives apart
 * from chart.ts: only the lazily loaded canvas imports it.
 */
/* ------------------------------------------------------------------------ */
/* Journey                                                                  */

const WORK = jobs.map((j) => j.slug);
const PROJECTS = projects.map((p) => p.slug);
/** Stars whose W/P frame is the dense two-column layout (W2, P1/P2): star top-left. */
const DENSE = new Set([...jobs.filter((j) => j.sections.length > 0).map((j) => j.slug), ...PROJECTS]);

/**
 * Focal star placement, matching where HomeJourney lays out the text
 * (Journey.module.css `.focal`): desktop 40 % / 47 %, dense frames 19.4 % / 27.8 %,
 * mobile 25 % across, 200 px down.
 */
function journeyStarPose(c: ChartLayout, id: string, aspect: number, fov: number): Pose {
  const s = c.byId.get(id)!;
  if (c.layout === 'portrait') return focus(s.world, focalH(c), fov, aspect, 0.25, 0.237);
  const [fx, fy] = DENSE.has(id) ? [0.194, 0.278] : [0.4, 0.47];
  return focus(s.world, focalH(c), fov, aspect, fx, fy);
}

/** H1 → H2 mask (T2): scale 1 → 2.2 (0–60 vh) → 6.4 (60–140 vh); opacity 1 → 0 (187–220 vh), as fractions of the hero pin. */
export function heroMask(seg: Segment, t: number) {
  if (seg !== 'hero') return { scale: 6.4, opacity: 0 };
  const vh = t * 220;
  const scale = vh < 60 ? lerp(1, 2.2, easeInOut(vh / 60)) : lerp(2.2, 6.4, easeInOut(clamp01((vh - 60) / 80)));
  return { scale, opacity: 1 - clamp01((vh - 187) / 33) };
}

/**
 * A star-to-star pinned sequence (T3/T4). `t` 0 is the first stop and 1 the
 * last (HomeJourney normalises its dwells that way). Per leg the text exits
 * over 0–22 %, the camera travels a CatmullRom path over 20–70 % and parks
 * before the next text enters at 88 %.
 */
function travel(poses: Pose[], ids: (string | null)[], t: number) {
  const n = poses.length - 1;
  const i = Math.min(Math.floor(t * n), n - 1);
  const e = easeInOut(clamp01((t * n - i - 0.2) / 0.5));
  const curve = new CatmullRomCurve3(poses.map((p) => new Vector3(...p.look)));
  const look = curve.getPoint((i + e) / n);
  const pose = lerpPose(poses[i], poses[i + 1], e);
  const dLook: Vec3 = [look.x - pose.look[0], look.y - pose.look[1], 0];
  return {
    pose: { ...pose, look: [look.x, look.y, 0] as Vec3, pos: [pose.pos[0] + dLook[0], pose.pos[1] + dLook[1], pose.pos[2]] as Vec3 },
    focusId: ids[e < 0.5 ? i : i + 1],
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
  /** Inside the W/P stages: the journey's HTML titles replace the constellation names. */
  stage?: boolean;
}

/** Where the camera wants to be for this rig state. Pure; the scene damps toward it. */
export function resolve(state: CameraState, c: ChartLayout, aspect: number, isHome: boolean): Resolved {
  const overview = explorePose(overviewPose(c, aspect), state.view);
  const noMask = { scale: 6.4, opacity: 0 };
  const { target } = state;
  if (typeof target === 'object' && target !== null) {
    return { pose: { pos: target.position, look: target.lookAt, fov: 46 }, focusId: null, focal: false, mask: noMask, heroGlow: 0 };
  }
  if (typeof target === 'string' && target !== 'overview') {
    const group = constellations.find((k) => k.id === target);
    if (group) {
      const ids = group.starIds.filter((id) => c.byId.has(id));
      return { pose: framePose(c, ids, aspect, 46, 0.5, 0.5, 0.6), focusId: null, focal: false, mask: noMask, heroGlow: 0 };
    }
    const pose = panelPose(c, target, aspect);
    if (pose) return { pose, focusId: target, focal: true, mask: noMask, heroGlow: 0 };
    // A panel with no star on the chart (most films): the calm sky, no focus.
    return { pose: overview, focusId: null, focal: false, mask: noMask, heroGlow: 0, quiet: true };
  }
  if (target === 'overview' || !isHome) {
    return { pose: overview, focusId: target ? 'brava' : null, focal: false, mask: noMask, heroGlow: 0, quiet: !target && !isHome };
  }

  const { id: seg, progress: t } = state.segment;
  const mask = heroMask(seg, t);
  const portrait = c.layout === 'portrait';
  // Work: five stars, then "Constellation complete" (W3). Projects: the cluster title (P0), then six stars.
  const workPoses = [...WORK.map((id) => journeyStarPose(c, id, aspect, 38)), framePose(c, WORK, aspect, 38, 0.47, 0.35, portrait ? 0.8 : 0.6)];
  const projectPoses = [framePose(c, PROJECTS, aspect, 46, 0.5, 0.3, portrait ? 0.8 : 0.5), ...PROJECTS.map((id) => journeyStarPose(c, id, aspect, 46))];
  switch (seg) {
    case 'hero': {
      const e = easeInOut(t);
      return { pose: lerpPose(heroPose(c, aspect), workPoses[0], e), focusId: 'brava', focal: e > 0.6, mask, heroGlow: 1 - t };
    }
    case 'work': {
      const r = travel(workPoses, [...WORK, null], t);
      return { pose: r.pose, focusId: r.focusId ?? 'brava', focal: r.focusId !== null, mask, heroGlow: 0, stage: true };
    }
    case 'pull1':
      return { pose: lerpPose(workPoses[WORK.length], projectPoses[0], easeInOut(t)), focusId: null, focal: false, mask, heroGlow: 0, stage: true };
    case 'projects': {
      const r = travel(projectPoses, [null, ...PROJECTS], t);
      return { pose: r.pose, focusId: r.focusId, focal: r.focusId !== null, mask, heroGlow: 0, stage: true };
    }
    default: {
      const e = easeInOut(t);
      return { pose: lerpPose(projectPoses[PROJECTS.length], overview, e), focusId: e > 0.5 ? 'brava' : PROJECTS.at(-1)!, focal: e < 0.5, mask, heroGlow: 0 };
    }
  }
}

