'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree, type RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { constellations, door } from '@/content/sky';
import { cameraRig, type Vec3 } from './cameraRig';
import { chartLayout, lerp, lerpPose, overviewPose, type Layout, type Pose } from './chart';
import { resolve, type Resolved } from './resolve';
import { hoverStore } from './hover';
import { doorStore } from './Door';
import { Meteors } from './Meteors';
import { backgroundFrag, backgroundVert, contentFrag, contentVert, nebulaFrag, nebulaVert } from './shaders';
import { HALO, type SpectralClass } from './types';

export type Motion = 'full' | 'low' | 'reduced';

export interface FrameInfo {
  /** World point → normalised device coordinates for this frame's camera. */
  project: (world: Vec3) => [number, number, number];
  width: number;
  height: number;
  resolved: Resolved;
  pose: Pose;
}

// Spectral class weights (spec §4) — B split across its two halo tints like the reference generator.
const CLASSES: [SpectralClass, string, number][] = [
  ['B', '#9BB0FF', 10], ['B', '#AABFFF', 10], ['A', HALO.A, 20], ['F', HALO.F, 15],
  ['G', HALO.G, 15], ['K', HALO.K, 22], ['M', HALO.M, 8],
];
// Twinkle per class: amplitude, period range in s (spec §7 ambient table).
const TWINKLE: Record<SpectralClass, [number, number, number]> = {
  B: [0.08, 2.5, 4], A: [0.08, 2.5, 4], F: [0.06, 3, 5], G: [0.06, 3, 5], K: [0.1, 4, 6], M: [0.1, 4, 6],
};

