import type { Industry } from "@/backend/types";
import { getIcon } from "@/lib/icons";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, Container, SectionHeading } from "@/components/ui/section";

export function Industries({ industries }: { industries: Industry[] }) {
  return (
    <Section id="industries" className="relative overflow-hidden">
      <div
        aria-hidden
        className="dot-grid mask-radial-fade pointer-events-none absolute inset-0 opacity-70"
      />

      <Container className="relative">
        <SectionHeading
          eyebrow="Industries"
          title={<>We speak your industry&apos;s language</>}
          description="Domain fluency that means less explaining and more building — across regulated, high-stakes and fast-moving markets."
        />

        <RevealGroup
          className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-16 lg:grid-cols-4"
          stagger={0.05}
        >
          {industries.map((industry, i) => {
            const Icon = getIcon(industry.icon);
            return (
              <RevealItem key={industry.id} className="h-full">
                <div className="group card-lux lift sheen relative flex h-full min-h-[168px] flex-col justify-between gap-8 overflow-hidden rounded-[22px] p-5 sm:min-h-[186px] sm:p-6">
                  {/* oversized ghost watermark of the icon */}
                  {industry.icon && (
                    <Icon
                      aria-hidden
                      className="pointer-events-none absolute -bottom-6 -right-5 h-32 w-32 text-white/[0.04] transition-all duration-700 ease-out-expo group-hover:-rotate-6 group-hover:scale-110 group-hover:text-brand-3/20"
                    />
                  )}
                  {/* brand wash rising from the corner */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(180px_circle_at_12%_118%,rgba(138,92,255,0.24),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  <div className="relative flex items-start justify-between">
                    {industry.icon && (
                      <span className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-brand-3 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-transparent group-hover:bg-brand group-hover:text-white group-hover:shadow-[var(--shadow-brand)]">
                        <Icon className="h-5 w-5" />
                      </span>
                    )}
                    <span className="ml-auto font-mono text-[11px] tabular-nums text-ink-3/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {industry.name && (
                    <span className="relative mt-auto text-[15px] font-semibold leading-snug text-ink">
                      {industry.name}
                    </span>
                  )}
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </Section>
  );
}
