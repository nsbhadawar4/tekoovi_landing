import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Quote,
  Timer,
  TrendingUp,
} from "lucide-react";
import type { Contact, Project } from "@/backend/types";
import { AuroraBlobs, GridBackdrop } from "@/components/ui/backgrounds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/ui/glow-card";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/ui/section";
import { projectHref } from "@/lib/projects";
import { cn } from "@/lib/utils";

/** Blank-line-separated paragraphs, same authoring rules as the legal pages. */
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

function ProjectImage({
  project,
  src,
  initialClass = "text-[7rem]",
  imgClassName = "object-cover",
}: {
  project: Project;
  src?: string;
  /** Font size of the fallback initial. */
  initialClass?: string;
  /** Extra classes for the <img> — e.g. object-fit / positioning. */
  imgClassName?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={`${project.name} — ${project.category}`}
        className={cn("absolute inset-0 h-full w-full", imgClassName)}
      />
    );
  }
  return (
    <div className="absolute inset-0">
      <div className={cn("absolute inset-0 bg-linear-to-br", project.accent)} />
      <div className="grid-lines absolute inset-0 opacity-40" />
      <span
        className={cn(
          "absolute inset-0 grid place-items-center font-display font-bold leading-none text-white/[0.06]",
          initialClass,
        )}
      >
        {project.name.charAt(0)}
      </span>
    </div>
  );
}

/** A contained image resting on a blurred fill of itself — no letterbox gaps. */
function ContainedImage({ src, alt }: { src: string; alt: string }) {
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
        className="absolute inset-0 h-full w-full object-contain top-[60px]"
      />
    </>
  );
}

/** Gradient-hairline frame used by the showcase and gallery images. */
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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent"
        />
      </div>
    </div>
  );
}

