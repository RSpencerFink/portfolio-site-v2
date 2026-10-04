import type { ChartPoint, Constellation, Star } from '@/components/sky/types';
import { education, person } from './site';
import { jobs } from './work';
import { projects } from './projects';

/*
 * The H3 chart as plain data (spec §5): each constellation lists its stars'
 * normalised positions (0–1, origin top-left of the 1440 × 900 chart) and its
 * line segments (Paper "Round 4 — Constellations", the client's picks).
 * Helpers are unlabelled, dimmer stars that complete a figure; lines may use
 * them. Reshaping a constellation is an edit here and nowhere else. The paintings
 * and films have no stars on the chart: the door below leads to them (spec §12b).
 */
export const constellations: Constellation[] = [
  {
    // R4 option C "Arrow": the shaft runs through the past roles, the head lands on Brava.
    // Upper left; the shaft is steep enough (> 45°) that every label clears it on the left.
    id: 'work',
    name: 'The Engineer',
    subline: '2016 — Present',
    namePosition: [0.0771, 0.4966],
    stars: {
      'prizm-imagery': [0.1869, 0.4513],
      dbox: [0.228, 0.3629],
      meta: [0.2691, 0.2745],
      hypha: [0.3102, 0.1861],
      brava: [0.3513, 0.0977],
    },
    helpers: { 'work-barb-low': [0.3442, 0.1702], 'work-barb-high': [0.3095, 0.1294] },
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
    // Upper right, across the pole from The Engineer; its name sits under the star like the other two.
    namePosition: [0.7408, 0.2802],
    stars: { 'section-8-scout': [0.755, 0.219] },
    lodestar: 'section-8-scout',
    lines: [],
  },
  {
    // R4 option A "Telescope": the Observer at the eyepiece, the schools along the tube
    // (newest nearest the objective), a flared objective end and a two-leg mount.
    // Lower right of the pole, tube raised past 45° so the left-hand labels clear it.
    id: 'origins',
    name: 'The Student',
    subline: 'Education',
    namePosition: [0.5333, 0.9057],
    stars: {
      observer: [0.6275, 0.8626],
      'emerson-college': [0.6594, 0.7833],
      'app-academy': [0.6912, 0.704],
      'georgia-tech': [0.7231, 0.6247],
    },
    helpers: {
      'origins-objective-top': [0.7245, 0.5657],
      'origins-objective-low': [0.7557, 0.5975],
      'origins-leg-left': [0.6735, 0.8626],
      'origins-leg-right': [0.7337, 0.8604],
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
  ...education.map((e) => ({ id: e.slug, name: e.name, ...e.star })),
  { id: 'observer', name: person.name, href: '/about', ...person.star },
].map((s) => ({ ...s, position: positions.get(s.id) }));

/**
 * The door (spec §12b): a faint, unlabelled cluster near the chart's edge that reads as background
 * stars until the visitor finds it (pointer near, zoomed onto it, tapped, focused). It opens the
 * visual arts. Moving it is an edit here (portrait: `PORTRAIT_GROUPS.door` in chart.ts).
 */
export const door: { href: string; label: string; stars: Record<string, ChartPoint>; lines: [string, string][] } = {
  href: '/visual-arts/analog',
  /** Accessible name only: the door never shows text. */
  label: 'The other half: paintings and films',
  stars: { 'door-a': [0.075, 0.8513], 'door-b': [0.092, 0.8774], 'door-c': [0.0821, 0.9102] },
  lines: [
    ['door-a', 'door-b'],
    ['door-b', 'door-c'],
  ],
};

/** Pole star: plain RSF mark at chart centre (spec §5, decision 4). */
export const POLE_STAR = { position: [0.5, 0.4778] as const, markSize: [324, 156] as const };
