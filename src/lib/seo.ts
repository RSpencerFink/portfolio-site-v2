import type { Metadata } from 'next';
import { SITE_URL, absoluteUrl, person, socials, education } from '@/content/site';
import { jobs, type Job } from '@/content/work';

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'profile' | 'article' | 'video.other';
}

export function pageMeta({ title, description, path, image, type = 'website' }: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: person.name,
      type,
      ...(image && { images: [{ url: image }] }),
    },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description },
  };
}

export const PERSON_ID = `${SITE_URL}/#person`;
export const orgId = (job: Job) => `${SITE_URL}/work/${job.slug}#org`;

export const organizationLd = (job: Job) => ({
  '@type': 'Organization',
  '@id': orgId(job),
  name: job.company,
  logo: absoluteUrl(job.insignia.src),
  ...(job.description && { description: job.description }),
});

const role = (job: Job) => ({
  '@type': 'EmployeeRole',
  roleName: job.title,
  startDate: job.roles.at(-1)!.startDate,
  ...(job.roles[0].endDate && { endDate: job.roles[0].endDate }),
});

export const personLd = () => ({
  '@type': 'Person',
  '@id': PERSON_ID,
  name: person.name,
  jobTitle: person.jobTitle,
  description: person.bio,
  url: SITE_URL,
  image: absoluteUrl(`${person.headshot.base}_800.jpg`),
  sameAs: socials.map((s) => s.url),
  worksFor: jobs.filter((j) => j.current).map((j) => ({ ...role(j), worksFor: organizationLd(j) })),
  alumniOf: [
    ...education.map((e) => ({
      '@type': e.slug === 'emerson-college' ? 'CollegeOrUniversity' : 'EducationalOrganization',
      name: e.name,
    })),
    ...jobs.filter((j) => !j.current).map((j) => ({ ...role(j), alumniOf: organizationLd(j) })),
  ],
});

/** Serialise for a <script type="application/ld+json">, safe against `</script>`. */
export const ldJson = (data: object) =>
  JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c');
