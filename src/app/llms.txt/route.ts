import { absoluteUrl, education, person, resume, socials, tech } from '@/content/site';
import { jobs } from '@/content/work';
import { projects } from '@/content/projects';
import { paintings } from '@/content/paintings';
import { films, vimeoUrl } from '@/content/films';

export const dynamic = 'force-static';

/** /llms.txt, generated from the content modules so it never drifts (spec §10). */
export function GET() {
  const lines = [
    `# ${person.name}`,
    '',
    `> ${person.identities.join(' and ')}. Currently ${person.currently}.`,
    '',
    person.bio,
    '',
    '## Experience',
    ...jobs.map((j) => {
      const roles = j.roles.map((r) => `${r.title} (${r.months})`).join('; ');
      return `- [${j.company}](${absoluteUrl(`/work/${j.slug}`)}): ${roles}.${j.description ? ` ${j.description}` : ''}`;
    }),
    '',
    '## Education',
    ...education.map((e) => `- ${[e.name, e.location, e.dates].filter(Boolean).join(', ')}: ${e.description}`),
    '',
    '## Projects',
    ...projects.map(
      (p) => `- [${p.name}](${absoluteUrl(`/projects/${p.slug}`)}): ${p.kind}, ${p.status.toLowerCase()}. ${p.description} Built with ${p.tech.join(', ')}. Live site: ${p.live.url}.`,
    ),
    '',
    '## Tech',
    ...tech.map((t) => `- ${t.heading}: ${t.items.join(', ')}`),
    '',
    '## Visual arts: Analog (paintings)',
    ...paintings.map((p) => `- [${p.title}](${absoluteUrl(`/visual-arts/analog/${p.slug}`)}): ${p.medium}, ${p.size}`),
    '',
    '## Visual arts: Digital (films and music videos)',
    ...films.map((f) => `- [${f.title}](${absoluteUrl(`/visual-arts/digital/${f.slug}`)}): ${f.roles.join(', ')}. Vimeo: ${vimeoUrl(f)}`),
    '',
    '## Links',
    `- [About](${absoluteUrl('/about')})`,
    `- [Résumé (PDF)](${absoluteUrl(resume.href)})`,
    ...socials.map((s) => `- [${s.label}](${s.url})`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
