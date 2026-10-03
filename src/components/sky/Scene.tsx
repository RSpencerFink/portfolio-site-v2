'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree, type RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { constellations } from '@/content/sky';
import { cameraRig, type Vec3 } from './cameraRig';
import { chartLayout, lerpPose, overviewPose, type Layout, type Pose } from './chart';
import { resolve, type Resolved } from './resolve';
import { hoverStore } from './hover';
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
  return group;
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
  chart: ReturnType<typeof chartLayout>;
  pointer: { current: { tx: number; ty: number; x: number; y: number } };
  cur: { current: Pose | null };
  fps: { current: { t0: number; frames: number; warm: boolean } };
} & Omit<SceneProps, 'count'>;

const ndc = new THREE.Vector3();

/** One frame: camera, ambient uniforms, content-star states, then labels via onFrame. */
function tick(ctx: Ctx, state: RootState, delta: number) {
  const { bgMat, contentMat, nebulaMat, nebula, content, chart, pointer, cur, fps, layout, motion, isHome, onFrame, onLowFps } = ctx;
  const camera = state.camera as THREE.PerspectiveCamera;
  const { width, height } = state.size;
  const dpr = state.viewport.dpr;
  const t = motion === 'reduced' ? 0 : state.clock.elapsedTime;
  const rig = cameraRig.getState();
  const r = resolve(rig, chart, width / height, isHome);

  // Camera: damp toward the resolved pose. Journey poses are already scrubbed, so they damp faster.
  const k = motion === 'reduced' || !cur.current ? 1 : 1 - Math.exp(-delta * (rig.target ? 5 : 10));
  const pose = (cur.current = cur.current ? lerpPose(cur.current, r.pose, k) : r.pose);
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
  const arr = content.state.array as Float32Array;
  content.stars.forEach((s, i) => {
    const isFocus = s.id === r.focusId;
    const core = isFocus ? (r.focal ? 14 : 7.5) : 5.5;
    const halo = s.id === hover ? 1.4 : 1;
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
    if (!f.t0) f.t0 = now;
    f.frames++;
    if (now - f.t0 >= 2000) {
      const value = (f.frames * 1000) / (now - f.t0);
      (window as unknown as { __rsfSkyFps?: number }).__rsfSkyFps = value;
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

  // Outside full motion the loop runs on demand: redraw on rig/hover changes, or at 30 fps in low power.
  useEffect(() => {
    if (motion === 'full') return;
    const unsubs = [cameraRig.subscribe(() => invalidate()), hoverStore.subscribe(() => invalidate())];
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
  const fps = useRef({ t0: 0, frames: 0, warm: false });

  useFrame((state, delta) =>
    tick({ bgMat, contentMat, nebulaMat, nebula, content, chart, pointer, cur, fps, layout, motion, isHome, onFrame, onLowFps }, state, delta),
  );

  return (
    <>
      <mesh ref={nebula} material={nebulaMat} renderOrder={0}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <mesh geometry={bg} material={bgMat} frustumCulled={false} renderOrder={1} />
      <primitive object={lines} />
      <mesh geometry={content.geometry} material={contentMat} frustumCulled={false} renderOrder={2} />
    </>
  );
}
