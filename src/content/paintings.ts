export interface Painting {
  slug: string;
  /** Old CRA route id (`/analog/<legacyId>`). */
  legacyId: string;
  title: string;
  medium: string;
  /** Caption form, verbatim: `36" x 48"`. */
  size: string;
  widthIn: number;
  heightIn: number;
  /** `${image}_<w>.jpg`, w in 800 (cards, OG) and 1500 (full page). */
  image: string;
  /** Pixel height of the 800 px master, for intrinsic sizing. */
  height800: number;
}

// Content-file order (spec §5). [title, medium, size, height800]
const rows: [string, string, string, number][] = [
  ['Lewis Hamilton', 'Acrylic on Canvas', '36" x 48"', 1074],
  ['Aaron Judge', 'Acrylic on Canvas', '36" x 48"', 1070],
  ['Andy Warhol', 'Acrylic on Canvas', '30" x 40"', 1068],
  ['Barack Obama', 'Acrylic on Canvas', '24" x 30"', 1005],
  ['Chance The Rapper', 'Acrylic on Collage on Canvas', '36" x 36"', 801],
  ['Dr. Manhattan', 'Acrylic on Collage on Canvas', '30" x 40"', 1066],
  ['Rorschach', 'Acrylic on Collage on Canvas', '30" x 40"', 1066],
  ['Ozymandias', 'Acrylic on Collage on Canvas', '30" x 40"', 1070],
  ['Han Solo', 'Acrylic on Canvas', '24" x 48"', 1610],
  ['James Bond', 'Acrylic on Collage on Canvas', '36" x 36"', 800],
  ['Jon Snow', 'Acrylic on Collage on Canvas', '36" x 48"', 1068],
  ['Luke Skywalker', 'Acrylic on Collage on Canvas', '36" x 24"', 531],
  ['Marilyn Monroe', 'Acrylic on Canvas', '36" x 36"', 800],
  ['Princess Leia', 'Acrylic on Collage on Canvas', '30" x 40"', 1069],
  ['Rick Grimes', 'Acrylic on Collage on Canvas', '48" x 24"', 397],
  ['Tinkerbell', 'Acrylic on Canvas', '18" x 24"', 1066],
  ['Walter White', 'Acrylic on Collage on Canvas', '36" x 36"', 802],
];

export const paintings: Painting[] = rows.map(([title, medium, size, height800]) => {
  const slug = title.toLowerCase().replace(/\./g, '').replace(/\s+/g, '-');
  const [widthIn, heightIn] = size.match(/\d+/g)!.map(Number);
  return {
    slug,
    legacyId: slug.replace(/-/g, '_'),
    title,
    medium,
    size,
    widthIn,
    heightIn,
    image: `/images/paintings/${slug}`,
    height800,
  };
});
