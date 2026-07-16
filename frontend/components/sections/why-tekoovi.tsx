import { WHY } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, Container } from "@/components/ui/section";

export function WhyTekoovi() {
  return (
    <Section id="why" className="bg-bg-2">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* left — sticky heading */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Badge>Why Tekoovi</Badge>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="text-ink-gradient mt-5 text-balance text-4xl font-semibold leading-[1.05] md:text-5xl">
                A studio built the way we&apos;d want to be hired
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink-2">
                No middlemen, no template factory. Just senior people who care
                about your outcomes as much as the craft.
              </p>
            </Reveal>
          </div>

          {/* right — list */}
          <RevealGroup className="grid gap-4 sm:grid-cols-2" stagger={0.07}>
            {WHY.map((item) => {
              const Icon = item.icon;
              return (
                <RevealItem key={item.title} className="h-full">
                  <div className="card-hairline group flex h-full flex-col gap-3 rounded-2xl p-6 transition-colors duration-300 hover:border-white/15">
                    <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-3">
                      <Icon className="h-[18px] w-[18px]" />
                    </div>
                    <h3 className="font-display text-base font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-2">
                      {item.description}
                    </p>
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
