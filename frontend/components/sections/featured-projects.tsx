import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Project } from "@/backend/types";
import { GlowCard } from "@/components/ui/glow-card";
import { Reveal } from "@/components/ui/reveal";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { projectHref } from "@/lib/projects";
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

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:mt-16 lg:gap-6 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={(i % 3) * 0.08}>
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

        {/* overlays — each chip disappears when its field is empty or hidden */}
        {project.category && (
          <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-brand-3 backdrop-blur">
            {project.category}
          </span>
        )}
        {project.result && (
          <span className="absolute right-3 top-3 max-w-[48%] truncate rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur sm:right-4 sm:top-4 sm:max-w-[55%] sm:px-3">
            {project.result}
          </span>
        )}
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {(project.name || project.country) && (
          <div className="flex items-start justify-between gap-4">
            {project.name && (
              <h3 className="min-w-0 font-display text-xl font-semibold text-ink sm:text-2xl">
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
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {project.description}
          </p>
        )}

        {project.tech.length > 0 && (
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
        )}

        {/* The pseudo-element stretches the hit area over the whole card, so
            the visible link stays a single accessible target. */}
        <Link
          href={projectHref(project)}
          className="group/link mt-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-ink transition-colors after:absolute after:inset-0 hover:text-brand-3"
        >
          View case study
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </Link>
      </div>
    </GlowCard>
  );
}
