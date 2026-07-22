import type { Tech } from "@/backend/types";
import { Marquee } from "@/components/ui/marquee";
import { Section, Container, SectionHeading } from "@/components/ui/section";

export function TechStack({ techStack }: { techStack: Tech[] }) {
  const mid = Math.ceil(techStack.length / 2);
  const firstRow = techStack.slice(0, mid);
  const secondRow = techStack.slice(mid);

  return (
    <Section id="stack" className="overflow-hidden bg-bg-2">
      <Container>
        <SectionHeading
          eyebrow="Technology"
          title={<>A modern stack chosen for longevity</>}
          description="Battle-tested tools we reach for again and again — selected for scale, speed and a decade of maintainability, not hype."
        />
      </Container>

      <div className="mt-10 flex flex-col gap-4 sm:mt-14 sm:gap-5 md:mt-16">
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
    <div className="glass group flex items-center gap-3 rounded-2xl px-5 py-3.5 transition-colors duration-300 hover:border-white/20">
      <span className="grid h-9 w-9 place-items-center rounded-lg btn-brand font-display text-sm font-bold text-white">
        {name.charAt(0)}
      </span>
      <span className="whitespace-nowrap font-display text-base font-semibold text-ink">
        {name}
      </span>
    </div>
  );
}
