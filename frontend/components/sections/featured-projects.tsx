import { ArrowUpRight, MapPin } from "lucide-react";
import type { Project } from "@/backend/types";
import { GlowCard } from "@/components/ui/glow-card";
import { Reveal } from "@/components/ui/reveal";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { cn } from "@/lib/utils";

export function FeaturedProjects({
  projects,
  calendly,
}: {
  projects: Project[];
  calendly: string;
}) {
  return (
    <Section id="work">
      <Container>
        <SectionHeading
          eyebrow="Selected Work"
          title={<>Products we&apos;re proud to have shipped</>}
          description="A glimpse of the platforms, apps and systems we've built for founders and teams across the world."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={(i % 3) * 0.08}>
              <ProjectCard project={project} calendly={calendly} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function ProjectCard({
  project,
  calendly,
}: {
  project: Project;
  calendly: string;
}) {
  return (
    <GlowCard className="flex h-full flex-col">
      {/* visual */}
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10">
        {project.image ? (
          // Images are stored as data URLs in content, which next/image
          // doesn't support — a plain img renders them directly.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image}
            alt={`${project.name} — ${project.category}`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
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

        {/* legibility gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/70 via-black/10 to-transparent"
        />

        {/* overlays */}
        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-brand-3 backdrop-blur">
          {project.category}
        </span>
        <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-medium text-ink backdrop-blur">
          {project.result}
        </span>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl font-semibold text-ink">
            {project.name}
          </h3>
          <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-xs text-ink-3">
            <MapPin className="h-3.5 w-3.5" /> {project.country}
          </span>
        </div>

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
          href={calendly}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link mt-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-ink transition-colors hover:text-brand-3"
        >
          View case study
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </a>
      </div>
    </GlowCard>
  );
}
