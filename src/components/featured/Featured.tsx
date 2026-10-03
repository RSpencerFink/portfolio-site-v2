import Image from 'next/image';
import type { Project } from '@/content/projects';
import f from './Featured.module.css';

/** The live site in a framed browser window (Paper R4 · P · Featured — Section-8-Scout). */
export function ProjectPreview({ project, sizes, priority }: { project: Project; sizes: string; priority?: boolean }) {
  const { preview, live } = project;
  return (
    <figure className={f.preview}>
      <div className={f.window}>
        <div className={`label-s ${f.chrome}`} aria-hidden="true">
          <span className={f.dots} />
          {new URL(live.url).hostname.replace(/^www\./, '')}
        </div>
        <Image src={preview.src} width={preview.width} height={preview.height} sizes={sizes} priority={priority} alt={`The ${project.name} home page`} />
      </div>
      <figcaption className="label-s">{preview.caption}</figcaption>
    </figure>
  );
}

/** Kind line, verbatim description, "Built with" and the white live-site pill. */
export function ProjectFacts({ project }: { project: Project }) {
  return (
    <>
      <p className={`label ${f.kind}`}>
        {project.kind} · {project.status}
      </p>
      <p className={`body-l ${f.lede}`}>{project.description}</p>
      <div className={f.built}>
        <p className="label-s">Built with</p>
        <p className="mono-body">{project.tech.join(' · ')}</p>
      </div>
      <p>
        <a className={`label ${f.visit}`} href={project.live.url} target="_blank" rel="noopener noreferrer">
          {project.live.label} <span aria-hidden="true">↗</span>
        </a>
      </p>
    </>
  );
}
