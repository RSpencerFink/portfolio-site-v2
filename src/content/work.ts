import type { SpectralClass } from '@/components/sky/types';

export interface Role {
  title: string;
  /** ISO year-month. */
  startDate: string;
  endDate?: string;
  /** Display form, e.g. "May 2026 – Sep 2026". */
  months: string;
}

export interface Bullet {
  lead?: string;
  text: string;
}

export interface Job {
  slug: string;
  company: string;
  /** Role line as shown on the sky and in the panel header. */
  title: string;
  /** Display dates with spaced em dash (spec §12.10). */
  dates: string;
  current?: boolean;
  roles: Role[];
  description?: string;
  sections: { heading?: string; bullets: Bullet[] }[];
  insignia: { src: string; tile?: string; /** Inset as a fraction of the tile, for marks that run to the edge. */ pad?: number; /** Width ÷ height, for wordmarks; default 1 (square tile). */ aspect?: number };
  star: { spectral: SpectralClass };
}

export const jobs: Job[] = [
  {
    slug: 'brava',
    company: 'Brava',
    title: 'CTO & Co-founder',
    dates: '2026 — Present',
    current: true,
    roles: [{ title: 'CTO & Co-founder', startDate: '2026-09', months: 'Sep 2026 – Present' }],
    description:
      'Brava is an AI-native performance management platform that replaces traditional annual review cycles with continuous, example-based performance data so managers can make faster and fairer talent decisions. Backed by Zach Weinberg from Operator Partners.',
    sections: [],
    insignia: { src: '/images/company-icons/brava-mark.png', tile: '#0E1F18', pad: 0.2 },
    star: { spectral: 'A' },
  },
  {
    slug: 'hypha',
    company: 'Hypha',
    title: 'Engineering Manager, previously Member of the Technical Staff',
    dates: '2025 — 2026',
    roles: [
      { title: 'Engineering Manager', startDate: '2026-05', endDate: '2026-09', months: 'May 2026 – Sep 2026' },
      { title: 'Member of the Technical Staff', startDate: '2025-09', endDate: '2026-05', months: 'Sep 2025 – May 2026' },
    ],
    description:
      'Hypha is an AI-powered document intelligence platform designed for investment teams. The platform automatically extracts structured data from financial documents like loan agreements, rent rolls, and financial statements, enabling teams to streamline data extraction, portfolio monitoring, and reporting workflows.',
    sections: [
      {
        bullets: [
          { text: 'Owned product strategy, technical execution, and delivery for two major product areas, partnering with design and product from discovery through launch. Transitioned execution to junior engineers while continuing to lead product strategy and architecture.' },
          { text: 'Led a cross-functional team of 4 engineers, 2 designers, and 1 product manager, setting priorities, developing talent, and driving high-quality execution.' },
          { text: 'Redesigned the software engineering interview process to better assess product judgment, engineering excellence, and collaborative problem-solving, improving hiring signal and consistency.' },
          { text: 'Instituted comprehensive production reliability practices, including stronger observability, incident-response processes, release safeguards, and operational ownership, to improve system resilience and delivery confidence.' },
          { text: 'Provided hands-on technical leadership by setting architectural direction, unblocking complex work, and raising the bar for engineering quality across the team.' },
        ],
      },
    ],
    insignia: { src: '/images/company-icons/hypha-apple.png' },
    star: { spectral: 'F' },
  },
  {
    slug: 'meta',
    company: 'Meta',
    title: 'Software Engineer',
    dates: '2020 — 2025',
    roles: [
      { title: 'Software Engineer', startDate: '2021-05', endDate: '2025-05', months: 'May 2021 – May 2025' },
      { title: 'Rotational Software Engineer', startDate: '2020-04', endDate: '2021-05', months: 'Apr 2020 – May 2021' },
    ],
    sections: [
      {
        heading: 'Rights Manager',
        bullets: [
          {
            lead: 'Project Go Dark',
            text: 'Led the development of a compliance framework that enabled instant content blocking and muting across all media usage within the Meta family of apps. This solution ensured regulatory compliance and protected the company from potential violations of music licensing agreements, with no latency impact for end users.',
          },
          {
            lead: 'Matching Algorithm Improvements',
            text: 'Spearheaded direction of next-generation media matching algorithms and performed integration into copyright protection tooling, an upgrade that enhanced media detection and cut annual hardware costs by over $10M.',
          },
          {
            lead: 'Music Metadata Clustering',
            text: 'Designed a system to resolve ownership conflicts, deduplicate database records, and streamline complex data models for efficient management in the music ownership space.',
          },
        ],
      },
      {
        heading: 'Horizon Creator Economy',
        bullets: [
          {
            lead: 'Creator Incentives Bonus Programs',
            text: 'Designed, developed, and deployed two data-driven bonus programs that incentivized creators to build immersive worlds, driving mobile user engagement and increasing in-world purchases through monetary incentives for top creators.',
          },
          {
            lead: 'UI Shop',
            text: 'Designed and developed a fully customizable in-game UI shop, streamlining in-game purchases and empowering both internal game designers and third-party creators with robust tools for creating and managing virtual storefronts.',
          },
        ],
      },
    ],
    insignia: { src: '/images/company-icons/meta.svg', tile: '#FFFFFF', pad: 0.14 },
    star: { spectral: 'B' },
  },
  {
    slug: 'dbox',
    company: 'DBOX',
    title: 'Full Stack Web Developer',
    dates: '2018 — 2020',
    roles: [{ title: 'Full Stack Web Developer', startDate: '2018-09', endDate: '2020-04', months: 'Sep 2018 – Apr 2020' }],
    description:
      'DBOX is an international creative communications agency that develops innovative, strategic marketing campaigns in the sectors of luxury residential, hospitality, commercial, and cultural property.',
    sections: [
      {
        bullets: [
          { text: 'Played a key role in the full web design and development lifecycle, by providing design input and executing development, hosting, troubleshooting and maintenance.' },
          { text: 'Aid in the development and maintenance of server-side tools powered by Node.JS and Express' },
          { text: 'Employed Amazon Web Services for static site hosting using S3, EC2, CloudFront, and Route53' },
          { text: 'Improved workflow by leveraging continuous integration and deployment with AWS CodePipeline and TravisCI' },
          { text: 'Collaborated with graphic designers, UI/UX designers, CGI Artists, and client-facing project managers.' },
        ],
      },
    ],
    insignia: { src: '/images/company-icons/dbox-wordmark.svg', tile: '#000000', pad: 0.22, aspect: 2.2 },
    star: { spectral: 'K' },
  },
  {
    slug: 'prizm-imagery',
    company: 'Prizm Imagery',
    title: 'Owner / Operator',
    dates: '2016 — 2018',
    roles: [{ title: 'Owner / Operator', startDate: '2016-04', endDate: '2018-10', months: 'Apr 2016 – Oct 2018' }],
    sections: [
      {
        bullets: [
          { text: 'Founded and managed a boutique photography and cinematography business, overseeing client acquisition, project execution, marketing, and financial operations.' },
          { text: 'Delivered premium real estate visuals through professional shoots and advanced post-production editing using Adobe Photoshop, Premiere, and Illustrator.' },
          { text: 'Built strong client relationships, driving repeat business and referrals through exceptional service and quality.' },
        ],
      },
    ],
    insignia: { src: '/images/company-icons/prizm.png', tile: '#FFFFFF' },
    star: { spectral: 'M' },
  },
];
