import Link from "next/link";
import { ArrowUpRight, MapPin, Sparkles } from "lucide-react";
import type { Project } from "@/backend/types";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { TiltCard } from "@/components/ui/tilt-card";
import { projectHref } from "@/lib/projects";
import { cn } from "@/lib/utils";

export function FeaturedProjects({ projects }: { projects: Project[] }) {
  // The newest project leads as a wide showcase; the rest form the grid. One
  // hero-sized card gives the section a focal point instead of nine equals.
  const [lead, ...rest] = projects;

  return (
    <Section id="work">
      <Container>
        <SectionHeading
          align="left"
          eyebrow="Selected Work"
          title={<>Products we&apos;re proud to have shipped</>}
          description="A glimpse of the platforms, apps and systems we've built for founders and teams across the world."
          action={
            lead && (
              <Button href={projectHref(lead)} variant="secondary" withArrow>
                Explore the latest build
              </Button>
            )
          }
        />

        {lead && (
          <Reveal className="mt-12 sm:mt-16">
            <ShowcaseCard project={lead} />
          </Reveal>
        )}

        {rest.length > 0 && (
          <RevealGroup
            className="mt-4 grid gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
            stagger={0.07}
          >
            {rest.map((project) => (
              <RevealItem key={project.id} className="h-full">
                <ProjectCard project={project} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </Container>
    </Section>
  );
}

/* ------------------------- lead showcase ------------------------- */

function ShowcaseCard({ project }: { project: Project }) {
  return (
    <div className="frame-gradient group relative overflow-hidden rounded-[30px]">
      <div className="sheen relative grid overflow-hidden rounded-[29px] bg-card lg:grid-cols-[1.1fr_1fr]">
        {/* visual */}
        <div className="relative aspect-[16/11] overflow-hidden lg:aspect-auto lg:min-h-[480px]">
          {project.image ? (
            // Images come from the media store as plain URLs; next/image adds
            // nothing here and can't handle the data-URL legacy content.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.image}
              alt={`${project.name} — ${project.category}`}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.06]"
            />
          ) : (
            <div className="absolute inset-0">
              <div className={cn("absolute inset-0 bg-linear-to-br", project.accent)} />
              <div className="grid-lines absolute inset-0 opacity-40" />
              <span className="absolute inset-0 grid place-items-center font-display text-[9rem] font-bold leading-none text-white/[0.06]">
                {project.name.charAt(0)}
              </span>
            </div>
          )}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_35%,rgba(8,9,15,0.55))] lg:bg-[linear-gradient(90deg,transparent_45%,rgba(8,9,15,0.75))]"
          />

          {project.category && (
            <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/45 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-brand-3 backdrop-blur">
              {project.category}
            </span>
          )}
        </div>

        {/* copy */}
        <div className="relative flex flex-col justify-center gap-6 p-7 sm:p-10 lg:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/20 blur-[90px]"
          />

          <div className="relative flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full btn-brand px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
            {project.country && (
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-3">
                <MapPin className="h-3.5 w-3.5" />
                {project.country}
              </span>
            )}
          </div>

          {project.name && (
            <h3 className="text-ink-gradient relative font-display text-3xl font-semibold leading-tight sm:text-4xl">
              {project.name}
            </h3>
          )}

          {project.description && (
            <p className="relative max-w-lg text-[15px] leading-relaxed text-ink-2">
              {project.description}
            </p>
          )}

          {project.result && (
            <div className="relative flex items-center gap-3 rounded-2xl border border-brand-2/25 bg-brand/10 px-4 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl btn-brand text-white">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-ink">{project.result}</p>
            </div>
          )}

          {project.tech.length > 0 && (
            <div className="relative flex flex-wrap gap-2">
              {project.tech.slice(0, 6).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-ink-2"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <Link
            href={projectHref(project)}
            className="link-underline relative inline-flex w-fit items-center gap-2 self-start pb-1 text-sm font-semibold text-ink after:absolute after:inset-0 after:content-[''] hover:text-brand-3"
          >
            View the case study
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- grid card --------------------------- */

function ProjectCard({ project }: { project: Project }) {
  return (
    <TiltCard className="group h-full">
      <div className="card-lux sheen relative flex h-full flex-col overflow-hidden rounded-[24px]">
        {/* visual */}
        <div className="relative aspect-[16/10] overflow-hidden border-b border-line">
          {project.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.image}
              alt={`${project.name} — ${project.category}`}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out-expo group-hover:scale-[1.08]"
            />
          ) : (
            <div className="absolute inset-0">
              <div className={cn("absolute inset-0 bg-linear-to-br", project.accent)} />
              <div className="grid-lines absolute inset-0 opacity-40" />
              <span className="absolute inset-0 grid place-items-center font-display text-[7rem] font-bold leading-none text-white/[0.06]">
                {project.name.charAt(0)}
              </span>
            </div>
          )}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/75 via-black/10 to-transparent"
          />

          {project.category && (
            <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-brand-3 backdrop-blur">
              {project.category}
            </span>
          )}
          {project.result && (
            <span className="absolute right-3 top-3 max-w-[48%] truncate rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white shadow-[var(--shadow-brand)] sm:right-4 sm:top-4 sm:px-3">
              {project.result}
            </span>
          )}

          {/* slides up on hover */}
          <span className="absolute bottom-4 left-4 inline-flex translate-y-3 items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#0f1117] opacity-0 shadow-lg transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
            View case study
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          {(project.name || project.country) && (
            <div className="flex items-start justify-between gap-4">
              {project.name && (
                <h3 className="min-w-0 font-display text-xl font-semibold text-ink transition-colors duration-300 group-hover:text-brand-3 sm:text-[1.35rem]">
                  {project.name}
                </h3>
              )}
              {project.country && (
                <span className="mt-1 inline-flex max-w-[42%] shrink-0 items-center gap-1 truncate text-xs text-ink-3">
                  <MapPin className="h-3.5 w-3.5" /> {project.country}
                </span>
              )}
            </div>
          )}

          {project.description && (
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-2">
              {project.description}
            </p>
          )}

          {project.tech.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {project.tech.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-ink-2"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* The pseudo-element stretches the hit area over the whole card. */}
          <Link
            href={projectHref(project)}
            className="mt-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-ink transition-colors after:absolute after:inset-0 hover:text-brand-3"
          >
            View case study
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </TiltCard>
  );
}
