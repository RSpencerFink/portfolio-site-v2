import Image from "next/image";
import { techStack } from "@/lib/data";

export function About() {
  return (
    <section id="about" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 flex items-center gap-4">
          <h2 className="text-sm font-mono tracking-widest text-accent uppercase">
            About
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Photo */}
          <div className="flex-shrink-0 lg:w-72">
            <div className="relative aspect-square w-full overflow-hidden lg:aspect-[3/4]">
              <Image
                src="/images/headshot.jpg"
                alt="Photograph of Spencer Fink"
                fill
                className="object-cover grayscale transition-all duration-500 hover:grayscale-0"
                sizes="(max-width: 1024px) 100vw, 288px"
                priority
              />
            </div>
          </div>

          {/* Bio + Tech */}
          <div className="flex flex-1 flex-col gap-10">
            <p className="text-lg leading-relaxed text-muted">
              {"I'm a Software Engineer with a strong background in building scalable, user-focused solutions. I specialize in developing tools that empower users, designing and optimizing algorithms, and creating efficient systems that drive business outcomes. With experience in both full-stack development and entrepreneurship, I'm passionate about solving complex problems and delivering impactful results."}
            </p>

            {/* Tech */}
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="mb-4 text-xs font-mono tracking-widest text-muted-foreground uppercase">
                  Current Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {techStack.current.map((tech) => (
                    <span
                      key={tech}
                      className="border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:border-accent hover:text-accent"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-4 text-xs font-mono tracking-widest text-muted-foreground uppercase">
                  Also Familiar With
                </h3>
                <div className="flex flex-wrap gap-2">
                  {techStack.other.map((tech) => (
                    <span
                      key={tech}
                      className="border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
