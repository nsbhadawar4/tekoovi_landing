import { INDUSTRIES } from "@/lib/data";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, Container, SectionHeading } from "@/components/ui/section";

export function Industries() {
  return (
    <Section id="industries">
      <Container>
        <SectionHeading
          eyebrow="Industries"
          title={<>We speak your industry&apos;s language</>}
          description="Domain fluency that means less explaining and more building — across regulated, high-stakes and fast-moving markets."
        />

        <RevealGroup
          className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          stagger={0.05}
        >
          {INDUSTRIES.map((industry) => {
            const Icon = industry.icon;
            return (
              <RevealItem key={industry.name}>
                <div className="group card-hairline relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl px-6 py-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-white/15">
                  <div
                    aria-hidden
                    className="absolute inset-x-0 -bottom-10 h-24 bg-brand/20 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <div className="relative grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-brand-3 transition-colors duration-300 group-hover:text-brand-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="relative text-sm font-medium text-ink">
                    {industry.name}
                  </span>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </Section>
  );
}
