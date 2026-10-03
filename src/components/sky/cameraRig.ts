export type Vec3 = [number, number, number];

/** A star id, a constellation id ('work', 'projects': frame the whole group), the full chart, or an explicit pose. */
export type CameraTarget = string | 'overview' | { position: Vec3; lookAt: Vec3 };

/**
 * Which part of the home journey is scrolling, and how far through it (0–1).
 * Set by the journey track; the sky may ignore it. Desktop ranges (spec §7):
 * hero 220 vh (T2), work 500 vh (T3), pull-1 100 vh (T5), projects 600 vh (T4),
 * pull-2 200 vh (T6). Mobile: hero 140 vh, work/projects one 100 svh slide per star.
 */
export type JourneySegment = 'hero' | 'work' | 'pull-1' | 'projects' | 'pull-2';

export interface CameraState {
  target: CameraTarget;
  /** Journey progress 0–1, mirrored from the journey track. */
  progress: number;
  /** Sky dim 1 (full) → 0.55 behind a panel (spec §3 opacity). */
  dim: number;
  segment: { id: JourneySegment; progress: number };
}

let state: CameraState = { target: 'overview', progress: 0, dim: 1, segment: { id: 'hero', progress: 0 } };
const listeners = new Set<() => void>();
const update = (patch: Partial<CameraState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

/**
 * Imperative camera API. Panels call setTarget(slug) / setDim; the sky reads
 * getState() inside its frame loop. The sky never owns scroll.
 */
export const cameraRig = {
  getState: () => state,
  setTarget: (target: CameraTarget) => update({ target }),
  setProgress: (progress: number) => update({ progress }),
  setDim: (dim: number) => update({ dim }),
  setSegment: (id: JourneySegment, progress: number) => update({ segment: { id, progress } }),
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

