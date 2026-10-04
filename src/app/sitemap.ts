import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/content/site';
import { jobs } from '@/content/work';
import { projects } from '@/content/projects';
import { paintings } from '@/content/paintings';
import { films } from '@/content/films';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '/',
    '/about',
    '/visual-arts/analog',
    '/visual-arts/digital',
    ...jobs.map((j) => `/work/${j.slug}`),
    ...projects.map((p) => `/projects/${p.slug}`),
    ...paintings.map((p) => `/visual-arts/analog/${p.slug}`),
    ...films.map((f) => `/visual-arts/digital/${f.slug}`),
  ];
  return paths.map((p) => ({ url: absoluteUrl(p) }));
}
