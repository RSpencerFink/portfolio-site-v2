'use client';

import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { journeyProgress } from '@/components/journey/progress';
import { cameraRig } from './cameraRig';
import styles from './SkyHost.module.css';

/**
 * Mounted once in the root layout, behind {children}. Placeholder until the
 * R3F track lands: an idle canvas over the ground colour. It is decorative
 * (aria-hidden); the HTML mirror carries all content.
 */
export function SkyHost() {
  useEffect(() => journeyProgress.subscribe(() => cameraRig.setProgress(journeyProgress.get())), []);

  return (
    <div className={styles.host} aria-hidden="true">
      <Canvas frameloop="never" dpr={[1, 2]} gl={{ antialias: false }} />
    </div>
  );
}
