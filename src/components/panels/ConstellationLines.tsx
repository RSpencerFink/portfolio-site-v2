'use client';

import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Constellation lines between the works of The Painter / The Director
 * (R3 · A3/A4). Joins the centres of the parent's `[data-star]` elements in
 * document order. Decorative: no-JS visitors get the works without lines.
 */
export function ConstellationLines({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [lines, setLines] = useState<[number, number, number, number][]>([]);

  useLayoutEffect(() => {
    const field = ref.current?.parentElement;
    if (!field) return;
    const measure = () => {
      const box = field.getBoundingClientRect();
      const pts = [...field.querySelectorAll('[data-star]')].map((el) => {
        const r = el.getBoundingClientRect();
        return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top] as const;
      });
      setLines(pts.slice(1).map((p, i) => [pts[i][0], pts[i][1], p[0], p[1]]));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(field);
    return () => ro.disconnect();
  }, []);

  return (
    <svg ref={ref} className={className} aria-hidden="true">
      {lines.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
    </svg>
  );
}
