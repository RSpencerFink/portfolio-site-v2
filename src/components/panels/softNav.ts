import { useState } from 'react';

/**
 * Records the path the visitor reached by clicking a star (soft navigation
 * from the sky). A hard load starts at null, so direct loads and crawlers get
 * the full page. Panel mode is "arrived path === current path", so ordinary
 * links never inherit a stale flag.
 */
let arrivedPath: string | null = null;
/** Star link to focus once the visitor is back on the page the panel opened from. */
let returnFocus: string | null = null;

const normalize = (path: string) => path.replace(/\/+$/, '') || '/';

export const softNav = {
  get: () => arrivedPath,
  set(path: string | null) {
    arrivedPath = path === null ? null : normalize(path);
  },
  /** Close: forget panel mode and remember which star should get focus back. */
  close(path: string) {
    arrivedPath = null;
    returnFocus = normalize(path);
  },
  /** SkyLink calls this on mount; true once for the link that should take focus. */
  takeFocus(href: string) {
    if (returnFocus !== normalize(href)) return false;
    returnFocus = null;
    return true;
  },
};

/**
 * Read once per mount and then frozen. A step link records the sibling's path
 * before the navigation commits; reading the store live would flip the
 * current panel to a full page for a frame.
 */
export const useArrivedFromSky = (pathname: string) => useState(() => arrivedPath === normalize(pathname))[0];
