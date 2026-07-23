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
                <div className="group relative flex h-full min-h-[150px] flex-col justify-between gap-8 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0)_60%)] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-2/40 sm:min-h-[172px] sm:p-6">
                  {/* oversized ghost watermark of the icon */}
                  <Icon
                    aria-hidden
                    className="pointer-events-none absolute -bottom-5 -right-4 h-28 w-28 text-white/[0.04] transition-all duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110 group-hover:text-brand-3/15"
                  />
                  {/* brand wash rising from the corner on hover */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(150px_circle_at_15%_115%,rgba(138,92,255,0.2),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  {/* top sheen */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"
                  />

                  <div className="relative grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-brand-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-brand-2/40 group-hover:text-brand-2">
                    <Icon className="h-5 w-5" />
                  </div>

                  <span className="relative text-[15px] font-semibold text-ink">
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
