import Link from 'next/link';

interface Item {
  href: string;
  name: string;
}

/** Prev · counter · next footer. Plain links so it works without JS. */
export function Stepper<T>({ items, index, label, toItem }: { items: T[]; index: number; label: string; toItem: (t: T) => Item }) {
  const prev = index > 0 ? toItem(items[index - 1]) : null;
  const next = index < items.length - 1 ? toItem(items[index + 1]) : null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <nav aria-label={label} className="label" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 48, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
      {prev ? <Link href={prev.href} rel="prev">← {prev.name}</Link> : <span />}
      <span>
        {pad(index + 1)} / {pad(items.length)}
      </span>
      {next ? <Link href={next.href} rel="next">{next.name} →</Link> : <span />}
    </nav>
  );
}
