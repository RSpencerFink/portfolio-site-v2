'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Compact header menu below 640 px (R3 · M-H3: name left, "Menu" right). It
 * marks its <header> with data-menu once hydrated; only then does the CSS fold
 * the links away, so without JS the list simply wraps. Closes on a link click
 * and on Esc.
 */
export function MenuButton({ className, controls }: { className?: string; controls: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const header = ref.current?.closest('header');
    if (header) header.dataset.menu = open ? 'open' : 'closed';
  }, [open]);

  useEffect(() => {
    const nav = ref.current?.closest('nav');
    if (!nav) return;
    const onClick = (e: MouseEvent) => (e.target as Element).closest('a') && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      ref.current?.focus();
    };
    nav.addEventListener('click', onClick);
    nav.addEventListener('keydown', onKey);
    return () => {
      nav.removeEventListener('click', onClick);
      nav.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <button ref={ref} type="button" className={className} aria-expanded={open} aria-controls={controls} onClick={() => setOpen((o) => !o)}>
      Menu
    </button>
  );
}
