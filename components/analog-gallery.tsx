"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { analogWorks } from "@/lib/data";

export function AnalogGallery() {
  const [selected, setSelected] = useState<(typeof analogWorks)[number] | null>(
    null
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {analogWorks.map((work) => (
          <button
            key={work.id}
            onClick={() => setSelected(work)}
            className="group relative aspect-square overflow-hidden border border-border transition-all hover:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <Image
              src={`/images/analog/${work.id}.jpg`}
              alt={`${work.title} - ${work.medium}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="text-sm font-medium text-foreground">
                {work.title}
              </span>
              <span className="mt-1 text-xs text-muted">{work.medium}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm p-6"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
        >
          <button
            className="absolute top-6 right-6 text-muted transition-colors hover:text-foreground"
            onClick={() => setSelected(null)}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <div
            className="relative flex max-h-[85vh] max-w-4xl flex-col items-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[60vh] w-full max-w-3xl md:h-[70vh]">
              <Image
                src={`/images/analog/${selected.id}.jpg`}
                alt={`${selected.title} - ${selected.medium}`}
                fill
                className="object-contain"
                sizes="80vw"
                priority
              />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-foreground">
                {selected.title}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {selected.medium} &middot; {selected.size}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
