'use client';

import { Canvas } from '@react-three/fiber';
import { setConsoleFunction } from 'three';
import { Scene, type SceneProps } from './Scene';
import styles from './SkyHost.module.css';

// R3F 9.x still constructs THREE.Clock (deprecated in r183). Drop that one
// warning; forward everything else unchanged.
setConsoleFunction((type: 'log' | 'warn' | 'error', message: string, ...params: unknown[]) => {
  if (typeof message === 'string' && message.includes('Clock: This module has been deprecated')) return;
  console[type](message, ...params);
});

/**
 * The WebGL canvas: three and R3F live only in this chunk, which SkyHost loads
 * lazily so pages render (and the HTML mirror is usable) before it arrives.
 */
export default function SkyCanvas({ frameloop, dpr, ...scene }: SceneProps & { frameloop: 'always' | 'demand' | 'never'; dpr: [number, number] }) {
  return (
    <Canvas
      className={styles.canvas}
      frameloop={frameloop}
      dpr={dpr}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 62, near: 0.1, far: 200, position: [0, 0, 8] }}
      onCreated={({ scene: s, gl }) => {
        gl.setClearColor('#04050A');
        s.background = null;
      }}
    >
      <Scene {...scene} />
    </Canvas>
  );
}
