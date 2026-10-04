import type { SpectralClass } from '@/components/sky/types';

/** Production origin. */
export const SITE_URL = 'https://rspencerfink.com';

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();

export const person = {
  name: 'R. Spencer Fink',
  jobTitle: 'CTO & Co-founder',
  identities: ['Engineering Leader', 'Visual Artist'],
  currently: 'CTO & Co-founder, Brava',
  bio: 'I’m the CTO and co-founder of Brava, where we’re replacing annual performance reviews with continuous, example-based feedback. Before that I led engineering at Hypha and spent five years at Meta building rights-management and creator-economy systems. Before software, I studied film production at Emerson and ran a photography and cinematography business. I’m currently working on an MS in Computer Science at Georgia Tech.',
  headshot: { base: '/images/headshot/rsf-headshot-2', width: 800, height: 1200 },
  /** The Observer star (About). */
  star: { spectral: 'G' as SpectralClass },
};

export const socials = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/r-spencer-fink/' },
  { label: 'Github', url: 'https://github.com/RSpencerFink' },
  { label: 'Instagram', url: 'https://www.instagram.com/rspencerfink/' },
] as const;

/** ponytail: 2024 PDF until the client supplies the 2026 version (spec §13 open 1). */
export const resume = { label: 'Download Résumé', href: '/resume.pdf' } as const;

export const tech = [
  {
    heading: 'Current Stack',
    items: ['TypeScript', 'React JS', 'Next JS', 'PostgresQL', 'Tailwind CSS', 'Amazon Web Services', 'Git', 'Github'],
  },
  {
    heading: 'Other Familiarities',
    items: ['PHP', 'Mongo DB', 'GraphQL', 'Node JS', 'Invision', 'Python', 'Ruby', 'Rails', 'Adobe Photoshop', 'Adobe Lightroom', 'Adobe Illustrator', 'Adobe Premiere'],
  },
] as const;

export interface School {
  slug: string;
  name: string;
  location?: string;
  dates: string;
  description: string;
  /** Still enrolled: shown as in progress, never as a completed degree. */
  inProgress?: boolean;
  star: { spectral: SpectralClass };
}

/** Origins: labelled stars without routes (spec §2). Newest first. */
export const education: School[] = [
  {
    slug: 'georgia-tech',
    name: 'Georgia Institute of Technology',
    dates: '2026 — Present',
    description: 'Master of Science (MS), Computer Science. In progress, since Jan 2026.',
    inProgress: true,
    star: { spectral: 'B' },
  },
  {
    slug: 'app-academy',
    name: 'App Academy',
    location: 'New York, NY',
    dates: '2018',
    description: '1000+ hour software engineering bootcamp with a less than 3% acceptance rate.',
    star: { spectral: 'G' },
  },
  {
    slug: 'emerson-college',
    name: 'Emerson College',
    location: 'Boston, MA',
    dates: '2009 — 2013',
    description: 'BA - Film Production',
    star: { spectral: 'G' },
  },
];
