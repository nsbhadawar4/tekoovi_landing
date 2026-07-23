import { createElement } from "react";
import type { Service } from "@/backend/types";
import { getIcon } from "@/lib/icons";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { cn } from "@/lib/utils";

export function Services({ services }: { services: Service[] }) {
  return (
    <Section id="services" className="bg-bg-2">
      <Container>
        <SectionHeading
          eyebrow="What we do"
          title={<>Everything a product needs, under one roof</>}
          description="From first pixel to production scale — a single senior team across design, engineering, AI and growth."
        />

        <RevealGroup
          className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:mt-16 lg:grid-cols-3"
          stagger={0.06}
        >
          {services.map((service, i) => (
            <RevealItem key={service.id} className="h-full">
              <ServiceCard service={service} index={i} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const Icon = getIcon(service.icon);

  return (
    <div className="group h-full min-h-[15.5rem] perspective-[1800px]">
      <div className="relative h-full min-h-[15.5rem] transform-3d transition-transform duration-700 ease-out-expo will-change-transform group-hover:rotate-y-180">
        {/* ---------------- FRONT ---------------- */}
        <div
          className={cn(
            "card-hairline absolute inset-0 flex flex-col gap-5 overflow-hidden rounded-2xl p-6 backface-hidden sm:p-7",
            service.featured && "ring-1 ring-brand/30",
          )}
        >
          {service.featured && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(138,92,255,0.12),transparent_55%)]"
            />
          )}

          <div className="relative flex items-start justify-between">
            <div
              className={cn(
                "grid h-12 w-12 place-items-center rounded-2xl border",
                service.featured
                  ? "btn-brand border-transparent text-white"
                  : "border-white/10 bg-white/[0.03] text-brand-3",
              )}
            >
              {createElement(Icon, { className: "h-5 w-5" })}
            </div>
            <span className="font-mono text-xs tabular-nums text-ink-3/50">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="relative flex-1">
            <h3 className="font-display text-lg font-semibold text-ink">
              {service.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              {service.description}
            </p>
          </div>

          <span
            aria-hidden
            className="relative h-px w-8 rounded-full bg-linear-to-r from-brand-2/70 to-transparent"
          />
        </div>

        {/* ---------------- BACK ---------------- */}
        <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-2/30 bg-[linear-gradient(150deg,rgba(138,92,255,0.28),rgba(20,21,31,0.94))] p-6 backface-hidden rotate-y-180 sm:p-7">
          <div
            aria-hidden
            className="grid-lines pointer-events-none absolute inset-0 opacity-30"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/30 blur-3xl"
          />

          <div className="relative">
            <div className="grid h-12 w-12 place-items-center rounded-2xl btn-brand text-white shadow-[0_8px_24px_-8px_rgba(108,59,255,0.7)]">
              {createElement(Icon, { className: "h-5 w-5" })}
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold text-ink">
              {service.title}
            </h3>
          </div>

          <p className="relative text-sm leading-relaxed text-ink-2">
            {service.description}
          </p>
        </div>
      </div>
    </div>
  );
}
