import type { WhyItem } from "@/backend/types";
import { getIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, Container } from "@/components/ui/section";

export function WhyTekoovi({ why }: { why: WhyItem[] }) {
  return (
    <Section id="why" className="relative overflow-hidden bg-bg-2">
      {/* ambient brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 h-[420px] w-[420px] rounded-full bg-brand/10 blur-[130px]"
      />

      <Container className="relative">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* left — sticky heading */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Badge>Why Tekoovi</Badge>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="text-ink-gradient mt-5 text-balance text-3xl font-semibold leading-[1.08] sm:text-4xl md:text-5xl">
                A studio built the way we&apos;d want to be hired
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink-2">
                No middlemen, no template factory. Just senior people who care
                about your outcomes as much as the craft.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium uppercase tracking-[0.14em] text-ink-3">
                {["Senior-led", "No middlemen", "Outcome-first"].map(
                  (tag, i) => (
                    <span key={tag} className="inline-flex items-center gap-2">
                      {i > 0 && (
                        <span
                          aria-hidden
                          className="h-3 w-px bg-white/15"
                        />
                      )}
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-2 shadow-[0_0_8px_1px_rgba(138,92,255,0.6)]" />
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </Reveal>
          </div>

          {/* right — list */}
          <RevealGroup className="grid gap-3 sm:grid-cols-2 sm:gap-4" stagger={0.07}>
            {why.map((item, i) => {
              const Icon = getIcon(item.icon);
              return (
                <RevealItem key={item.id} className="h-full">
                  <div className="group relative flex h-full flex-col gap-3.5 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0)_55%)] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-2/40 sm:p-6">
                    {/* left accent bar grows on hover */}
                    <span
                      aria-hidden
                      className="absolute left-0 top-6 h-0 w-[3px] rounded-r-full bg-linear-to-b from-brand-2 to-brand transition-all duration-300 group-hover:h-12"
                    />
                    {/* corner glow */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand/25 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                    />

                    <div className="relative flex items-start justify-between">
                      {item.icon && (
                        <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-brand-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-transparent group-hover:bg-brand group-hover:text-white group-hover:shadow-[0_8px_22px_-8px_rgba(108,59,255,0.75)]">
                          <Icon className="h-[18px] w-[18px]" />
                        </div>
                      )}
                      <span className="ml-auto font-mono text-xs tabular-nums text-ink-3/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {item.title && (
                      <h3 className="relative font-display text-base font-semibold text-ink">
                        {item.title}
                      </h3>
                    )}
                    {item.description && (
                      <p className="relative text-sm leading-relaxed text-ink-2">
                        {item.description}
                      </p>
                    )}
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
