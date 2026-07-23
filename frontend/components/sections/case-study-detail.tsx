import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Quote,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";
import type { Contact, Project } from "@/backend/types";
import { AuroraBlobs } from "@/components/ui/backgrounds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/ui/section";
import { caseStudyDetailHref } from "@/lib/projects";
import { cn } from "@/lib/utils";

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-ink-2 md:text-base">
            {p}
          </p>
        ))}
    </>
  );
}

/** A contained image on a blurred fill of itself — no letterbox gaps. */
function CoverImage({ src, alt }: { src: string; alt: string }) {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl saturate-125"
        style={{ backgroundImage: `url(${src})` }}
      />
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-contain"
      />
    </>
  );
}

/** Gradient-hairline frame. */
function Framed({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[26px] bg-[linear-gradient(140deg,rgba(255,255,255,0.18),rgba(255,255,255,0.03)_45%,rgba(138,92,255,0.28))] p-px",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[25px] bg-bg-2">
        {children}
      </div>
    </div>
  );
}

export function CaseStudyDetail({
  project,
  next,
  contact,
}: {
  project: Project;
  next?: Project;
  contact: Contact;
}) {
  const chapters = [
    { label: "Overview", body: project.overview?.trim() || project.description },
    { label: "The challenge", body: project.challenge?.trim() },
    { label: "What we built", body: project.solution?.trim() },
    { label: "The outcome", body: project.outcome?.trim() },
  ].filter((c): c is { label: string; body: string } => Boolean(c.body));

  const highlights = project.highlights?.filter(Boolean) ?? [];
  const services = project.services?.filter(Boolean) ?? [];
  const gallery = [project.gallery1, project.gallery2, project.gallery3]
    .map((g) => g?.trim())
    .filter((g): g is string => Boolean(g));

  const facts = [
    { icon: MapPin, label: "Location", value: project.country },
    { icon: CalendarDays, label: "Year", value: project.year?.trim() },
    { icon: Timer, label: "Timeline", value: project.duration?.trim() },
    { icon: TrendingUp, label: "Result", value: project.result },
  ].filter((f): f is { icon: typeof MapPin; label: string; value: string } =>
    Boolean(f.value),
  );

  return (
    <article className="relative">
      {/* ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] overflow-hidden"
      >
        <AuroraBlobs className="opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,transparent_60%,var(--color-bg))]" />
      </div>

      {/* ===================== split hero ===================== */}
      <section className="relative pt-28 pb-14 md:pt-32 md:pb-20">
        <Container>
          <Reveal>
            <Link
              href="/#case-study"
              className="group inline-flex items-center gap-2.5 text-sm font-medium text-ink-2 transition-colors hover:text-ink"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.05] backdrop-blur transition-colors group-hover:border-white/20 group-hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              </span>
              Back to case studies
            </Link>
          </Reveal>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            {/* text */}
            <Reveal delay={0.06} y={30}>
              <div>
                <Badge>{project.category}</Badge>
                <h1 className="text-ink-gradient mt-6 text-balance text-4xl font-semibold leading-[1.04] tracking-tight sm:text-5xl md:text-6xl">
                  {project.name}
                </h1>
                <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-2 md:text-lg">
                  {project.description}
                </p>

                {facts.length > 0 && (
                  <div className="mt-7 flex flex-wrap items-center gap-2.5">
                    {facts.map((fact) => (
                      <span
                        key={fact.label}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-ink-2 backdrop-blur"
                      >
                        <fact.icon className="h-3.5 w-3.5 text-brand-3" />
                        {fact.value}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <Button href={contact.calendly} size="lg" magnetic withArrow>
                    Start a project like this
                  </Button>
                </div>
              </div>
            </Reveal>

            {/* cover */}
            <Reveal delay={0.12} y={30}>
              <Framed>
                <div className="relative aspect-[4/3] w-full">
                  {project.image ? (
                    <CoverImage
                      src={project.image}
                      alt={`${project.name} — ${project.category}`}
                    />
                  ) : (
                    <div className="absolute inset-0">
                      <div
                        className={cn(
                          "absolute inset-0 bg-linear-to-br",
                          project.accent,
                        )}
                      />
                      <div className="grid-lines absolute inset-0 opacity-40" />
                      <span className="absolute inset-0 grid place-items-center font-display text-[8rem] font-bold leading-none text-white/[0.06]">
                        {project.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </Framed>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ===================== results band ===================== */}
      {highlights.length > 0 && (
        <Container className="pb-4">
          <Reveal>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.slice(0, 4).map((h, i) => (
                <div
                  key={h}
                  className="card-hairline group relative overflow-hidden rounded-2xl p-6"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-brand/15 opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <span className="font-mono text-xs tabular-nums text-brand-3/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-3 font-display text-base font-semibold leading-snug text-ink">
                    {h}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      )}

      {/* ===================== story (single column, timeline) ===================== */}
      <Container className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          {(services.length > 0 || project.tech.length > 0) && (
            <Reveal>
              <div className="mb-12 flex flex-wrap gap-x-10 gap-y-6 border-b border-white/10 pb-10">
                {services.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
                      Services
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {services.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-2"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {project.tech.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-ink-3">
                      Stack
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-2"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          )}

          {/* timeline chapters */}
          <div className="relative flex flex-col gap-12 md:gap-16">
            <span
              aria-hidden
              className="absolute bottom-2 left-[15px] top-2 w-px bg-linear-to-b from-brand-2/40 via-white/10 to-transparent"
            />
            {chapters.map((chapter, i) => (
              <Reveal key={chapter.label}>
                <section className="relative pl-12">
                  <span className="absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full border border-brand-2/40 bg-bg font-mono text-xs tabular-nums text-brand-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">
                    {chapter.label}
                  </h2>
                  <div className="mt-4 flex flex-col gap-4">
                    <Paragraphs text={chapter.body} />
                  </div>
                </section>
              </Reveal>
            ))}
          </div>

          {/* quote */}
          {project.quote?.trim() && (
            <Reveal>
              <figure className="relative mt-16 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(140deg,rgba(138,92,255,0.16),rgba(255,255,255,0.02))] p-8 md:p-10">
                <div
                  aria-hidden
                  className="grid-lines pointer-events-none absolute inset-0 opacity-30"
                />
                <div className="relative">
                  <Quote className="h-8 w-8 text-brand-3" />
                  <blockquote className="mt-5 font-display text-2xl font-medium leading-relaxed text-ink md:text-3xl">
                    {project.quote}
                  </blockquote>
                  {project.quoteAuthor?.trim() && (
                    <figcaption className="mt-6 flex items-center gap-3 text-sm text-ink-3">
                      <span aria-hidden className="h-px w-8 bg-brand-3/50" />
                      {project.quoteAuthor}
                    </figcaption>
                  )}
                </div>
              </figure>
            </Reveal>
          )}
        </div>
      </Container>

      {/* ===================== gallery ===================== */}
      {gallery.length > 0 && (
        <Container className="pb-16 md:pb-20">
          <Reveal>
            <div className="mb-8 flex items-center gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
                Inside the product
              </p>
              <span
                aria-hidden
                className="h-px flex-1 bg-linear-to-r from-white/15 to-transparent"
              />
            </div>
          </Reveal>
          <div
            className={cn(
              "grid gap-5",
              gallery.length > 1 && "md:grid-cols-2",
            )}
          >
            {gallery.map((src, i) => (
              <Reveal
                key={i}
                delay={(i % 2) * 0.08}
                className={cn(gallery.length === 3 && i === 2 && "md:col-span-2")}
              >
                <Framed className="group">
                  <div className="relative aspect-[16/10] max-h-125 w-full overflow-hidden">
                    <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.03]">
                      <CoverImage
                        src={src}
                        alt={`${project.name} — screenshot ${i + 1}`}
                      />
                    </div>
                  </div>
                </Framed>
              </Reveal>
            ))}
          </div>
        </Container>
      )}

      {/* ===================== next + closing ===================== */}
      <Container className="pb-24 md:pb-28">
        {next && (
          <Reveal>
            <Link
              href={caseStudyDetailHref(next)}
              className="group card-hairline mb-8 flex items-center justify-between gap-6 rounded-2xl p-6 transition-colors hover:border-white/15 md:p-7"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
                  Next case study
                </p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink transition-colors group-hover:text-brand-3 md:text-3xl">
                  {next.name}
                </p>
                <p className="mt-1 text-sm text-ink-2">{next.category}</p>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-ink transition-all duration-300 group-hover:border-brand-2/40 group-hover:bg-brand group-hover:text-white">
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </Reveal>
        )}

        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(140deg,rgba(138,92,255,0.16),rgba(255,255,255,0.02))] p-10 text-center md:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-brand/25 blur-3xl"
            />
            <div className="relative mx-auto max-w-2xl">
              <Sparkles className="mx-auto h-8 w-8 text-brand-3" />
              <p className="mt-5 font-display text-2xl font-semibold text-ink md:text-3xl">
                Want results like {project.name}?
              </p>
              <p className="mt-3 text-ink-2">
                Tell us where you are — we&apos;ll map the fastest route to a
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
