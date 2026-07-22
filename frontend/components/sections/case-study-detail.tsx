import Link from "next/link";
import { ArrowLeft, Quote, Sparkles } from "lucide-react";
import type { CaseMetric, CaseStudy, Contact } from "@/backend/types";
import { AuroraBlobs, GridBackdrop } from "@/components/ui/backgrounds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/ui/section";
import { cn } from "@/lib/utils";

/** Blank-line-separated paragraphs. */
function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p
            key={i}
            className="text-[15px] leading-relaxed text-ink-2 md:text-base"
          >
            {p}
          </p>
        ))}
    </>
  );
}

export function CaseStudyDetail({
  caseStudy,
  metrics,
  contact,
}: {
  caseStudy: CaseStudy;
  metrics: CaseMetric[];
  contact: Contact;
}) {
  const chapters = [
    { label: "The problem", body: caseStudy.problem },
    { label: "Our research", body: caseStudy.research },
    { label: "The solution", body: caseStudy.solution },
    { label: "The challenges", body: caseStudy.challenges },
  ].filter((c) => Boolean(c.body?.trim()));

  const tech = caseStudy.tech?.filter(Boolean) ?? [];
  const stats = metrics?.filter((m) => m.value?.trim()) ?? [];

  return (
    <article className="relative">
      {/* ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1200px] overflow-hidden"
      >
        <AuroraBlobs className="opacity-45" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,transparent_55%,var(--color-bg))]" />
      </div>

      {/* ========================= hero ========================= */}
      <section className="relative overflow-hidden pt-28 pb-14 md:pt-32 md:pb-20">
        <GridBackdrop className="opacity-60" />

        <Container className="relative z-10">
          <Reveal>
            <Link
              href="/#case-study"
              className="group inline-flex items-center gap-2.5 text-sm font-medium text-ink-2 transition-colors hover:text-ink"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.05] backdrop-blur transition-colors group-hover:border-white/20 group-hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              </span>
              Back to overview
            </Link>
          </Reveal>

          <Reveal delay={0.06} y={30}>
            <div className="mt-8 max-w-4xl md:mt-10">
              <Badge>Case Study</Badge>

              <h1 className="text-ink-gradient mt-6 text-balance text-[2.5rem] font-semibold leading-[1.03] tracking-tight sm:text-5xl md:text-6xl">
                {caseStudy.title}
              </h1>

              <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-ink-2 md:text-lg">
                A deep-dive into how we partnered with{" "}
                <span className="font-medium text-ink">{caseStudy.client}</span>{" "}
                — from first research to a measurable, shipped outcome.
              </p>

              <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Button href={contact.calendly} size="lg" magnetic withArrow>
                  Start a project like this
                </Button>
                <Button href="/#work" variant="ghost" size="lg">
                  See more work
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ======================= metrics strip ======================= */}
      {stats.length > 0 && (
        <Container className="relative z-10">
          <Reveal>
            <dl
              className={cn(
                "glass grid grid-cols-2 gap-px overflow-hidden rounded-[22px]",
                stats.length >= 4 ? "md:grid-cols-4" : "md:grid-cols-3",
              )}
            >
              {stats.map((m) => (
                <div
                  key={m.id}
                  className="group flex flex-col gap-2 p-6 transition-colors duration-300 hover:bg-white/[0.03] md:p-7"
                >
                  <dt className="text-ink-gradient font-display text-3xl font-bold md:text-4xl">
                    {m.value}
                  </dt>
                  <dd className="text-sm text-ink-2">{m.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      )}

      {/* ========================== body ========================== */}
      <Container className="py-20 md:py-24">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-20">
          {/* narrative */}
          <div className="min-w-0">
            <div className="flex flex-col gap-14 md:gap-16">
              {chapters.map((chapter, i) => (
                <Reveal key={chapter.label}>
                  <section className="relative">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-2/30 bg-brand/10 font-mono text-xs tabular-nums text-brand-3">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        aria-hidden
                        className="h-px flex-1 bg-linear-to-r from-white/15 to-transparent"
                      />
                    </div>
                    <h2 className="mt-5 font-display text-2xl font-semibold text-ink md:text-3xl">
                      {chapter.label}
                    </h2>
                    <div className="mt-5 flex flex-col gap-4">
                      <Paragraphs text={chapter.body} />
                    </div>
                  </section>
                </Reveal>
              ))}
            </div>

            {/* outcome highlight */}
            {caseStudy.outcome?.trim() && (
              <Reveal>
                <figure className="relative mt-16 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(140deg,rgba(138,92,255,0.18),rgba(255,255,255,0.02))] p-8 md:p-10">
                  <div
                    aria-hidden
                    className="grid-lines pointer-events-none absolute inset-0 opacity-30"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/20 blur-3xl"
                  />
                  <div className="relative">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-3">
                      <Sparkles className="h-4 w-4" />
                      The outcome
                    </span>
                    <blockquote className="mt-5 font-display text-2xl font-medium leading-relaxed text-ink md:text-3xl">
                      {caseStudy.outcome}
                    </blockquote>
                  </div>
                </figure>
              </Reveal>
            )}
          </div>

          {/* sticky rail */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="card-elevated rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
                At a glance
              </p>

              <div className="mt-6">
                <p className="text-[11px] uppercase tracking-[0.12em] text-ink-3">
                  Client
                </p>
                <p className="mt-2 font-display text-lg font-semibold text-ink">
                  {caseStudy.client}
                </p>
              </div>

              {tech.length > 0 && (
                <div className="mt-6">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-ink-3">
                    Stack
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tech.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-ink-2 transition-colors hover:border-white/20 hover:text-ink"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(140deg,rgba(138,92,255,0.18),rgba(255,255,255,0.02))] p-6">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/25 blur-3xl"
              />
              <p className="relative font-display text-lg font-semibold text-ink">
                Building something similar?
              </p>
              <p className="relative mt-2 text-sm leading-relaxed text-ink-2">
                Tell us where you are — we&apos;ll map the fastest route to a
                shipped product.
              </p>
              <Button
                href={contact.calendly}
                variant="secondary"
                withArrow
                className="relative mt-6 w-full"
              >
                Book a call
              </Button>
            </div>
          </aside>
        </div>
      </Container>

      {/* ========================= closing CTA ======================== */}
      <Container className="pb-24 md:pb-32">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(140deg,rgba(138,92,255,0.16),rgba(255,255,255,0.02))] p-10 text-center md:p-14">
            <div
              aria-hidden
              className="grid-lines pointer-events-none absolute inset-0 opacity-30"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-brand/25 blur-3xl"
            />
            <div className="relative mx-auto max-w-2xl">
              <Quote className="mx-auto h-8 w-8 text-brand-3" />
              <p className="mt-5 font-display text-2xl font-semibold text-ink md:text-3xl">
                Ready to write your own outcome?
              </p>
              <p className="mt-3 text-ink-2">
                Book a call and we&apos;ll scope the fastest path from idea to
                shipped product.
              </p>
              <div className="mt-8 flex justify-center">
                <Button href={contact.calendly} size="lg" magnetic withArrow>
                  Book a call
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </article>
  );
}
