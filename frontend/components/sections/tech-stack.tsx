import { TECH_STACK } from "@/lib/data";
import { Marquee } from "@/components/ui/marquee";
import { Section, Container, SectionHeading } from "@/components/ui/section";

export function TechStack() {
  const firstRow = TECH_STACK.slice(0, 8);
  const secondRow = TECH_STACK.slice(8);

  return (
    <Section id="stack" className="overflow-hidden bg-bg-2">
      <Container>
        <SectionHeading
          eyebrow="Technology"
          title={<>A modern stack chosen for longevity</>}
          description="Battle-tested tools we reach for again and again — selected for scale, speed and a decade of maintainability, not hype."
        />
      </Container>

      <div className="mt-16 flex flex-col gap-5">
        <Marquee>
          {firstRow.map((tech) => (
            <TechChip key={tech} name={tech} />
          ))}
        </Marquee>
        <Marquee reverse>
          {secondRow.map((tech) => (
            <TechChip key={tech} name={tech} />
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
