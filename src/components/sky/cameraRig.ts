export type Vec3 = [number, number, number];

/** A star id, the full chart, or an explicit pose. */
export type CameraTarget = string | 'overview' | { position: Vec3; lookAt: Vec3 };

/** Home journey segments and their scroll lengths in vh (spec §7, T2–T6). */
export type Segment = 'hero' | 'work' | 'pull1' | 'projects' | 'pull2';
export const SEGMENTS: readonly [Segment, number][] = [
  ['hero', 220],
  ['work', 500],
  ['pull1', 120],
  ['projects', 600],
  ['pull2', 160],
];

export interface CameraState {
  /** null = follow the home journey (progress). Set a target to override it. */
  target: CameraTarget | null;
  /** Journey progress 0–1, mirrored from the journey track. */
  progress: number;
  /** Sky dim 1 (full) → 0.55 behind a panel (spec §3 opacity). */
  dim: number;
  /** Explicit H1 mask override; null = derived from progress (T2). */
  mask: { scale: number; opacity: number } | null;
}

let state: CameraState = { target: null, progress: 0, dim: 1, mask: null };
const listeners = new Set<() => void>();
const update = (patch: Partial<CameraState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

const segmentStart = (seg: Segment) => {
  let start = 0;
  for (const [s, vh] of SEGMENTS) {
    if (s === seg) return [start, vh] as const;
    start += vh;
  }
  return [0, 0] as const;
};
const totalVh = SEGMENTS.reduce((a, [, vh]) => a + vh, 0);

/**
 * Imperative camera API. Panels call setTarget(slug) / setDim; the sky reads
 * getState() inside its frame loop. The sky never owns scroll.
 */
export const cameraRig = {
  getState: () => state,
  /** Star id, 'overview' or a pose; null hands the camera back to the journey. */
  setTarget: (target: CameraTarget | null) => update({ target }),
  setProgress: (progress: number) => update({ progress }),
  /** Drive one journey segment with its own 0–1 progress (maps onto setProgress). */
  setSegment(segment: Segment, t: number) {
    const [start, vh] = segmentStart(segment);
    update({ progress: (start + Math.min(Math.max(t, 0), 1) * vh) / totalVh });
  },
  setDim: (dim: number) => update({ dim }),
  /** Override the H1 mask (scale ≥ 1 about the S, opacity 0–1); null restores the T2 mapping. */
  setMask: (mask: CameraState['mask']) => update({ mask }),
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