export function WorkDetail({
  project,
  next,
  contact,
}: {
  project: Project;
  next?: Project;
  contact: Contact;
}) {
  const chapters = [
    {
      label: "Overview",
      body: project.overview?.trim() || project.description,
    },
    { label: "The challenge", body: project.challenge?.trim() },
    { label: "What we built", body: project.solution?.trim() },
    { label: "The outcome", body: project.outcome?.trim() },
  ].filter((c): c is { label: string; body: string } => Boolean(c.body));

  const highlights = project.highlights?.filter(Boolean) ?? [];
  const services = project.services?.filter(Boolean) ?? [];
  const gallery = [project.gallery1, project.gallery2, project.gallery3]
    .map((g) => g?.trim())
    .filter((g): g is string => Boolean(g));
  const thinStory = chapters.length < 2 && !project.quote?.trim();

  const facts = [
    { icon: MapPin, label: "Location", value: project.country },
    { icon: CalendarDays, label: "Year", value: project.year?.trim() },
    { icon: Timer, label: "Timeline", value: project.duration?.trim() },
    { icon: TrendingUp, label: "Headline result", value: project.result },
  ].filter((f): f is { icon: typeof MapPin; label: string; value: string } =>
    Boolean(f.value),
  );

  return (
    <article className="relative">
      {/* ambient wash of the cover behind the top of the page */}
      {project.image && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1600px] overflow-hidden"
        >
          <div
            className="absolute inset-0 scale-125 bg-cover bg-center opacity-40 blur-[130px] saturate-150"
            style={{ backgroundImage: `url(${project.image})` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,15,0.45),rgba(8,9,15,0.9)_45%,var(--color-bg))]" />
        </div>
      )}

      {/* ========================= hero ========================= */}
      <section className="relative flex min-h-[80svh] items-end overflow-hidden pb-16 pt-28 md:min-h-[90svh] md:pb-24 md:pt-28">
        <div aria-hidden className="absolute inset-0">
          {project.image ? (
            <ContainedImage
              src={project.image}
              alt={`${project.name} — ${project.category}`}
            />
          ) : (
            <ProjectImage
              project={project}
              src={project.image}
              initialClass="text-[16rem]"
            />
          )}
          {/* cinematic legibility gradients + blend into the page bg */}
          <div className="absolute inset-0 sbg-[linear-gradient(180deg,rgba(8,9,15,0.6)_0%,rgba(8,9,15,0.25)_28%,rgba(8,9,15,0.85)_76%,var(--color-bg)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,15,0.85),rgba(8,9,15,0.2)_58%,transparent)]" />
        </div>
        <AuroraBlobs className="opacity-35" />
        <GridBackdrop className="opacity-50" />

        <Container className="relative z-10">
          <Reveal>
            <Link
              href="/#work"
              className="group inline-flex items-center gap-2.5 text-sm font-medium text-ink-2 transition-colors hover:text-ink"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.05] backdrop-blur transition-colors group-hover:border-white/20 group-hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              </span>
              Back to selected work
            </Link>
          </Reveal>

          <Reveal delay={0.06} y={30}>
            <div className="relative mt-8 overflow-hidden rounded-[28px] p-7 md:mt-10 md:p-10 glass">
              {/* top brand accent hairline */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-2/70 to-transparent"
              />
              <Badge>{project.category}</Badge>

              <h1 className="text-ink-gradient mt-6 text-balance text-[2.5rem] font-semibold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">
                {project.name}
              </h1>

              <p className="mt-5 text-pretty text-base leading-relaxed text-ink-2 md:text-lg">
                {project.description}
              </p>

              {facts.length > 0 && (
                <div className="mt-7 flex flex-wrap items-center gap-2.5 border-t border-white/10 pt-6">
                  {facts.map((fact) => (
                    <span
                      key={fact.label}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-ink-2 backdrop-blur transition-colors hover:border-white/20 hover:text-ink"
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
                <Button href="/#work" variant="ghost" size="lg">
                  See more work
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ======================= fact strip ======================= */}
      {facts.length > 0 && (
        <Container className="relative z-10 -mt-10 md:-mt-14">
          <Reveal>
            <dl className="glass grid grid-cols-2 gap-px overflow-hidden rounded-[22px] md:grid-cols-4">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="group relative flex flex-col gap-4 p-6 transition-colors duration-300 hover:bg-white/[0.03]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-brand/10 text-brand-3 transition-colors duration-300 group-hover:bg-brand/20">
                    <fact.icon className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">
                      {fact.label}
                    </dt>
                    <dd className="mt-1.5 font-display text-lg font-semibold leading-snug text-ink">
                      {fact.value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      )}

      {/* ======================== highlights ====================== */}
      {highlights.length > 0 && (
        <Container className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.slice(0, 8).map((h, i) => (
              <Reveal key={h} delay={(i % 4) * 0.06}>
                <div className="card-hairline group relative h-full overflow-hidden rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-brand/15 opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] font-mono text-xs tabular-nums text-brand-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-4 font-display text-lg font-semibold leading-snug text-ink">
                    {h}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      )}

      {/* ========================== body ========================== */}
      <Container className="py-20 md:py-24">
        <div
          className={cn(
            "grid gap-14",
            // A thin story can't fill a column beside the ~340px sidebar, and
            // the leftover run of empty space reads as a bug. In that case the
            // narrative goes full width and the two cards sit side by side
            // under it instead.
            !thinStory && "lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-20",
          )}
        >
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
                    <div
                      className={cn(
                        "mt-5 flex flex-col gap-4",
                        thinStory && "max-w-3xl",
                      )}
                    >
                      <Paragraphs text={chapter.body} />
                    </div>
                  </section>
                </Reveal>
              ))}
            </div>

            {project.quote?.trim() && (
              <Reveal>
                <figure className="relative mt-16 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(140deg,rgba(138,92,255,0.16),rgba(255,255,255,0.02))] p-8 md:p-10">
                  <div
                    aria-hidden
                    className="grid-lines pointer-events-none absolute inset-0 opacity-30"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/20 blur-3xl"
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

          {/* side cards — a sticky rail beside a full story, a row under a
              thin one */}
          <aside
            className={cn(
              thinStory
                ? "grid gap-4 md:grid-cols-2"
                : "lg:sticky lg:top-28 lg:self-start",
            )}
          >
            <div className="card-elevated rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
                At a glance
              </p>

              {services.length > 0 && (
                <div className="mt-6">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-ink-3">
                    Services
                  </p>
                  <ul className="mt-3 flex flex-col gap-2.5">
                    {services.map((s) => (
                      <li
                        key={s}
                        className="flex items-center gap-2.5 text-sm text-ink-2"
                      >
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-3/70 shadow-[0_0_8px_1px_rgba(179,136,255,0.6)]"
                        />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6">
                <p className="text-[11px] uppercase tracking-[0.12em] text-ink-3">
                  Stack
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-ink-2 transition-colors hover:border-white/20 hover:text-ink"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={cn(
                "relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(140deg,rgba(138,92,255,0.18),rgba(255,255,255,0.02))] p-6",
                !thinStory && "mt-4",
              )}
            >
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

      {/* ========================= gallery ======================== */}
      {gallery.length > 0 && (
        <Container className="pb-10 md:pb-14">
          <Reveal>
            <div className="flex items-center gap-4">
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
              "mt-8 grid gap-5",
              gallery.length > 1 && "md:grid-cols-2",
            )}
          >
            {gallery.map((src, i) => (
              <Reveal
                key={i}
                delay={(i % 2) * 0.08}
                className={cn(
                  gallery.length === 3 && i === 2 && "md:col-span-2",
                )}
              >
                <Framed className="group">
                  <div className="relative aspect-[16/10] max-h-125 w-full overflow-hidden">
                    <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.03]">
                      <ContainedImage
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

      {/* ======================= next project ===================== */}
      {next && (
        <Container className="pb-12 md:pb-16">
          <Reveal>
            <Link href={projectHref(next)} className="group block">
              <GlowCard className="p-5 md:p-7" radius={560}>
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-center gap-6">
                    <div className="relative hidden aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-xl border border-white/10 sm:block">
                      <ProjectImage
                        project={next}
                        src={next.image}
                        initialClass="text-5xl"
                        imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
                        Next case study
                      </p>
                      <p className="mt-2.5 font-display text-3xl font-semibold text-ink transition-colors group-hover:text-brand-3 md:text-4xl">
                        {next.name}
                      </p>
                      <p className="mt-1.5 text-sm text-ink-2">
                        {next.category}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-ink transition-colors group-hover:text-brand-3 md:pr-2">
                    View case study
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </GlowCard>
            </Link>
          </Reveal>
        </Container>
      )}
    </article>
  );
}
