import type { ChartPoint, Constellation, Star } from '@/components/sky/types';
import { education, person } from './site';
import { jobs } from './work';
import { projects } from './projects';
import { paintings } from './paintings';
import { films } from './films';

/*
 * The H3 chart as plain data (spec §5): each constellation lists its stars'
 * normalised positions (0–1, origin top-left of the 1440 × 900 chart) and its
 * line segments (Paper "Round 4 — Constellations", the client's picks).
 * Helpers are unlabelled, dimmer stars that complete a figure; lines may use
 * them. Reshaping a constellation is an edit here and nowhere else. Stars not
 * listed (most paintings and films) have no place on the chart.
 */
export const constellations: Constellation[] = [
  {
    // R4 option C "Arrow": the shaft runs through the past roles, the head lands on Brava.
    id: 'work',
    name: 'The Engineer',
    subline: '2016 — Present',
    namePosition: [0.0556, 0.4667],
    stars: {
      'prizm-imagery': [0.0764, 0.4111],
      dbox: [0.1497, 0.3431],
      meta: [0.218, 0.2653],
      hypha: [0.2942, 0.1952],
      brava: [0.3875, 0.0982],
    },
    helpers: { 'work-barb-low': [0.3497, 0.2031], 'work-barb-high': [0.3164, 0.1089] },
    lines: [
      ['prizm-imagery', 'dbox'],
      ['dbox', 'meta'],
      ['meta', 'hypha'],
      ['hypha', 'brava'],
      ['brava', 'work-barb-low'],
      ['brava', 'work-barb-high'],
    ],
  },
  {
    // R4 option B "Lodestar": one extra-bright star with a four-point glint, no lines.
    id: 'projects',
    name: 'The Builder',
    subline: 'Projects',
    namePosition: [0.7181, 0.26],
    stars: { 'section-8-scout': [0.7569, 0.1889] },
    lodestar: 'section-8-scout',
    lines: [],
  },
  {
    // R4 option A "Telescope": the Observer at the eyepiece, the schools along the tube
    // (newest nearest the objective), a flared objective end and a two-leg mount.
    id: 'origins',
    name: 'The Student',
    subline: 'Education',
    namePosition: [0.0417, 0.875],
    stars: {
      observer: [0.0583, 0.7111],
      'emerson-college': [0.1088, 0.6696],
      'app-academy': [0.1592, 0.6302],
      'georgia-tech': [0.2096, 0.5864],
    },
    helpers: {
      'origins-objective-top': [0.2539, 0.518],
      'origins-objective-low': [0.2707, 0.5644],
      'origins-leg-left': [0.1419, 0.7453],
      'origins-leg-right': [0.1939, 0.7502],
    },
    lines: [
      ['observer', 'emerson-college'],
      ['emerson-college', 'app-academy'],
      ['app-academy', 'georgia-tech'],
      ['georgia-tech', 'origins-objective-top'],
      ['georgia-tech', 'origins-objective-low'],
      ['origins-objective-top', 'origins-objective-low'],
      ['app-academy', 'origins-leg-left'],
      ['app-academy', 'origins-leg-right'],
    ],
  },
  {
    // R4 option C "Brush": a handle through three paintings, a bristle tip ending on Han Solo.
    id: 'painter',
    name: 'The Painter',
    subline: 'Analog',
    namePosition: [0.6944, 0.5778],
    stars: {
      'walter-white': [0.6771, 0.8889],
      'dr-manhattan': [0.7521, 0.8049],
      'marilyn-monroe': [0.8233, 0.7299],
      'han-solo': [0.9171, 0.6296],
    },
    helpers: { 'painter-bristle-low': [0.8693, 0.7392], 'painter-bristle-high': [0.8505, 0.6942] },
    lines: [
      ['walter-white', 'dr-manhattan'],
      ['dr-manhattan', 'marilyn-monroe'],
      ['marilyn-monroe', 'painter-bristle-low'],
      ['painter-bristle-low', 'han-solo'],
      ['marilyn-monroe', 'painter-bristle-high'],
      ['painter-bristle-high', 'han-solo'],
    ],
  },
  {
    // R4 option C "Clapperboard": the slate, and its arm hinged open from Nightshade.
    id: 'filmmaker',
    name: 'The Director',
    subline: 'Digital',
    namePosition: [0.3542, 0.7444],
    stars: {
      nightshade: [0.3125, 0.7222],
      'timeflies-epk': [0.4594, 0.6328],
      'spare-key': [0.3157, 0.8474],
      bayonet: [0.5071, 0.8423],
      montauk: [0.5055, 0.7188],
    },
    lines: [
      ['nightshade', 'montauk'],
      ['montauk', 'bayonet'],
      ['bayonet', 'spare-key'],
      ['spare-key', 'nightshade'],
      ['nightshade', 'timeflies-epk'],
    ],
  },
];

const positions = new Map<string, ChartPoint>(constellations.flatMap((c) => Object.entries(c.stars)));

/** Helper stars: unlabelled, dimmer, no route. */
export const helperStars: (Star & { position: ChartPoint })[] = constellations.flatMap((c) =>
  Object.entries(c.helpers ?? {}).map(([id, position]) => ({ id, name: '', spectral: 'F' as const, position, helper: true })),
);

/** Every content star, derived from the entity modules (spec §4); `position` comes from the chart above. */
export const stars: Star[] = [
  ...jobs.map((j) => ({ id: j.slug, name: j.company, href: `/work/${j.slug}`, ...j.star })),
  ...projects.map((p) => ({ id: p.slug, name: p.name, href: `/projects/${p.slug}`, ...p.star })),
  ...paintings.map((p) => ({ id: p.slug, name: p.title, href: `/visual-arts/analog/${p.slug}`, ...p.star })),
  ...films.map((f) => ({ id: f.slug, name: f.title, href: `/visual-arts/digital/${f.slug}`, ...f.star })),
  ...education.map((e) => ({ id: e.slug, name: e.name, ...e.star })),
  { id: 'observer', name: person.name, href: '/about', ...person.star },
].map((s) => ({ ...s, position: positions.get(s.id) }));

/** Pole star: plain RSF mark at chart centre (spec §5, decision 4). */
export const POLE_STAR = { position: [0.5, 0.4778] as const, markSize: [324, 156] as const };