/** Seeded PRNG so the sky (and screenshots) are the same on every load. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function quad() {
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  return g;
}

const inst = (arr: Float32Array, size: number) => new THREE.InstancedBufferAttribute(arr, size);
const rgb = (hex: string) => new THREE.Color(hex);

function makeBackground(layout: Layout, count: number) {
  const rand = mulberry32(1440);
  const aspect = layout === 'portrait' ? 0.6 : 2;
  const D = overviewPose(chartLayout(layout), aspect).pos[2];
  const tan = Math.tan((31 * Math.PI) / 180);
  const total = CLASSES.reduce((a, c) => a + c[2], 0);
  const pos = new Float32Array(count * 3);
  const mag = new Float32Array(count);
  const tint = new Float32Array(count * 3);
  const layer = new Float32Array(count);
  const tw = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    let pick = rand() * total;
    let cls = CLASSES[0];
    for (const c of CLASSES) {
      cls = c;
      pick -= c[2];
      if (pick <= 0) break;
    }
    mag[i] = rand() ** 0.3;
    // Depth layers: far 40%, mid 35%, near 25%; parallax factor 0.2 / 0.5 / 1.0.
    const l = rand();
    const [z0, z1, f] = l < 0.4 ? [-34, -16, 0.2] : l < 0.75 ? [-14, -6, 0.5] : [-5, -0.6, 1];
    const z = z0 + rand() * (z1 - z0);
    const halfH = (D - z) * tan * 1.6;
    pos.set([(rand() * 2 - 1) * halfH * aspect, (rand() * 2 - 1) * halfH, z], i * 3);
    layer[i] = f;
    const c = rgb(cls[1]);
    tint.set([c.r, c.g, c.b], i * 3);
    const [amp, p0, p1] = TWINKLE[cls[0]];
    tw.set([amp, p0 + rand() * (p1 - p0), p0 + rand() * (p1 - p0), rand() * Math.PI * 2], i * 4);
  }
  // The power law yields ~1 glint star per 1 200 (m < 0.12); promote the four brightest so the chart always has a few.
  [...mag.keys()].sort((a, b) => mag[a] - mag[b]).slice(0, 4).forEach((idx, k) => (mag[idx] = Math.min(mag[idx], 0.02 + k * 0.025)));

  const g = quad();
  g.setAttribute('aPos', inst(pos, 3));
  g.setAttribute('aMag', inst(mag, 1));
  g.setAttribute('aTint', inst(tint, 3));
  g.setAttribute('aLayer', inst(layer, 1));
  g.setAttribute('aTw', inst(tw, 4));
  g.instanceCount = count;
  return g;
}

const sharedUniforms = () => ({
  uViewport: { value: new THREE.Vector2(1, 1) },
  uDpr: { value: 1 },
  uTime: { value: 0 },
});

const additive = (vertexShader: string, fragmentShader: string, uniforms: Record<string, THREE.IUniform>) =>
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true,
  });

function lineGeometry(pairs: [THREE.Vector3Tuple, THREE.Vector3Tuple][]) {
  return new THREE.BufferGeometry().setFromPoints(pairs.flatMap(([a, b]) => [new THREE.Vector3(...a), new THREE.Vector3(...b)]));
}

function makeChart(layout: Layout) {
  const c = chartLayout(layout);
  const solid: [THREE.Vector3Tuple, THREE.Vector3Tuple][] = [];
  const dashed: [THREE.Vector3Tuple, THREE.Vector3Tuple][] = [];
  for (const k of constellations) {
    for (const [list, pairs] of [[solid, k.lines], [dashed, k.dashed ?? []]] as const) {
      for (const [a, b] of pairs) {
        const sa = c.byId.get(a);
        const sb = c.byId.get(b);
        if (sa && sb) list.push([sa.world, sb.world]);
      }
    }
  }

  // Celestial polar grid about the pole star: rings, 30° spokes, equator, dashed ecliptic.
  const [px, py] = c.pole;
  const step = c.plane.w * 0.104;
  const ring = (r: number) => {
    const out: [THREE.Vector3Tuple, THREE.Vector3Tuple][] = [];
    for (let i = 0; i < 128; i++) {
      const a0 = (i / 128) * Math.PI * 2;
      const a1 = ((i + 1) / 128) * Math.PI * 2;
      out.push([[px + Math.cos(a0) * r, py + Math.sin(a0) * r, 0], [px + Math.cos(a1) * r, py + Math.sin(a1) * r, 0]]);
    }
    return out;
  };
  const rMax = step * 6.5;
  const grid = [1, 2, 3, 4, 5, 6].flatMap((n) => ring(step * n));
  for (let a = 0; a < 12; a++) {
    const t = (a / 12) * Math.PI * 2;
    grid.push([[px + Math.cos(t) * step, py + Math.sin(t) * step, 0], [px + Math.cos(t) * rMax, py + Math.sin(t) * rMax, 0]]);
  }
  grid.push([[px - rMax * 1.6, py, 0], [px + rMax * 1.6, py, 0]]);
  const ecl = (22 * Math.PI) / 180;
  const ecliptic: [THREE.Vector3Tuple, THREE.Vector3Tuple][] = [
    [[px - Math.cos(ecl) * rMax * 1.6, py - Math.sin(ecl) * rMax * 1.6, 0], [px + Math.cos(ecl) * rMax * 1.6, py + Math.sin(ecl) * rMax * 1.6, 0]],
  ];

  const ink = rgb('#EDEFF5');
  const dash = (opacity: number, size: number) =>
    new THREE.LineDashedMaterial({ color: ink, transparent: true, opacity, dashSize: size, gapSize: size * 1.4, depthWrite: false });
  const solidLines = new THREE.LineSegments(lineGeometry(solid), new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.35, depthWrite: false }));
  const dashedLines = new THREE.LineSegments(lineGeometry(dashed), dash(0.3, 0.05));
  dashedLines.computeLineDistances();
  const gridLines = new THREE.LineSegments(lineGeometry(grid), new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.07, depthWrite: false }));
  const eclLine = new THREE.LineSegments(lineGeometry(ecliptic), dash(0.12, 0.06));
  eclLine.computeLineDistances();
  const group = new THREE.Group();
  group.add(gridLines, eclLine, solidLines, dashedLines);
  for (const o of group.children) o.renderOrder = 1;
  // [material, opacity on the chart, opacity on a calm sky]: the calm sky (A3/A4, R3 · RM) keeps a faint grid, no constellations.
  const fades = ([[solidLines, 0.35, 0], [dashedLines, 0.3, 0], [gridLines, 0.07, 0.035], [eclLine, 0.12, 0.05]] as const).map(
    ([o, on, calm]) => [o.material as THREE.Material, on, calm] as const,
  );
  // The door's line (spec §12b): invisible until the door is found, then it fades in with its stars.
  const doorLine = new THREE.LineSegments(
    lineGeometry(door.lines.map(([a, b]) => [c.byId.get(a)!.world, c.byId.get(b)!.world])),
    new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0, depthWrite: false }),
  );
  doorLine.renderOrder = 1;
  group.add(doorLine);
  return { group, fades, doorLine: doorLine.material as THREE.Material };
}

function makeContent(layout: Layout) {
  const c = chartLayout(layout);
  const n = c.stars.length;
  const pos = new Float32Array(n * 3);
  const tint = new Float32Array(n * 3);
  const st = new Float32Array(n * 4);
  c.stars.forEach((s, i) => {
    pos.set(s.world, i * 3);
    const col = rgb(HALO[s.spectral]);
    tint.set([col.r, col.g, col.b], i * 3);
    st.set([5.5, 1, 0, i * 1.7], i * 4);
  });
  const g = quad();
  g.setAttribute('aPos', inst(pos, 3));
  g.setAttribute('aTint', inst(tint, 3));
  const state = inst(st, 4);
  state.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute('aState', state);
  g.instanceCount = n;
  return { geometry: g, state, stars: c.stars };
}

type Ctx = {
  bgMat: THREE.ShaderMaterial;
  contentMat: THREE.ShaderMaterial;
  nebulaMat: THREE.ShaderMaterial;
  nebula: { current: THREE.Mesh | null };
  content: ReturnType<typeof makeContent>;
  lines: ReturnType<typeof makeChart>;
  chart: ReturnType<typeof chartLayout>;
  pointer: { current: { tx: number; ty: number; x: number; y: number } };
  cur: { current: Pose | null };
  curMask: { current: { scale: number; opacity: number; heroGlow: number } | null };
  fps: { current: { t0: number; last: number; frames: number; warm: boolean } };
  /** The door's glow, 0 (a background star) → 1 (found), eased toward doorStore. */
  doorGlow: { current: number };
} & Omit<SceneProps, 'count'>;

