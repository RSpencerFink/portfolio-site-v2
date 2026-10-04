/** Hovered/focused content star (T13). Internal to the sky: labels write it, the scene reads it. */
let hovered: string | null = null;
const listeners = new Set<() => void>();

export const hoverStore = {
  get: () => hovered,
  set(id: string | null) {
    if (id === hovered) return;
    hovered = id;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
