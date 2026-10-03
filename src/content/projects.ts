import type { SpectralClass, ChartPoint } from '@/components/sky/types';

export interface Project {
  slug: string;
  name: string;
  description: string;
  repo?: string;
  live?: { url: string; label: string };
  tech: string[];
  star: { spectral: SpectralClass; position: ChartPoint };
}

export const projects: Project[] = [
  {
    slug: 'section-8-scout',
    name: 'Section-8-Scout',
    description:
      'Streamline your Section 8 property investment research with real-time Fair Market Rent validation directly on real estate listing sites.',
    live: { url: 'https://www.section-8-scout.com', label: 'Live Site' },
    tech: ['Next.JS', 'Drizzle ORM', 'Tailwind CSS', 'PostgreSQL', 'Vercel'],
    star: { spectral: 'A', position: [0.6601, 0.1894] },
  },
  {
    slug: 'freecast',
    name: 'Freecast',
    description:
      'Freecast is a modern podcast discovery and analysis platform that allows users to search, explore, and extract insights from podcast content.',
    repo: 'https://github.com/RSpencerFink/freecast',
    live: { url: 'https://freecast.vercel.app', label: 'Live Site' },
    tech: ['Next.JS', 'Drizzle ORM', 'Tailwind CSS', 'PostgreSQL', 'Vercel', 'OpenAI', 'AssemblyAI', 'iTunes Search API', 'python'],
    star: { spectral: 'F', position: [0.7156, 0.2783] },
  },
  {
    slug: 'react-dynamic-image',
    name: 'react-dynamic-image',
    description: 'A lightweight component for cleanly rendering srcSet images in react',
    repo: 'https://github.com/RSpencerFink/react-dynamic-image',
    live: { url: 'https://www.npmjs.com/package/react-dynamic-image', label: 'Live Site (npm)' },
    tech: ['React.JS', 'NPM'],
    star: { spectral: 'G', position: [0.7917, 0.1994] },
  },
  {
    slug: 'concord',
    name: 'Concord',
    description: 'A clone of the Discord\'s text chat, built in React & Ruby on Rails. Completed in a 10-day sprint.',
    repo: 'https://github.com/RSpencerFink/Concord',
    tech: ['React.JS', 'Redux', 'Ruby on Rails', 'PostgreSQL', 'Heroku'],
    star: { spectral: 'A', position: [0.8403, 0.3111] },
  },
  {
    slug: 'react-2048',
    name: 'React 2048',
    description: 'A clone of 2048, built in React.',
    repo: 'https://github.com/RSpencerFink/react-2048',
    tech: ['React.JS'],
    star: { spectral: 'F', position: [0.9097, 0.2333] },
  },
  {
    slug: 'brickbreaker',
    name: 'BrickBreaker',
    description: 'A Pong-style brickbreaking game built with vanilla JavaScript.',
    repo: 'https://github.com/RSpencerFink/BrickBreaker',
    tech: ['JavaScript'],
    star: { spectral: 'G', position: [0.875, 0.4111] },
  },
];
