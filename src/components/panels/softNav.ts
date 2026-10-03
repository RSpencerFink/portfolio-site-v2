import { useState } from 'react';

/**
 * Records the path the visitor reached by clicking a star (soft navigation
 * from the sky). A hard load starts at null, so direct loads and crawlers get
 * the full page. Panel mode is "arrived path === current path"; PanelFrame
 * clears the flag once its panel is open, so ordinary links never inherit it.
 */
let arrivedPath: string | null = null;
/** Star link to focus once the visitor is back on the page the panel opened from. */
let returnFocus: string | null = null;
/** The close transition in flight: focus moves once it has finished, so it can't scroll the page mid-morph. */
let closing: Promise<unknown> = Promise.resolve();

const normalize = (path: string) => path.replace(/\/+$/, '') || '/';

export const softNav = {
  get: () => arrivedPath,
  set(path: string | null) {
    arrivedPath = path === null ? null : normalize(path);
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
export const useArrivedFromSky = (pathname: string) => useState(() => arrivedPath === normalize(pathname))[0];
