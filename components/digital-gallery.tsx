import { ExternalLink } from "lucide-react";
import { digitalWorks } from "@/lib/data";

function getVimeoThumbnail(url: string) {
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (!match) return null;
  return `https://vumbnail.com/${match[1]}.jpg`;
}

export function DigitalGallery() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {digitalWorks.map((work) => {
        const thumbnail = getVimeoThumbnail(work.url);
        return (
          <a
            key={work.id}
            href={work.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col border border-border transition-all hover:border-accent/40"
          >
            {/* Thumbnail area */}
            <div className="relative aspect-video overflow-hidden bg-card">
              {thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnail}
                  alt={work.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-xs text-muted-foreground">Video</span>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/50 bg-background/80">
                  <svg
                    className="ml-0.5 h-5 w-5 text-foreground"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Info */}
            <div className="flex flex-1 items-start justify-between gap-3 p-4">
              <div>
                <h3 className="text-sm font-medium text-card-foreground group-hover:text-accent transition-colors">
                  {work.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {work.roles}
                </p>
              </div>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
            </div>
          </a>
        );
      })}
    </div>
  );
}
