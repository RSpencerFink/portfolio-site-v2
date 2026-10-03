import type { Metadata } from 'next';
import Link from 'next/link';

/** Static export has no server redirects: old CRA URLs get a meta-refresh stub. */
export const legacyMeta = (to: string): Metadata => ({
  title: 'Moved',
  alternates: { canonical: to },
  robots: { index: false, follow: true },
});

export function LegacyRedirect({ to }: { to: string }) {
  return (
    <main id="main" style={{ position: 'relative', zIndex: 9, padding: 32 }}>
      {/* React hoists <meta> into <head>. */}
      <meta httpEquiv="refresh" content={`0; url=${to}`} />
      <p className="body-l">
        This page has moved to <Link href={to}>{to}</Link>.
      </p>
    </main>
  );
}
