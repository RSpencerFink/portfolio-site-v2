import type { SpectralClass } from '@/components/sky/types';

export interface Project {
  slug: string;
  name: string;
  /** "Chrome extension · Live" line under the title (Paper R4 · P · Featured). */
  kind: string;
  status: string;
  description: string;
  live: { url: string; label: string };
  tech: string[];
  /** Framed browser-window capture of the live site, 1.6:1. */
  preview: { src: string; width: number; height: number; caption: string };
  star: { spectral: SpectralClass };
}

/** One featured build. Older projects were retired from the site (their URLs redirect here). */
export const projects: Project[] = [
  {
    slug: 'section-8-scout',
    name: 'Section-8-Scout',
    kind: 'Chrome extension',
    status: 'Live',
    description:
      'Streamline your Section 8 property investment research with real-time Fair Market Rent validation directly on real estate listing sites.',
    live: { url: 'https://www.section-8-scout.com', label: 'Visit live site' },
    tech: ['Next.JS', 'Drizzle ORM', 'Tailwind CSS', 'PostgreSQL', 'Vercel'],
    preview: { src: '/images/projects/section-8-scout/desktop.jpg', width: 1600, height: 1000, caption: 'Live site · Captured Oct 2026' },
    star: { spectral: 'A' },
  },
];

export const featured = projects[0];

/** Retired project slugs: `/projects/<slug>` answers 308 → the featured build (next.config.ts). */
export const retiredProjects = ['freecast', 'react-dynamic-image', 'concord', 'react-2048', 'brickbreaker'];
