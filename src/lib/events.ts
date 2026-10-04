type ModifierEvent = { button?: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean };

/** True when the browser, not us, should handle the event: new-tab clicks, Back shortcuts, etc. */
export const isModified = (e: ModifierEvent) =>
  (e.button !== undefined && e.button !== 0) || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