const ndc = new THREE.Vector3();

/** One frame: camera, ambient uniforms, content-star states, then labels via onFrame. */
function tick(ctx: Ctx, state: RootState, frameDelta: number) {
  // A long gap (tab switch, a view transition holding frames) must not jump the damped camera.
  const delta = Math.min(frameDelta, 1 / 30);
  const { bgMat, contentMat, nebulaMat, nebula, content, lines, chart, pointer, cur, curMask, fps, doorGlow, layout, motion, isHome, onFrame, onLowFps } = ctx;
  const camera = state.camera as THREE.PerspectiveCamera;
  const { width, height } = state.size;
  const dpr = state.viewport.dpr;
  const t = motion === 'reduced' ? 0 : state.clock.elapsedTime;
  const rig = cameraRig.getState();
  const target = resolve(rig, chart, width / height, isHome);

  // Camera: damp toward the resolved pose. Journey poses are already scrubbed, so they damp faster.
  const k = motion === 'reduced' || !cur.current ? 1 : 1 - Math.exp(-delta * (rig.target ? 5 : 10));
  const pose = (cur.current = cur.current ? lerpPose(cur.current, target.pose, k) : target.pose);
  // The H1 mask and glow damp with the camera, so the letters and the sky behind them move as one in every frame.
  const was = curMask.current ?? { ...target.mask, heroGlow: target.heroGlow };
  const m = (curMask.current = { scale: lerp(was.scale, target.mask.scale, k), opacity: lerp(was.opacity, target.mask.opacity, k), heroGlow: lerp(was.heroGlow, target.heroGlow, k) });
  const r: Resolved = { ...target, mask: { scale: m.scale, opacity: m.opacity }, heroGlow: m.heroGlow };
  camera.position.set(...pose.pos);
  camera.lookAt(...pose.look);
  camera.fov = pose.fov;

  // Near-layer offset: pointer parallax (±8 px, lerp 0.06) + Lissajous idle drift (0.4 px/s, 90 s).
  const p = pointer.current;
  p.x += (p.tx - p.x) * 0.06;
  p.y += (p.ty - p.y) * 0.06;
  const amp = motion === 'full' ? 5.7 : motion === 'low' ? 2.9 : 0;
  const w = (Math.PI * 2 * t) / 90;
  const sx = (motion === 'full' ? p.x * 8 : 0) + Math.sin(w) * amp;
  const sy = (motion === 'full' ? p.y * 8 : 0) + Math.sin(2 * w) * amp * 0.5;
  camera.setViewOffset(width, height, -sx, -sy, width, height);
  camera.updateProjectionMatrix();

  for (const m of [bgMat, contentMat]) {
    m.uniforms.uViewport.value.set(width * dpr, height * dpr);
    m.uniforms.uDpr.value = dpr;
    m.uniforms.uTime.value = t;
  }
  bgMat.uniforms.uOffset.value.set(sx, -sy);
  bgMat.uniforms.uTwinkleCap.value = motion === 'full' ? 1 : motion === 'low' ? 0.04 : 0;
  // Theater mode turns the twinkle down (cameraRig.setAmbient, T12).
  bgMat.uniforms.uAmbient.value = rig.ambient;
  bgMat.uniforms.uTwinkleMag.value = motion === 'full' ? 0.697 : 0.566; // top 30% / top 15%
  bgMat.uniforms.uGlintRot.value = motion === 'full' ? (t * 0.5 * Math.PI) / 180 : 0;
  contentMat.uniforms.uTwinkle.value = motion === 'reduced' ? 0 : rig.ambient;

  // Nebula breathing: scale 1 → 1.03 + opacity ±6% @ 14 s, centre drift @ 40 s (low power: opacity @ 20 s).
  if (nebula.current) {
    const breathe = motion === 'full' ? Math.sin((Math.PI * 2 * t) / 14) : 0;
    const s = 1 + 0.015 * (1 + breathe);
    const [nw, nh] = layout === 'portrait' ? [9, 14] : [17, 9];
    nebula.current.scale.set(nw * s, nh * s, 1);
    const drift = motion === 'full' ? 0.12 : 0;
    nebula.current.position.set(chart.pole[0] + Math.sin((Math.PI * 2 * t) / 40) * drift, chart.pole[1] + Math.cos((Math.PI * 2 * t) / 40) * drift, -2);
    const op = motion === 'low' ? Math.sin((Math.PI * 2 * t) / 20) : breathe;
    nebulaMat.uniforms.uOpacity.value = 0.62 * (1 + 0.06 * op);
  }

  // Content stars: current 7.5 px, focal 14 px + glow, hover halo ×1.4 (spec §4, T13).
  const hover = hoverStore.get();
  const kk = motion === 'reduced' ? 1 : 1 - Math.exp(-delta * 12);
  // Calm sky (off-home backdrop, R3 · RM below the hero): starfield, nebula and a faint grid only.
  // Behind a panel (bare) the lines go too, so nothing but the focal star sits behind the reading column.
  for (const [m, on, calm] of lines.fades) m.opacity += ((r.quiet || r.bare ? calm : on) - m.opacity) * kk;
  // The door brightens gently when found (instantly under reduced motion) and goes with the content stars on a calm sky.
  const dg = (doorGlow.current += ((doorStore.get() ? 1 : 0) - doorGlow.current) * (motion === 'reduced' ? 1 : 1 - Math.exp(-delta * 4)));
  lines.doorLine.opacity = r.quiet || r.bare ? 0 : 0.3 * dg;
  const arr = content.state.array as Float32Array;
  content.stars.forEach((s, i) => {
    if (s.door) {
      // At rest a door star matches a mid background star (core ~2 px, faint halo); found, it reads as a content star.
      arr[i * 4] += ((r.quiet || r.bare ? 0 : 2.6 + 1.8 * dg) - arr[i * 4]) * kk;
      arr[i * 4 + 1] += ((r.quiet ? 0 : 0.18 + 0.67 * dg) - arr[i * 4 + 1]) * kk;
      return;
    }
    const isFocus = s.id === r.focusId;
    // Helpers are dimmer figure stars; the lodestar (featured build) burns brighter than its neighbours.
    const rest = s.helper ? 2.6 : s.lodestar ? 8.5 : 5.5;
    // H1: the current star (Brava) is the brightest in the letters, easing back to 7.5 px as the hero scrolls away.
    const core = r.quiet || (r.bare && !isFocus) ? 0 : isFocus ? (r.focal ? 14 : Math.max(7.5 + 2.5 * r.heroGlow, rest)) : rest;
    const halo = r.quiet ? 0 : s.id === hover ? 1.4 : s.helper ? 0.45 : s.lodestar ? 1.3 : isFocus ? 1 + 0.4 * r.heroGlow : 1;
    const glow = isFocus && r.focal ? 1 : 0;
    arr[i * 4] += (core + (s.id === hover ? 1 : 0) - arr[i * 4]) * kk;
    arr[i * 4 + 1] += (halo - arr[i * 4 + 1]) * kk;
    arr[i * 4 + 2] += (glow - arr[i * 4 + 2]) * kk;
    if (glow === 0 && arr[i * 4 + 2] < 0.01) arr[i * 4 + 2] = 0;
  });
  content.state.needsUpdate = true;

  const project = (w: Vec3): [number, number, number] => {
    ndc.set(...w).project(camera);
    return [ndc.x, ndc.y, ndc.z];
  };
  onFrame({ project, width, height, resolved: r, pose });

  // Measured fps < 45 for 2 s → low power (spec §7 performance budget).
  if (motion === 'full') {
    const now = performance.now();
    const f = fps.current;
    // A paused loop (hidden tab, frameloop 'never') or a long stall restarts the window instead of counting as slow.
    if (!f.t0 || now - f.last > 250) {
      f.t0 = now;
      f.frames = 0;
    }
    f.last = now;
    f.frames++;
    if (now - f.t0 >= 2000) {
      const value = (f.frames * 1000) / (now - f.t0);
      if (process.env.NODE_ENV !== 'production') (window as unknown as { __rsfSkyFps?: number }).__rsfSkyFps = value;
      // The first window includes shader compile and page load; only later windows count.
      if (value < 45 && f.warm) onLowFps();
      f.warm = true;
      f.t0 = now;
      f.frames = 0;
    }
  }
}

