import type { Constellation, Star } from '@/components/sky/types';
import { education, person } from './site';
import { jobs } from './work';
import { projects } from './projects';
import { paintings } from './paintings';
import { films } from './films';

/** Every content star, derived from the entity modules (spec §4, §5). */
export const stars: Star[] = [
  ...jobs.map((j) => ({ id: j.slug, name: j.company, href: `/work/${j.slug}/`, ...j.star })),
  ...projects.map((p) => ({ id: p.slug, name: p.name, href: `/projects/${p.slug}/`, ...p.star })),
  ...paintings.map((p) => ({ id: p.slug, name: p.title, href: `/visual-arts/analog/${p.slug}/`, ...p.star })),
  ...films.map((f) => ({ id: f.slug, name: f.title, href: `/visual-arts/digital/${f.slug}/`, ...f.star })),
  ...education.map((e) => ({ id: e.slug, name: e.name, ...e.star })),
  { id: 'observer', name: person.name, href: '/about/', ...person.star },
];

/** Pole star: plain RSF mark at chart centre (spec §5, decision 4). */
export const POLE_STAR = { position: [0.5, 0.4778] as const, markSize: [324, 156] as const };

export const constellations: Constellation[] = [
  {
    id: 'work',
    name: 'Constellation of Work',
    subline: 'V stars · 2016 — Present',
    namePosition: [0.1389, 0.3667],
    starIds: jobs.map((j) => j.slug),
    lines: [['prizm-imagery', 'dbox'], ['dbox', 'meta'], ['meta', 'hypha'], ['hypha', 'brava']],
    dashed: [['app-academy', 'dbox']],
  },
  {
    id: 'projects',
    name: 'The Builder’s Cluster',
    subline: 'VI stars · Projects',
    namePosition: [0.6667, 0.3556],
    starIds: projects.map((p) => p.slug),
    lines: [
      ['section-8-scout', 'freecast'],
      ['freecast', 'react-dynamic-image'],
      ['react-dynamic-image', 'concord'],
      ['concord', 'react-2048'],
      ['concord', 'brickbreaker'],
    ],
  },
  {
    id: 'origins',
    name: 'Origins',
    subline: 'II stars · Education',
    namePosition: [0.0278, 0.6244],
    starIds: [...education.map((e) => e.slug), 'observer'],
    lines: [['app-academy', 'emerson-college']],
    dashed: [['emerson-college', 'observer']],
  },
  {
    id: 'painter',
    name: 'The Painter',
    subline: 'V stars · Analog',
    namePosition: [0.625, 0.5333],
    starIds: paintings.map((p) => p.slug),
    lines: [['walter-white', 'dr-manhattan'], ['dr-manhattan', 'marilyn-monroe'], ['marilyn-monroe', 'han-solo'], ['han-solo', 'walter-white']],
  },
  {
    id: 'filmmaker',
    name: 'The Filmmaker',
    subline: 'V stars · Digital',
    namePosition: [0.2431, 0.6444],
    starIds: films.map((f) => f.slug),
    lines: [['nightshade', 'timeflies-epk'], ['timeflies-epk', 'spare-key'], ['timeflies-epk', 'bayonet'], ['bayonet', 'montauk']],
  },
];
