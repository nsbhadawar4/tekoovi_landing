import { ArrowUpRight } from "lucide-react";
import { CASE_STUDY } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/ui/glow-card";
import { Reveal } from "@/components/ui/reveal";
import { Section, Container, SectionHeading } from "@/components/ui/section";

const NARRATIVE = [
  { label: "Problem", body: CASE_STUDY.problem },
  { label: "Research", body: CASE_STUDY.research },
  { label: "Solution", body: CASE_STUDY.solution },
  { label: "Challenges", body: CASE_STUDY.challenges },
];

export function CaseStudy() {
  return (
    <Section id="case-study">
      <Container>
        <SectionHeading
          eyebrow="Case Study"
          title={CASE_STUDY.title}
          description={`A deep-dive into how we partnered with ${CASE_STUDY.client} — from research to measurable outcome.`}
        />

        <Reveal className="mt-16">
          <GlowCard className="p-6 md:p-10" radius={520}>
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              {/* narrative */}
              <div className="flex flex-col gap-8">
                {NARRATIVE.map((block) => (
                  <div key={block.label} className="relative pl-5">
                    <span className="absolute left-0 top-1 h-full w-px bg-linear-to-b from-brand-2/60 to-transparent" />
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-3">
                      {block.label}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-2">
                      {block.body}
                    </p>
                  </div>
                ))}

                <div className="flex flex-wrap gap-2 pt-1">
                  {CASE_STUDY.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-ink-2"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* outcome panel */}
              <div className="flex flex-col gap-6">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-brand/25 to-transparent p-6">
                  <div className="grid-lines absolute inset-0 opacity-40" />
                  <div className="relative">
                    <p className="text-xs uppercase tracking-[0.14em] text-ink-3">
                      Outcome
                    </p>
                    <p className="mt-2 font-display text-2xl font-semibold text-ink">
                      A pilot that clinicians actually love — and measurable
                      time back at the bedside.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {CASE_STUDY.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="card-hairline rounded-xl p-5"
                    >
                      <p className="text-ink-gradient font-display text-3xl font-bold">
                        {m.value}
                      </p>
                      <p className="mt-1 text-xs text-ink-2">{m.label}</p>
                    </div>
                  ))}
                </div>

                <Button href="#contact" variant="secondary" withArrow>
                  Read the full case study
                </Button>
              </div>
            </div>
          </GlowCard>
        </Reveal>
      </Container>
    </Section>
  );
}
