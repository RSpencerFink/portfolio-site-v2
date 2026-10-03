import { useState } from 'react';

/**
 * Records the path the visitor reached by clicking a star (soft navigation
 * from the sky). A hard load starts at null. "Arrived from the sky" is
 * "arrived path === current path": its panel closes with history back. Any
 * other panel (direct load, reload, plain link) closes to its parent page.
 * PanelFrame clears the flag once its panel is open, so ordinary links never inherit it.
 */
let arrivedPath: string | null = null;
/** The recorded path is a step from a directly loaded panel: it has no sky page behind it in history. */
let arrivedDirect = false;
/** Star link to focus once the visitor is back on the page the panel opened from. */
let returnFocus: string | null = null;
/** The close transition in flight: focus moves once it has finished, so it can't scroll the page mid-morph. */
let closing: Promise<unknown> = Promise.resolve();

const normalize = (path: string) => path.replace(/\/+$/, '') || '/';

export const softNav = {
  get: () => arrivedPath,
  set(path: string | null, direct = false) {
    arrivedPath = path === null ? null : normalize(path);
    arrivedDirect = direct;
  },
  /** Close: forget panel mode and remember which star should get focus back. */
  close(path: string) {
    arrivedPath = null;
    const p = (returnFocus = normalize(path));
    // Unclaimed (no visible link for it on the page) after 2 s: drop it so it can't steal focus later.
    setTimeout(() => returnFocus === p && (returnFocus = null), 2000);
  },
  /** Whether a link to `href` should take focus back (peek; claim it with done()). */
  wantsFocus: (href: string) => returnFocus !== null && returnFocus === normalize(href),
  /** PanelFrame hands over its close view transition (vt.finished). */
  closingUntil(done: Promise<unknown>) {
    closing = done.catch(() => {});
  },
  closed: () => closing,
  /** The returning link has focus. */
  done() {
    returnFocus = null;
  },
};

/**
 * Read once per mount and then frozen. A step link records the sibling's path
 * before the navigation commits; reading the store live would flip the
 * current panel to a full page for a frame.
 */
export const useArrivedFromSky = (pathname: string) => useState(() => arrivedPath === normalize(pathname) && !arrivedDirect)[0];
