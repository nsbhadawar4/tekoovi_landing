import { FOUNDER, CONTACT } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { Section, Container } from "@/components/ui/section";

export function Founder() {
  return (
    <Section id="founder">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          {/* portrait */}
          <Reveal>
            <div className="relative mx-auto max-w-sm">
              <div
                aria-hidden
                className="absolute -inset-4 rounded-[2rem] bg-brand/15 blur-2xl"
              />
              <div className="card-hairline relative overflow-hidden rounded-[1.75rem] p-8">
                <div className="grid-lines absolute inset-0 opacity-30" />
                <div className="relative flex flex-col items-center text-center">
                  <span className="grid h-28 w-28 place-items-center rounded-full btn-brand font-display text-3xl font-bold text-white">
                    {FOUNDER.initials}
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-ink">
                    {FOUNDER.name}
                  </h3>
                  <p className="mt-1 text-sm text-brand-3">{FOUNDER.role}</p>
                  <div className="mt-5 flex gap-2">
                    {CONTACT.socials.slice(0, 3).map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:border-white/20 hover:text-ink"
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* story */}
          <div>
            <Reveal>
              <Badge>The Studio</Badge>
            </Reveal>
            <Reveal delay={0.06}>
              <blockquote className="mt-6 text-balance font-display text-2xl font-medium leading-snug text-ink md:text-[28px]">
                “{FOUNDER.story}”
              </blockquote>
            </Reveal>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Reveal delay={0.1}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-3">
                    Mission
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">
                    {FOUNDER.mission}
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.16}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-3">
                    Vision
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">
                    {FOUNDER.vision}
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.2}>
              <p className="mt-8 font-display text-lg text-ink-3">
                — {FOUNDER.name.split(" ")[0]}, on why Tekoovi exists
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
