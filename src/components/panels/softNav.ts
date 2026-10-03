import { useSyncExternalStore } from 'react';

/**
 * Records the path the visitor reached by clicking a star (soft navigation
 * from the sky). A hard load starts at null, so direct loads and crawlers get
 * the full page. Panel mode is "arrived path === current path", so ordinary
 * links never inherit a stale flag.
 */
let arrivedPath: string | null = null;
const listeners = new Set<() => void>();

const normalize = (path: string) => path.replace(/\/+$/, '') || '/';

export const softNav = {
  get: () => arrivedPath,
  set(path: string | null) {
    arrivedPath = path === null ? null : normalize(path);
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export const useArrivedFromSky = (pathname: string) =>
  useSyncExternalStore(softNav.subscribe, softNav.get, () => null) === normalize(pathname);
