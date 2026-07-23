import type { Logo, Stat } from "@/backend/types";
import { Counter } from "@/components/ui/counter";
import { Marquee } from "@/components/ui/marquee";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/ui/section";

export function TrustedBy({
  stats,
  logos,
}: {
  stats: Stat[];
  logos: Logo[];
}) {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-bg-2 py-16 sm:py-18 md:py-24">
      {/* ambient brand glow */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0">
        <div className="mx-auto h-44 w-3/4 max-w-4xl rounded-full bg-brand/10 blur-[110px]" />
      </div>

      <Container className="relative">
        <Reveal className="mb-10 text-center sm:mb-12">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-3 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-2 shadow-[0_0_10px_2px_rgba(138,92,255,0.7)]" />
            Trusted by teams building at the edge
          </span>
        </Reveal>

        {/* stat panel */}
        <Reveal delay={0.05}>
          <dl className="glass grid grid-cols-2 divide-x divide-y divide-white/[0.08] overflow-hidden rounded-[24px] md:grid-cols-4 md:divide-y-0">
            {stats.map((stat, i) => (
              <div
                key={stat.id}
                className="group relative flex flex-col items-center gap-2.5 p-6 text-center transition-colors duration-300 hover:bg-white/[0.02] sm:p-8"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {/* accent glow on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-px left-1/2 h-px w-16 -translate-x-1/2 bg-linear-to-r from-transparent via-brand-2/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <dt className="text-ink-gradient font-display text-4xl font-bold leading-none tracking-tight sm:text-5xl md:text-[3.25rem]">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </dt>
                <dd className="text-sm text-ink-2">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>

      {/* client logos */}
      <div className="relative mt-14 sm:mt-16">
        <Reveal className="mb-7 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-3/70">
            Powering ambitious teams worldwide
          </p>
        </Reveal>
        <Marquee slow>
          {logos.map((logo) => (
            <div
              key={logo.id}
              className="mx-2 flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.02] px-5 py-2 text-base font-semibold tracking-tight text-ink-3 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.04] hover:text-ink-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-3/70" />
              {logo.name}
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
