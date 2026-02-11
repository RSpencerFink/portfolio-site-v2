import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { AnalogGallery } from "@/components/analog-gallery";
import { DigitalGallery } from "@/components/digital-gallery";

export const metadata: Metadata = {
  title: "R. Spencer Fink | Visual Arts",
  description: "Paintings and film work by R. Spencer Fink.",
};

export default function VisualArtsPage() {
  return (
    <>
      <Navigation />
      <main className="pt-20">
        <div className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h1 className="mb-2 text-3xl font-light tracking-tight text-foreground md:text-4xl">
              Visual Arts
            </h1>
            <p className="mb-16 text-muted">
              Paintings and film work.
            </p>

            {/* Analog Section */}
            <section className="mb-24">
              <div className="mb-10 flex items-center gap-4">
                <h2 className="text-sm font-mono tracking-widest text-accent uppercase">
                  Analog
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <AnalogGallery />
            </section>

            {/* Digital Section */}
            <section>
              <div className="mb-10 flex items-center gap-4">
                <h2 className="text-sm font-mono tracking-widest text-accent uppercase">
                  Digital
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              <DigitalGallery />
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
