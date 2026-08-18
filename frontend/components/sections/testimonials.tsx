import { Quote } from "lucide-react";
import type { Testimonial } from "@/backend/types";
import { Carousel } from "@/components/ui/carousel";
import { Reveal } from "@/components/ui/reveal";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Stars } from "@/components/ui/stars";

/**
 * Testimonials as an auto-advancing rail.
 *
 * Every quote gets the same generous card instead of one hero quote and a row
 * of small ones — it reads as a body of proof, and nothing is buried.
 */
export function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const quotes = testimonials.filter(
    (t) => t.quote || t.name || t.role || t.initials,
  );
  if (quotes.length === 0) return null;

  return (
    <Section id="testimonials" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-72 w-2/3 max-w-3xl rounded-full bg-brand/10 blur-[130px]"
      />

      <Container className="relative">
        <SectionHeading
          align="left"
          eyebrow="Testimonials"
          title={<>Founders don&apos;t hold back about us</>}
          description="The partnerships we're proudest of — in the words of the people who lived them."
          action={
            <span className="hidden items-center gap-3 rounded-2xl border border-line bg-white/[0.02] px-4 py-3 md:inline-flex">
              <Stars />
              <span className="text-sm text-ink-2">
                <span className="font-semibold text-ink">5.0</span> average from{" "}
                {quotes.length} client{quotes.length === 1 ? "" : "s"}
              </span>
            </span>
          }
        />

        <Reveal className="mt-12 sm:mt-14">
          <Carousel
            label="Client testimonials"
            slideClass="basis-full sm:basis-[62%] lg:basis-[42%]"
            autoPlay
            intervalMs={6500}
            showProgress
            slides={quotes.map((t) => (
              <QuoteCard key={t.id} testimonial={t} />
            ))}
          />
        </Reveal>
      </Container>
    </Section>
  );
}

function QuoteCard({ testimonial: t }: { testimonial: Testimonial }) {
  return (
    <figure className="card-lux border-glow group relative flex h-full flex-col gap-6 overflow-hidden rounded-[26px] p-7 sm:p-9">
      {/* watermark quote */}
      <Quote
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-3 h-28 w-28 text-white/[0.04] transition-colors duration-500 group-hover:text-brand-3/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(360px_circle_at_20%_0%,rgba(138,92,255,0.14),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative flex items-center gap-3">
        <Stars />
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-ink-3">
          Verified client
        </span>
      </div>

      {t.quote && (
        <blockquote className="relative flex-1 text-pretty font-display text-lg font-medium leading-relaxed text-ink sm:text-xl">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
      )}

      {(t.initials || t.name || t.role) && (
        <figcaption className="relative flex items-center gap-3.5 border-t border-line pt-6">
          {t.initials && (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full btn-brand text-sm font-bold text-white">
              {t.initials}
            </span>
          )}
          <span className="min-w-0">
            {t.name && (
              <span className="block truncate text-sm font-semibold text-ink">
                {t.name}
              </span>
            )}
            {t.role && (
              <span className="block truncate text-xs text-ink-3">{t.role}</span>
            )}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
