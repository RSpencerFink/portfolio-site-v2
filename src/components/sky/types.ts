/** Spectral classes used for star halos (spec §3, §4). */
export type SpectralClass = 'B' | 'A' | 'F' | 'G' | 'K' | 'M';

/** Halo tint per class; the core is always #FFFFFF. */
export const HALO: Record<SpectralClass, string> = {
  B: '#9BB0FF',
  A: '#CAD7FF',
  F: '#F8F7FF',
  G: '#FFF4EA',
  K: '#FFD2A1',
  M: '#FFB56C',
};

/** Normalised H3 position: 0–1, origin top-left of the 1440 × 900 chart (spec §5). */
export type ChartPoint = readonly [x: number, y: number];

export interface Star {
  /** Entity slug; also the ViewTransition name suffix (`star-${id}`). */
  id: string;
  name: string;
  /** Route the star opens. Origins have none. */
  href?: string;
  spectral: SpectralClass;
  /** Chart position (spec §5). */
  position?: ChartPoint;
  /** Unlabelled figure-completing star (dimmer, no marker). */
  helper?: boolean;
  /** A door star (spec §12b): unlabelled, as dim as the background until found; one shared marker. */
  door?: boolean;
}

export interface Constellation {
  id: string;
  name: string;
  subline: string;
  namePosition?: ChartPoint;
  /** Star id → chart position. */
  stars: Record<string, ChartPoint>;
  /** Unlabelled helper stars that complete the figure; line segments may use their ids. */
  helpers?: Record<string, ChartPoint>;
  /** A star drawn extra bright with a four-point glint (the featured build). */
  lodestar?: string;
  lines: [string, string][];
  dashed?: [string, string][];
}
