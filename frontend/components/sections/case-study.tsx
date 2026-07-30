import Link from "next/link";
import { ArrowUpRight, MapPin, TrendingUp } from "lucide-react";
import type { Project } from "@/backend/types";
import { Button } from "@/components/ui/button";
import { Carousel } from "@/components/ui/carousel";
import { Reveal } from "@/components/ui/reveal";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { caseStudyDetailHref } from "@/lib/projects";
import { cn } from "@/lib/utils";

/**
 * Client stories as a swipeable rail.
 *
 * Cards are wide and image-led — one story at a time on a phone, two and a
 * half on a desktop so the rail visibly continues past the fold.
 */
export function CaseStudy({ projects }: { projects: Project[] }) {
  const featured = projects.slice(0, 6);
  if (featured.length === 0) return null;

  return (
    <Section id="case-study" className="relative overflow-hidden bg-bg-2">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/4 h-[460px] w-[460px] rounded-full bg-brand/12 blur-[140px]"
      />

      <Container className="relative">
        <SectionHeading
          align="left"
          eyebrow="Case Studies"
          title={<>Client success stories</>}
          description="Real engagements, real numbers — swipe through the work behind the results."
          action={
            <Button href="/#work" variant="secondary" withArrow>
              View all work
            </Button>
          }
        />

        <Reveal className="mt-12 sm:mt-14">
          <Carousel
            label="Client success stories"
            slideClass="basis-[86%] sm:basis-[58%] lg:basis-[42%]"
            autoPlay
            showProgress
            slides={featured.map((project) => (
              <StoryCard key={project.id} project={project} />
            ))}
          />
        </Reveal>
      </Container>
    </Section>
  );
}

function StoryCard({ project }: { project: Project }) {
  return (
    <Link
      href={caseStudyDetailHref(project)}
      target="_blank"
      rel="noopener noreferrer"
      className="group card-lux lift sheen relative flex h-full flex-col overflow-hidden rounded-[26px]"
    >
      {/* ---------- visual ---------- */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {project.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image}
            alt={`${project.name} — ${project.category}`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-out-expo group-hover:scale-[1.08]"
          />
        ) : (
          <div className="absolute inset-0">
            <div
              className={cn("absolute inset-0 bg-linear-to-br", project.accent)}
            />
            <div className="grid-lines absolute inset-0 opacity-40" />
            <span className="absolute inset-0 grid place-items-center font-display text-[6rem] font-bold leading-none text-white/[0.06]">
              {project.name.charAt(0)}
            </span>
          </div>
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/15 to-transparent opacity-75 transition-opacity duration-500 group-hover:opacity-95"
        />

        {project.category && (
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-brand-3 backdrop-blur">
            {project.category}
          </span>
        )}

        <span className="absolute bottom-4 left-4 inline-flex translate-y-3 items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#0f1117] opacity-0 shadow-lg transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
          Read case study
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>

      {/* ---------- body ---------- */}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {project.name && (
          <h3 className="font-display text-xl font-semibold text-ink transition-colors duration-300 group-hover:text-brand-3 sm:text-2xl">
            {project.name}
          </h3>
        )}
        {project.description && (
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-2">
            {project.description}
          </p>
        )}

        {/* headline metric — the reason anyone reads a case study */}
        {project.result && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-brand-2/25 bg-brand/10 px-4 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl btn-brand text-white">
              <TrendingUp className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold leading-snug text-ink">
              {project.result}
            </p>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          {project.country ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-3">
              <MapPin className="h-3.5 w-3.5" />
              {project.country}
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-brand-3">
            Read story
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
