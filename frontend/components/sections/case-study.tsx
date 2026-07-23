import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/backend/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Section, Container } from "@/components/ui/section";
import { caseStudyDetailHref } from "@/lib/projects";
import { cn } from "@/lib/utils";

export function CaseStudy({ projects }: { projects: Project[] }) {
  // Lead with three success stories; the rest live on the Work page.
  const featured = projects.slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <Section id="case-study" className="bg-bg-2">
      <Container>
        {/* header — title left, CTA right (like the reference) */}
        <div className="flex gap-6 text-center justify-center">
          <Reveal>
            <div>
              <Badge>Case Studies</Badge>
              <h2 className="text-ink-gradient mt-5 text-balance text-3xl font-semibold leading-[1.08] sm:text-4xl md:text-[2.75rem]">
                Client success stories
              </h2>
            </div>
          </Reveal>
        </div>

        {/* grid */}
        <div className="mt-10 grid gap-6 sm:mt-14 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {featured.map((project, i) => (
            <Reveal key={project.id} delay={(i % 3) * 0.09}>
              <StoryCard project={project} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 flex justify-center">
            <Button href="/#work" variant="secondary" withArrow>
              View all work
            </Button>
          </div>
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
      className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0)_38%)] transition-[transform,border-color,box-shadow] duration-500 ease-out will-change-transform hover:border-brand-2/40 hover:shadow-[0_34px_80px_-44px_rgba(108,59,255,0.6)]"
    >
      {/* ---------- visual ---------- */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {project.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image}
            alt={`${project.name} — ${project.category}`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
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

        {/* legibility + hover-deepening gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-95"
        />

        {/* diagonal shine sweep on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.16)_50%,transparent_70%)] transition-transform duration-[1100ms] ease-out group-hover:translate-x-full"
        />

        {/* category chip */}
        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-brand-3 backdrop-blur">
          {project.category}
        </span>

        {/* reveal-on-hover: read case study */}
        <span className="absolute bottom-4 left-4 inline-flex translate-y-3 items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#0f1117] opacity-0 shadow-lg transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          Read case study
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>

      {/* ---------- body ---------- */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-xl font-semibold text-ink transition-colors duration-300 group-hover:text-brand-3 sm:text-2xl">
          {project.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-2">
          {project.description}
        </p>

        {/* metric pills */}
        <div className="mt-5 flex flex-wrap gap-2 pt-1">
          {project.result && (
            <span className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-[0_6px_16px_-8px_rgba(108,59,255,0.85)] transition-transform duration-300 group-hover:-translate-y-0.5">
              {project.result}
            </span>
          )}
          {project.country && (
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-ink-2">
              {project.country}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
