import type { Tech } from "@/backend/types";
import { Marquee } from "@/components/ui/marquee";
import { Section, Container, SectionHeading } from "@/components/ui/section";

export function TechStack({ techStack }: { techStack: Tech[] }) {
  // A hidden (or empty) name leaves nothing to put in a chip.
  const chips = techStack.filter((tech) => tech.name);
  const mid = Math.ceil(chips.length / 2);
  const firstRow = chips.slice(0, mid);
  const secondRow = chips.slice(mid);

  return (
    <Section id="stack" className="relative overflow-hidden bg-bg-2">
      {/* ambient glow behind the conveyor */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-72 w-3/4 max-w-4xl -translate-y-1/4 rounded-full bg-brand/10 blur-[130px]"
      />
      <div
        aria-hidden
        className="dot-grid mask-radial-fade pointer-events-none absolute inset-0 opacity-50"
      />

      <Container className="relative">
        <SectionHeading
          eyebrow="Technology"
          title={<>A modern stack chosen for longevity</>}
          description="Battle-tested tools we reach for again and again — selected for scale, speed and a decade of maintainability, not hype."
        />
      </Container>

      <div className="relative mt-14 flex flex-col gap-4 sm:gap-5">
        <Marquee>
          {firstRow.map((tech) => (
            <TechChip key={tech.id} name={tech.name} />
          ))}
        </Marquee>
        <Marquee reverse>
          {secondRow.map((tech) => (
            <TechChip key={tech.id} name={tech.name} />
          ))}
        </Marquee>
      </div>
    </Section>
  );
}

function TechChip({ name }: { name: string }) {
  return (
    <div className="group card-lux relative flex items-center gap-3.5 overflow-hidden rounded-2xl px-5 py-3.5 transition-all duration-500 ease-out-expo hover:-translate-y-1.5 hover:border-brand-2/40">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120px_circle_at_20%_120%,rgba(138,92,255,0.22),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] font-display text-sm font-bold text-brand-3 transition-all duration-500 group-hover:border-transparent group-hover:bg-brand group-hover:text-white group-hover:shadow-[var(--shadow-brand)]">
        {name.charAt(0)}
      </span>
      <span className="relative whitespace-nowrap font-display text-base font-semibold text-ink">
        {name}
      </span>
    </div>
  );
}
