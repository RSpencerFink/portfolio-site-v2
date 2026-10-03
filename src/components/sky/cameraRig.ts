export type Vec3 = [number, number, number];

/** A star id, a constellation id ('work', 'projects': frame the whole group), the full chart, or an explicit pose. */
export type CameraTarget = string | 'overview' | { position: Vec3; lookAt: Vec3 };

/**
 * Home journey segments (spec §7, T2–T6). The journey drives each with its own
 * 0–1 progress, measured over its real geometry: in the pinned stages 0 is the
 * first dwell and 1 the last (see HomeJourney), so stop i of n sits at i / (n − 1).
 */
export type Segment = 'hero' | 'work' | 'pull1' | 'projects' | 'pull2';

export interface CameraState {
  /** null = follow the home journey (segment). Set a target to override it. */
  target: CameraTarget | null;
  /** Journey progress 0–1 over the whole #journey block (informational). */
  progress: number;
  /** Current journey segment and its local 0–1 progress. */
  segment: { id: Segment; progress: number };
  /** Sky dim 1 (full) → 0.55 behind a panel (spec §3 opacity). */
  dim: number;
  /** Ambient motion (twinkle) multiplier, 1 normal → 0.3 in theater mode (spec §7 T12). */
  ambient: number;
  /** H3 explore offset (T18): pan in world units from the overview centre, zoom 1–2.5. */
  view: View;
  /** Panel focal star height as a share of the viewport (PanelFrame puts it just above the kicker); null = the default. */
  focalY: number | null;
}

export interface View {
  x: number;
  y: number;
  zoom: number;
}
export const HOME_VIEW: View = { x: 0, y: 0, zoom: 1 };

let state: CameraState = { target: null, progress: 0, segment: { id: 'hero', progress: 0 }, dim: 1, ambient: 1, view: HOME_VIEW, focalY: null };
const listeners = new Set<() => void>();
const update = (patch: Partial<CameraState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

/**
 * Imperative camera API. Panels call setTarget(slug) / setDim; the journey calls
 * setSegment; the sky reads getState() inside its frame loop. The sky never owns scroll.
 */
export const cameraRig = {
  getState: () => state,
  /** Star id, constellation id, 'overview' or a pose; null hands the camera back to the journey. */
  setTarget: (target: CameraTarget | null) => update({ target }),
  setProgress: (progress: number) => update({ progress }),
  /** Drive one journey segment with its own 0–1 progress. */
  setSegment(id: Segment, t: number) {
    const progress = Math.min(Math.max(t, 0), 1);
    if (state.segment.id === id && state.segment.progress === progress) return;
    update({ segment: { id, progress } });
  },
  setDim: (dim: number) => update({ dim }),
  setAmbient: (ambient: number) => update({ ambient }),
  setFocalY: (focalY: number | null) => focalY !== state.focalY && update({ focalY }),
  /** H3 pan/zoom (T18). Applied to the overview pose only. */
  setView: (view: View) => update({ view }),
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
