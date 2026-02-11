import { experience, education } from "@/lib/data";

export function Experience() {
  return (
    <section id="experience" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 flex items-center gap-4">
          <h2 className="text-sm font-mono tracking-widest text-accent uppercase">
            Experience
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Work Experience */}
        <div className="flex flex-col gap-0">
          {experience.map((job, i) => (
            <div
              key={job.company}
              className="group relative flex gap-6 pb-12 last:pb-0 md:gap-10"
            >
              {/* Timeline line */}
              <div className="relative flex flex-col items-center">
                <div className="h-3 w-3 rounded-full border-2 border-accent bg-background transition-colors group-hover:bg-accent" />
                {i < experience.length - 1 && (
                  <div className="w-px flex-1 bg-border" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 -mt-1">
                <div className="mb-1 font-mono text-xs text-muted-foreground">
                  {job.start} &mdash; {job.end}
                </div>
                <h3 className="text-lg font-medium text-foreground">
                  {job.company}
                </h3>
                <div className="mb-3 text-sm text-muted">{job.role}</div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {job.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="mt-20">
          <div className="mb-10 flex items-center gap-4">
            <h3 className="text-sm font-mono tracking-widest text-accent uppercase">
              Education
            </h3>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex flex-col gap-8">
            {education.map((school) => (
              <div key={school.institution} className="flex gap-6 md:gap-10">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full border-2 border-border bg-background" />
                </div>
                <div className="-mt-1">
                  <div className="mb-1 font-mono text-xs text-muted-foreground">
                    {school.start} &mdash; {school.end}
                  </div>
                  <h4 className="text-base font-medium text-foreground">
                    {school.institution}
                  </h4>
                  <div className="text-sm text-muted">
                    {school.location}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {school.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
