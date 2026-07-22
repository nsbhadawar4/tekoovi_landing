import { Play, Quote } from "lucide-react";
import type { Testimonial } from "@/backend/types";
import { GlowCard } from "@/components/ui/glow-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, Container, SectionHeading } from "@/components/ui/section";

export function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [featured, ...rest] = testimonials;

  if (!featured) return null;

  return (
    <Section id="testimonials" className="bg-bg-2">
      <Container>
        <SectionHeading
          eyebrow="Testimonials"
          title={<>Founders don&apos;t hold back about us</>}
          description="The partnerships we're proudest of — in the words of the people who lived them."
        />

        {/* featured / video */}
        <Reveal className="mt-10 sm:mt-14 md:mt-16">
          <GlowCard className="grid gap-6 p-4 sm:gap-8 sm:p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8" radius={520}>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-brand/30 to-[#1b1226]">
              <div className="grid-lines absolute inset-0 opacity-40" />
              <button
                type="button"
                aria-label="Play video testimonial"
                className="group/play absolute inset-0 grid place-items-center"
              >
                <span className="grid h-16 w-16 place-items-center rounded-full glass transition-transform duration-300 group-hover/play:scale-110">
                  <Play className="h-6 w-6 translate-x-0.5 fill-white text-white" />
                </span>
              </button>
              <span className="absolute bottom-4 left-4 rounded-full bg-black/40 px-3 py-1 text-[11px] font-medium text-ink backdrop-blur">
                2:14 · Client story
              </span>
            </div>

            <div className="flex flex-col justify-center">
              <Quote className="h-8 w-8 text-brand-3/60" />
              <p className="mt-4 text-balance font-display text-lg font-medium leading-relaxed text-ink sm:text-xl md:text-2xl">
                “{featured.quote}”
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Avatar initials={featured.initials} />
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {featured.name}
                  </p>
                  <p className="text-xs text-ink-3">{featured.role}</p>
                </div>
              </div>
            </div>
          </GlowCard>
        </Reveal>

        {/* grid */}
        <RevealGroup className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 md:grid-cols-3" stagger={0.08}>
          {rest.map((t) => (
            <RevealItem key={t.id} className="h-full">
              <div className="card-hairline flex h-full flex-col rounded-2xl p-5 sm:p-6">
                <Quote className="h-6 w-6 text-brand-3/50" />
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-2">
                  “{t.quote}”
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar initials={t.initials} />
                  <div>
                    <p className="text-sm font-semibold text-ink">{t.name}</p>
                    <p className="text-xs text-ink-3">{t.role}</p>
                  </div>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-full btn-brand text-xs font-bold text-white">
      {initials}
    </span>
  );
}
