import type { SpectralClass, ChartPoint } from '@/components/sky/types';

export interface Film {
  slug: string;
  /** Old CRA route id (`/digital/<legacyId>`). */
  legacyId: string;
  title: string;
  roles: string[];
  /** Verbatim, with the original line breaks (render with white-space: pre-line). */
  description: string;
  vimeoId: string;
  /** Montauk has no still: typographic card. */
  still?: string;
  star: { spectral: SpectralClass; position?: ChartPoint };
}

const DCE = ['Director', 'Cinematographer', 'Editor'];

// Content-file order (spec §5). Descriptions and Vimeo IDs from the old src/data/digital.js.
const rows: Omit<Film, 'star' | 'still'>[] = [
  { slug: 'montauk', legacyId: 'montauk', title: 'Montauk', roles: DCE, description: '', vimeoId: '244541780' },
  {
    slug: 'spare-key',
    legacyId: 'the_republic_of_wolves_spare_key',
    title: 'The Republic of Wolves - Spare Key',
    roles: ['Director', 'Cinematographer'],
    description:
      'Official music video for the song "Spare Key" off of their second full-length album "No Matter How Narrow."\n\nDirected by Mason Maggio & R. Spencer Fink; Produced by R. Spencer Fink & Mason Maggio; Filmed by R. Spencer Fink and Billy Duprey; Edited by Billy Duprey.\n\nSpecial thanks to Bari Robinson, Robert Wesson, Anthony Sampogna, Ryan Cullinane, Nicole Zinerco, Robert Mullen, Dr. Clyde Payne, and Dowling College for making this happen.',
    vimeoId: '82416903',
  },
  {
    slug: 'zero-suds-commercial',
    legacyId: 'rosalies_zero_suds_commercial',
    title: 'Rosalie’s Zero Suds - Commercial',
    roles: ['Director', 'Editor'],
    description: "This is the first commercial for Rosalie's Zero Suds, a new sudless washing machine detergent.",
    vimeoId: '178859950',
  },
  {
    slug: 'zero-suds-info',
    legacyId: 'rosalies_zero_suds_informational',
    title: 'Rosalie’s Zero Suds - Informational',
    roles: ['Director', 'Editor'],
    description: '',
    vimeoId: '179418136',
  },
  {
    slug: 'row-home',
    legacyId: 'the_republic_of_wolves_home',
    title: 'The Republic Of Wolves - Home',
    roles: ['Director', 'Cinematographer'],
    description:
      'Music video for the song "Home" by The Republic of Wolves, off of their second EP "The Cartographer."\n\nDirector & Director of Photography:\nR Spencer Fink\n\nEditors:\nBilly Duprey & Mason Maggio\n\nShot on:\nCanon 5d Mk II\nCanon 7d',
    vimeoId: '95459880',
  },
  {
    slug: 'timeflies-epk',
    legacyId: 'timeflies_epk',
    title: 'Timeflies EPK',
    roles: DCE,
    description: 'An electronic press kit created for musical duo Timeflies.',
    vimeoId: '95459879',
  },
  {
    slug: 'bayonet',
    legacyId: 'american_gospel_bayonet',
    title: 'American Gospel - Bayonet',
    roles: ['Director', 'Cinematographer'],
    description: 'Director - R. Spencer Fink\nDirector of Photography - R. Spencer Fink\nEditor - Gregg Dellaroca\nShot on the Canon 7D',
    vimeoId: '95457387',
  },
  {
    slug: 'nightshade',
    legacyId: 'nightshade',
    title: 'Nightshade',
    roles: DCE,
    description:
      'A short horror film exploring the fear of the dark.\n\nDirected, Shot, and Edited by:\nR. Spencer Fink\n\nSecond Camera:\nSteven San Miguel\n\nStarring:\nCat Ross\nSteven San Miguel\n\nSpecial Thanks to Chris Pittsley\n\nShot on the Canon 7D and T2i\nCinestyle Preset\nEdited in Adobe Premiere and After Effects.',
    vimeoId: '51697985',
  },
  {
    slug: 'likuid',
    legacyId: 'likuid_sound_promo',
    title: 'Likuid Sound Promo',
    roles: DCE,
    description: 'Promotional Video for Likuid Sound.',
    vimeoId: '95457386',
  },
  {
    slug: 'timeflies-live',
    legacyId: 'timeflies_live_freestyle',
    title: 'Timeflies Live Freestyle',
    roles: DCE,
    description: 'Timeflies live freestyle at the Middle East Downstairs in Cambridge, MA, on February 17th, 2011.',
    vimeoId: '95457385',
  },
  {
    slug: 'tritonal',
    legacyId: 'tritonal_still_with_me',
    title: 'Tritonal - Still With Me (Seven Lions Remix) Unofficial Music Video',
    roles: DCE,
    description: '',
    vimeoId: '50326532',
  },
  {
    slug: 'graffiti6',
    legacyId: 'graffiti6_over_you',
    title: 'Graffiti6 - Over You (Unofficial Music Video)',
    roles: DCE,
    description: '',
    vimeoId: '54908067',
  },
];

/** The Filmmaker's H3 subset (spec §5). */
const chart: Record<string, ChartPoint> = {
  nightshade: [0.0764, 0.7778],
  'timeflies-epk': [0.1667, 0.7222],
  'spare-key': [0.2288, 0.805],
  bayonet: [0.3892, 0.7283],
  montauk: [0.4865, 0.8117],
};

export const films: Film[] = rows.map((f, i) => ({
  ...f,
  still: f.slug === 'montauk' ? undefined : `/images/film-stills/${f.slug}.jpg`,
  // Alternate B / A in content-file order, starting B (spec §4).
  star: { spectral: i % 2 === 0 ? 'B' : 'A', position: chart[f.slug] },
}));

export const vimeoUrl = (f: Film) => `https://vimeo.com/${f.vimeoId}`;
export const vimeoEmbedUrl = (f: Film) => `https://player.vimeo.com/video/${f.vimeoId}`;
