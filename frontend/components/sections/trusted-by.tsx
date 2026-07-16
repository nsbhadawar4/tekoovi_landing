import { STATS, MARQUEE_LOGOS } from "@/lib/data";
import { Counter } from "@/components/ui/counter";
import { Marquee } from "@/components/ui/marquee";
import { Reveal } from "@/components/ui/reveal";
import { Container } from "@/components/ui/section";

export function TrustedBy() {
  return (
    <section className="relative border-y border-white/10 bg-bg-2 py-20">
      <Container>
        <Reveal className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-3">
            Trusted by teams building at the edge
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-ink-gradient font-display text-5xl font-bold tracking-tight md:text-6xl">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-sm text-ink-2">{stat.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      <div className="mt-16">
        <Marquee slow>
          {MARQUEE_LOGOS.map((logo) => (
            <div
              key={logo}
              className="flex items-center gap-2.5 px-8 text-lg font-semibold tracking-tight text-ink-3 transition-colors hover:text-ink-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              {logo}
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