export interface SceneProps {
  layout: Layout;
  count: number;
  motion: Motion;
  /** Follow the home journey (false under reduced motion once the hero has scrolled away). */
  isHome: boolean;
  onFrame: (f: FrameInfo) => void;
  onLowFps: () => void;
}

export function Scene({ layout, count, motion, isHome, onFrame, onLowFps }: SceneProps) {
  const { invalidate } = useThree();
  const chart = chartLayout(layout);
  const bg = useMemo(() => makeBackground(layout, count), [layout, count]);
  const bgMat = useMemo(
    () => additive(backgroundVert, backgroundFrag, { ...sharedUniforms(), uOffset: { value: new THREE.Vector2() }, uTwinkleMag: { value: 0.697 }, uTwinkleCap: { value: 1 }, uAmbient: { value: 1 }, uGlintRot: { value: 0 } }),
    [],
  );
  const content = useMemo(() => makeContent(layout), [layout]);
  const contentMat = useMemo(() => additive(contentVert, contentFrag, { ...sharedUniforms(), uTwinkle: { value: 1 } }), []);
  const lines = useMemo(() => makeChart(layout), [layout]);
  const nebulaMat = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: nebulaVert, fragmentShader: nebulaFrag, uniforms: { uOpacity: { value: 1 } }, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, transparent: true }),
    [],
  );
  const nebula = useRef<THREE.Mesh>(null);

  useEffect(() => () => bg.dispose(), [bg]);
  useEffect(() => () => content.geometry.dispose(), [content]);
  useEffect(
    () => () =>
      lines.group.children.forEach((o) => {
        const l = o as THREE.LineSegments;
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      }),
    [lines],
  );

  // Outside full motion the loop runs on demand: redraw on rig/hover changes, or at 30 fps in low power.
  useEffect(() => {
    if (motion === 'full') return;
    const unsubs = [cameraRig.subscribe(() => invalidate()), hoverStore.subscribe(() => invalidate()), doorStore.subscribe(() => invalidate())];
    const id = motion === 'low' ? window.setInterval(() => invalidate(), 1000 / 30) : 0;
    invalidate();
    return () => {
      unsubs.forEach((u) => u());
      window.clearInterval(id);
    };
  }, [motion, invalidate, isHome]);

  const pointer = useRef({ tx: 0, ty: 0, x: 0, y: 0 });
  useEffect(() => {
    if (motion !== 'full') return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [motion]);

  const cur = useRef<Pose | null>(null);
  const curMask = useRef<{ scale: number; opacity: number; heroGlow: number } | null>(null);
  const fps = useRef({ t0: 0, last: 0, frames: 0, warm: false });
  const doorGlow = useRef(0);

  useFrame((state, delta) =>
    tick({ bgMat, contentMat, nebulaMat, nebula, content, lines, chart, pointer, cur, curMask, fps, doorGlow, layout, motion, isHome, onFrame, onLowFps }, state, delta),
  );

  return (
    <>
      <mesh ref={nebula} material={nebulaMat} renderOrder={0}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <mesh geometry={bg} material={bgMat} frustumCulled={false} renderOrder={1} />
      {motion !== 'reduced' && <Meteors low={motion === 'low'} isHome={isHome} door={chart.door} />}
      <primitive object={lines.group} />
      <mesh geometry={content.geometry} material={contentMat} frustumCulled={false} renderOrder={2} />
    </>
  );
}
