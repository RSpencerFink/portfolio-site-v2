/**
 * journeyProgress: 0 at the top of the home journey, 1 at the end of the
 * last pinned section. Written only by the journey track; read by the sky.
 */
let progress = 0;
const listeners = new Set<() => void>();

export const journeyProgress = {
  get: () => progress,
  set(value: number) {
    if (value === progress) return;
    progress = value;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
