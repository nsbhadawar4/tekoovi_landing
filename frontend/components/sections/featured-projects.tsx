import { ArrowUpRight, MapPin } from "lucide-react";
import type { Project } from "@/backend/types";
import { GlowCard } from "@/components/ui/glow-card";
import { Reveal } from "@/components/ui/reveal";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { cn } from "@/lib/utils";

export function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <Section id="work">
      <Container>
        <SectionHeading
          eyebrow="Selected Work"
          title={<>Products we&apos;re proud to have shipped</>}
          description="A glimpse of the platforms, apps and systems we've built for founders and teams across the world."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={(i % 2) * 0.1}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <GlowCard className="flex h-full flex-col">
      {/* visual */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl border-b border-white/10">
        <div
          className={cn(
            "absolute inset-0 bg-linear-to-br",
            project.accent,
          )}
        />
        <div className="grid-lines absolute inset-0 opacity-40" />
        {/* faux app chrome */}
        <div className="absolute inset-5 rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>
          <div className="flex flex-col gap-2.5 p-5">
            <div className="h-2.5 w-1/3 rounded-full bg-white/25" />
            <div className="h-2 w-2/3 rounded-full bg-white/12" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="h-12 rounded-lg bg-white/[0.07]" />
              <div className="h-12 rounded-lg bg-white/[0.07]" />
              <div className="h-12 rounded-lg bg-brand/25" />
            </div>
          </div>
        </div>
        <span className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-[11px] font-medium text-ink backdrop-blur">
          {project.result}
        </span>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-brand-3">
            {project.category}
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-ink-3">
            <MapPin className="h-3.5 w-3.5" /> {project.country}
          </span>
        </div>

        <h3 className="mt-3 font-display text-2xl font-semibold text-ink">
          {project.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          {project.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-ink-2"
            >
              {t}
            </span>
          ))}
        </div>

        <a
          href="#contact"
          className="group/link mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-brand-3"
        >
          View case study
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </a>
      </div>
    </GlowCard>
  );
}
