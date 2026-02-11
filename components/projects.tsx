import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import { projects } from "@/lib/data";

export function Projects() {
  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 flex items-center gap-4">
          <h2 className="text-sm font-mono tracking-widest text-accent uppercase">
            Projects
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Featured */}
        <div className="mb-16 flex flex-col gap-6">
          {featured.map((project) => (
            <div
              key={project.title}
              className="group border border-border bg-card p-6 transition-all hover:border-accent/40 md:p-8"
            >
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-xl font-medium text-card-foreground group-hover:text-accent transition-colors">
                  {project.title}
                </h3>
                <div className="flex items-center gap-3">
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={`${project.title} repository`}
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={`${project.title} live site`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
              <p className="mb-5 text-sm leading-relaxed text-muted">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-xs text-accent/70"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Other Projects */}
        <h3 className="mb-6 text-xs font-mono tracking-widest text-muted-foreground uppercase">
          Other Projects
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {others.map((project) => (
            <div
              key={project.title}
              className="group flex flex-col border border-border p-5 transition-all hover:border-accent/30"
            >
              <div className="mb-3 flex items-start justify-between">
                <h4 className="text-base font-medium text-foreground">
                  {project.title}
                </h4>
                <div className="flex items-center gap-3">
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={`${project.title} repository`}
                    >
                      <Github className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={`${project.title} live site`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
              <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span key={t} className="font-mono text-xs text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Link to visual arts */}
        <div className="mt-16 text-center">
          <Link
            href="/visual-arts"
            className="group inline-flex items-center gap-2 border border-border px-6 py-3 text-sm text-foreground transition-all hover:border-accent hover:text-accent"
          >
            <span>Visual Arts Portfolio</span>
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
