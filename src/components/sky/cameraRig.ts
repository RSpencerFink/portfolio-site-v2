export type Vec3 = [number, number, number];

/** A star id, the full chart, or an explicit pose. */
export type CameraTarget = string | 'overview' | { position: Vec3; lookAt: Vec3 };

export interface CameraState {
  target: CameraTarget;
  /** Journey progress 0–1, mirrored from the journey track. */
  progress: number;
  /** Sky dim 1 (full) → 0.55 behind a panel (spec §3 opacity). */
  dim: number;
  /** Ambient motion (twinkle) multiplier, 1 normal → 0.3 in theater mode (spec §7 T12). Added by the panels track; the sky may ignore it. */
  ambient: number;
}

let state: CameraState = { target: 'overview', progress: 0, dim: 1, ambient: 1 };
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
  setAmbient: (ambient: number) => update({ ambient }),
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

