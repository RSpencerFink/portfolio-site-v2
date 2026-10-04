'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cameraRig } from './cameraRig';
import { heroMask } from './resolve';
import { meteorFrag, meteorVert } from './shaders';

/** Shooting-star tunables (spec §7 ambient table). Ranges are [min, max], drawn uniformly. */
const METEOR = {
  /** Seconds of drawn sky before the first one. */
  first: [6, 12],
  /** Seconds between meteors; doubled in low power. */
  gap: [8, 20],
  /** Tail length in CSS px (×0.7 below 640 px wide). */
  length: [120, 260],
  /** Lifetime in seconds. */
  life: [0.6, 1.1],
  /** Degrees below the horizon, heading left (mirrored to the right half the time): 200–250° on a compass of y-up angles. */
  angle: [200, 250],
  /** Seconds to wait when the sky is busy (or no clear path) at the due time. */
  retry: [2, 5],
} as const;

const rand = ([a, b]: readonly [number, number]) => a + Math.random() * (b - a);

type Meteor = { x: number; y: number; dx: number; dy: number; len: number; travel: number; life: number; age: number };

/** Nothing behind the path but sky: not the central mark/pole area, and no HTML text or control under it. */
function clearPath(sky: Element, x0: number, y0: number, dx: number, dy: number, dist: number, w: number, h: number) {
  // 16 samples: at most ~25 px apart, under one line of body text.
  for (let i = 0; i <= 16; i++) {
    const x = x0 + (dx * dist * i) / 16;
    const y = y0 + (dy * dist * i) / 16;
    if (((x - w * 0.5) / (w * 0.24)) ** 2 + ((y - h * 0.45) / (h * 0.28)) ** 2 < 1) return false;
    if (x < 0 || y < 0 || x > w || y > h) continue;
    // The page's text and controls catch the pointer; empty layout passes it through to <html>/<body> or the
    // sky host (its star markers and labels may sit over a meteor).
    const el = document.elementFromPoint(x, y);
    if (el && el !== document.documentElement && el !== document.body && !sky.contains(el)) return false;
  }
  return true;
}

function place(sky: Element, w: number, h: number): Meteor | null {
  for (let i = 0; i < 8; i++) {
    const len = rand(METEOR.length) * (w < 640 ? 0.7 : 1);
    const a = (rand(METEOR.angle) * Math.PI) / 180;
    const dx = Math.cos(a) * (Math.random() < 0.5 ? 1 : -1);
    const dy = -Math.sin(a);
    const x = w * rand([0.05, 0.95]);
    const y = h * rand([0.04, 0.6]);
    const travel = len * 1.5;
    if (clearPath(sky, x, y, dx, dy, travel, w, h)) return { x, y, dx, dy, len, travel, life: rand(METEOR.life), age: 0 };
  }
  return null;
}

/**
 * Occasional shooting stars: at most one at a time, only on a still sky
 * (no panel, theater, Visual Arts window, hero mask or camera flight).
 * Scene mounts it only outside reduced motion. Time advances with drawn
 * frames, so a hidden tab (frameloop 'never') never queues one up.
 */
export function Meteors({ low, isHome }: { low: boolean; isHome: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: meteorVert,
        fragmentShader: meteorFrag,
        uniforms: { uRes: { value: new THREE.Vector2(1, 1) }, uHead: { value: new THREE.Vector2() }, uDir: { value: new THREE.Vector2(1, 0) }, uLen: { value: 1 }, uAlpha: { value: 0 } },
        blending: THREE.AdditiveBlending,
        // The y-down mapping can mirror the quad's winding, depending on the direction.
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false,
        transparent: true,
      }),
    [],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  const s = useRef({ wait: rand(METEOR.first), m: null as Meteor | null, cam: new THREE.Vector3(), seg: null as unknown, still: 0, count: 0 });

  // Dev hook: window.__rsfSky.meteor() makes the next one due now (still subject to the busy rules);
  // window.__rsfSky.meteorStats() reports how many have flown and the live one.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const w = window as unknown as { __rsfSky?: Record<string, unknown> };
    w.__rsfSky = { ...w.__rsfSky, meteor: () => (s.current.wait = 0), meteorStats: () => ({ count: s.current.count, current: s.current.m }) };
  }, []);

  useFrame((state, frameDelta) => {
    const dt = Math.min(frameDelta, 1 / 30);
    const st = s.current;
    const m = mesh.current;
    if (!m) return;
    const rig = cameraRig.getState();
    // A journey step or camera flight (panel open/close, H3 drag) restarts the 0.5 s of stillness a meteor
    // needs. A step moves the journey progress before the camera: the text exits first.
    const moved = state.camera.position.distanceTo(st.cam) / Math.max(dt, 1e-3) > 0.05 || rig.segment !== st.seg;
    st.cam.copy(state.camera.position);
    st.seg = rig.segment;
    st.still = moved ? 0 : st.still + dt;
    const root = document.documentElement.dataset;
    const busy =
      st.still < 0.5 ||
      'panel' in root ||
      'theater' in root ||
      'window' in root ||
      rig.dim < 1 ||
      rig.ambient < 1 ||
      (isHome && !rig.target && heroMask(rig.segment.id, rig.segment.progress).opacity > 0);

    const met = st.m;
    if (!met) {
      m.visible = false;
      if ((st.wait -= dt) > 0) return;
      st.m = busy ? null : place(state.gl.domElement.parentElement?.closest('[aria-hidden="true"]') ?? state.gl.domElement, state.size.width, state.size.height);
      if (!st.m) st.wait = rand(METEOR.retry);
      else st.count++;
      return;
    }
    // Something took over the sky mid-flight: finish it four times faster.
    met.age += dt * (busy ? 4 : 1);
    const p = met.age / met.life;
    if (p >= 1) {
      st.m = null;
      st.wait = rand(METEOR.gap) * (low ? 2 : 1);
      m.visible = false;
      return;
    }
    const u = (m.material as THREE.ShaderMaterial).uniforms;
    u.uRes.value.set(state.size.width, state.size.height);
    u.uHead.value.set(met.x + met.dx * met.travel * p, met.y + met.dy * met.travel * p);
    u.uDir.value.set(met.dx, met.dy);
    u.uLen.value = Math.max(1, met.len * Math.min(1, p / 0.3));
    // Quick rise, then an ease-out fade.
    u.uAlpha.value = Math.min(1, p / 0.08) * (1 - p) ** 1.6;
    m.visible = true;
  });

  return <mesh ref={mesh} geometry={geometry} material={material} frustumCulled={false} visible={false} renderOrder={1} />;
}
