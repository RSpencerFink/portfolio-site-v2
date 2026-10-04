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

/** Generated sky OG (1200 × 630, a render of the H3 chart) for pages without their own still or painting. */
/** Every page advertises the plain-text site summary; set here because page `alternates` replace the layout's. */
export const LLMS_ALTERNATE = { 'text/plain': '/llms.txt' };

const SKY_OG = { url: '/og/sky.jpg', width: 1200, height: 630, alt: 'The sky chart of R. Spencer Fink' };

export function pageMeta({ title, description, path, image, type = 'website' }: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path, types: LLMS_ALTERNATE },
    openGraph: {
      title,
      description,
      url: path,
      siteName: person.name,
      type,
      images: [image ? { url: image } : SKY_OG],
    },
    twitter: { card: 'summary_large_image', title, description },
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
  // Enrolled, not graduated: an affiliation, never alumniOf or a credential.
  affiliation: education
    .filter((e) => e.inProgress)
    .map((e) => ({ '@type': 'CollegeOrUniversity', name: e.name, description: e.description })),
  alumniOf: [
    ...education.filter((e) => !e.inProgress).map((e) => ({
      '@type': e.slug === 'emerson-college' ? 'CollegeOrUniversity' : 'EducationalOrganization',
      name: e.name,
    })),
    ...jobs.filter((j) => !j.current).map((j) => ({ ...role(j), alumniOf: organizationLd(j) })),
  ],
});

/** Serialise for a <script type="application/ld+json">, safe against `</script>`. */
export const ldJson = (data: object) =>
  JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c');
