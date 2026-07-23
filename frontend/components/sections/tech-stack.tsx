import type { Tech } from "@/backend/types";
import { Marquee } from "@/components/ui/marquee";
import { Section, Container, SectionHeading } from "@/components/ui/section";

export function TechStack({ techStack }: { techStack: Tech[] }) {
  const mid = Math.ceil(techStack.length / 2);
  const firstRow = techStack.slice(0, mid);
  const secondRow = techStack.slice(mid);

  return (
    <Section id="stack" className="relative overflow-hidden bg-bg-2">
      {/* ambient brand glow behind the conveyor */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-64 w-3/4 max-w-4xl -translate-y-1/4 rounded-full bg-brand/8 blur-[120px]"
      />

      <Container className="relative">
        <SectionHeading
          eyebrow="Technology"
          title={<>A modern stack chosen for longevity</>}
          description="Battle-tested tools we reach for again and again — selected for scale, speed and a decade of maintainability, not hype."
        />
      </Container>

      <div className="relative mt-10 flex flex-col gap-4 sm:mt-14 sm:gap-5 md:mt-16">
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
    <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-2/40 hover:bg-white/[0.05]">
      <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04] font-display text-sm font-bold text-brand-3 transition-all duration-300 group-hover:border-transparent group-hover:bg-brand group-hover:text-white group-hover:shadow-[0_6px_16px_-6px_rgba(108,59,255,0.75)]">
        {name.charAt(0)}
      </span>
      <span className="whitespace-nowrap font-display text-base font-semibold text-ink">
        {name}
      </span>
    </div>
  );
}
