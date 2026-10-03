import type { NextConfig } from 'next';
import { paintings } from './src/content/paintings';
import { films } from './src/content/films';

const nextConfig: NextConfig = {
  // Stop `next dev` from writing AGENTS.md / CLAUDE.md into the repo.
  agentRules: false,
  // Old CRA URLs → new slugs. `permanent: true` answers 308.
  async redirects() {
    return [
      { source: '/analog', destination: '/visual-arts/analog', permanent: true },
      { source: '/digital', destination: '/visual-arts/digital', permanent: true },
      ...paintings.map((p) => ({ source: `/analog/${p.legacyId}`, destination: `/visual-arts/analog/${p.slug}`, permanent: true })),
      ...films.map((f) => ({ source: `/digital/${f.legacyId}`, destination: `/visual-arts/digital/${f.slug}`, permanent: true })),
      // Unknown legacy ids land on the listing, as the old app did.
      { source: '/analog/:path*', destination: '/visual-arts/analog', permanent: true },
      { source: '/digital/:path*', destination: '/visual-arts/digital', permanent: true },
    ];
  },
};

export default nextConfig;
