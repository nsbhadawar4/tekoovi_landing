import { Check } from "lucide-react";
import type { WhyItem } from "@/backend/types";
import { getIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, Container } from "@/components/ui/section";

const PROMISES = ["Senior-led", "No middlemen", "Outcome-first"];

export function WhyTekoovi({ why }: { why: WhyItem[] }) {
  return (
    <Section id="why" className="relative overflow-hidden bg-bg-2">
      {/* ambient brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-28 top-10 h-[520px] w-[520px] rounded-full bg-brand/12 blur-[140px]"
      />

      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* ---------- left: sticky pitch ---------- */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Badge>Why Tekoovi</Badge>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="text-ink-gradient mt-6 text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.02em] sm:text-4xl md:text-[2.9rem]">
                A studio built the way we&apos;d want to be hired
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-ink-2">
                No middlemen, no template factory. Just senior people who care
                about your outcomes as much as the craft.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <ul className="mt-8 flex flex-col gap-3">
                {PROMISES.map((promise) => (
                  <li
                    key={promise}
                    className="flex items-center gap-3 text-sm font-medium text-ink-2"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-brand-2/30 bg-brand/10 text-brand-3">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {promise}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* ---------- right: reason rows ---------- */}
          <RevealGroup className="flex flex-col gap-3 sm:gap-4" stagger={0.07}>
            {why.map((item, i) => {
              const Icon = getIcon(item.icon);
              return (
                <RevealItem key={item.id}>
                  <div className="group card-lux sheen relative flex gap-5 overflow-hidden rounded-[22px] p-5 transition-transform duration-500 ease-out-expo hover:translate-x-1 sm:gap-6 sm:p-7">
                    {/* accent bar that grows on hover */}
                    <span
                      aria-hidden
                      className="absolute left-0 top-7 h-0 w-[3px] rounded-r-full bg-linear-to-b from-brand-2 to-brand transition-all duration-500 group-hover:h-16"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand/25 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                    />

                    {item.icon && (
                      <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-brand-3 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-transparent group-hover:bg-brand group-hover:text-white group-hover:shadow-[var(--shadow-brand)]">
                        <Icon className="h-5 w-5" />
                      </span>
                    )}

                    <div className="relative min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        {item.title && (
                          <h3 className="font-display text-lg font-semibold text-ink transition-colors duration-300 group-hover:text-brand-3">
                            {item.title}
                          </h3>
                        )}
                        <span className="font-mono text-xs tabular-nums text-ink-3/40">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      {item.description && (
                        <p className="mt-2 text-sm leading-relaxed text-ink-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </Container>
    </Section>
  );
}
