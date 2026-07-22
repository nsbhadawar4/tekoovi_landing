import type { Industry } from "@/backend/types";
import { getIcon } from "@/lib/icons";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, Container, SectionHeading } from "@/components/ui/section";

export function Industries({ industries }: { industries: Industry[] }) {
  return (
    <Section id="industries">
      <Container>
        <SectionHeading
          eyebrow="Industries"
          title={<>We speak your industry&apos;s language</>}
          description="Domain fluency that means less explaining and more building — across regulated, high-stakes and fast-moving markets."
        />

        <RevealGroup
          className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:grid-cols-3 sm:gap-4 lg:mt-16 lg:grid-cols-4"
          stagger={0.05}
        >
          {industries.map((industry) => {
            const Icon = getIcon(industry.icon);
            return (
              <RevealItem key={industry.id}>
                <div className="group card-hairline relative flex min-h-[156px] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl px-3 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-white/15 sm:min-h-0 sm:px-6 sm:py-8">
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
