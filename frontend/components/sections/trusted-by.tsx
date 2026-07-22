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
    <section className="relative border-y border-white/10 bg-bg-2 py-14 sm:py-16 md:py-20">
      <Container>
        <Reveal className="mb-10 text-center sm:mb-14">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-3">
            Trusted by teams building at the edge
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-y-10 md:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.id} delay={i * 0.08}>
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-ink-gradient font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-sm text-ink-2">{stat.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      <div className="mt-12 sm:mt-16">
        <Marquee slow>
          {logos.map((logo) => (
            <div
              key={logo.id}
              className="flex items-center gap-2.5 px-8 text-lg font-semibold tracking-tight text-ink-3 transition-colors hover:text-ink-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              {logo.name}
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
