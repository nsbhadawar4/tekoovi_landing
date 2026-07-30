import { isHidden, type Logo, type Stat } from "@/backend/types";
import { Counter } from "@/components/ui/counter";
import { Marquee } from "@/components/ui/marquee";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Container } from "@/components/ui/section";

export function TrustedBy({
  stats,
  logos,
}: {
  stats: Stat[];
  logos: Logo[];
}) {
  const named = logos.filter((logo) => logo.name);

  return (
    <section className="relative overflow-hidden border-y border-line bg-bg-2 py-20 md:py-28">
      {/* ambient depth */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0">
        <div className="mx-auto h-56 w-3/4 max-w-4xl rounded-full bg-brand/12 blur-[120px]" />
      </div>
      <div
        aria-hidden
        className="dot-grid mask-radial-fade pointer-events-none absolute inset-0 opacity-60"
      />

      <Container className="relative">
        <Reveal className="mb-12 text-center">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-3 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-2 shadow-[0_0_10px_2px_rgba(138,92,255,0.7)]" />
            Trusted by teams building at the edge
          </span>
        </Reveal>

        {/* ---------------- stat cards ---------------- */}
        {stats.length > 0 && (
          <RevealGroup
            className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
            stagger={0.07}
          >
            {stats.map((stat, i) => (
              <RevealItem key={stat.id} className="h-full">
                <div className="group relative h-full">
                  <div className="card-lux border-glow lift relative h-full overflow-hidden rounded-[22px] p-6 text-center sm:p-8">
                    {/* corner bloom */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-brand/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-brand-2/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />

                    <p className="relative font-mono text-[11px] tabular-nums text-brand-3/60">
                      {String(i + 1).padStart(2, "0")}
                    </p>

                    {/* The number is a real 0 sometimes, so an empty value can't
                        stand in for "hidden" — ask the record directly. */}
                    {!isHidden(stat, "value") && (
                      <p className="text-ink-gradient relative mt-3 font-display text-[2.75rem] font-bold leading-none tracking-tight sm:text-5xl">
                        <Counter to={stat.value} suffix={stat.suffix} />
                      </p>
                    )}
                    {stat.label && (
                      <p className="relative mt-3 text-sm leading-snug text-ink-2">
                        {stat.label}
                      </p>
                    )}
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </Container>

      {/* ---------------- client logos ---------------- */}
      {named.length > 0 && (
        <div className="relative mt-16">
          <Reveal className="mb-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-ink-3/70">
              Powering ambitious teams worldwide
            </p>
          </Reveal>
          <Marquee slow>
            {named.map((logo) => (
              <div
                key={logo.id}
                className="group mx-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-3.5 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-brand-2/40 hover:bg-white/[0.04] hover:shadow-[var(--shadow-brand)]"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] font-display text-xs font-bold text-brand-3 transition-colors duration-500 group-hover:border-transparent group-hover:bg-brand group-hover:text-white">
                  {logo.name.charAt(0)}
                </span>
                <span className="whitespace-nowrap text-base font-semibold tracking-tight text-ink-3 transition-colors duration-500 group-hover:text-ink">
                  {logo.name}
                </span>
              </div>
            ))}
          </Marquee>
        </div>
      )}
    </section>
  );
}
