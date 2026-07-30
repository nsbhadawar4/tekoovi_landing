import { createElement } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/backend/types";
import { getIcon } from "@/lib/icons";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { cn } from "@/lib/utils";

/**
 * Bento grid: the highlighted service takes a double-width tile, the rest fill
 * in around it. Every tile carries the same anatomy — icon, index, title, copy,
 * hover reveal — so the layout can vary without the design feeling loose.
 */
export function Services({ services }: { services: Service[] }) {
  return (
    <Section id="services" className="relative overflow-hidden bg-bg-2">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-24 h-[460px] w-[460px] rounded-full bg-brand/10 blur-[140px]"
      />

      <Container className="relative">
        <SectionHeading
          eyebrow="What we do"
          title={<>Everything a product needs, under one roof</>}
          description="From first pixel to production scale — a single senior team across design, engineering, AI and growth."
        />

        <RevealGroup
          className="mt-14 grid auto-rows-[minmax(0,1fr)] gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-16 lg:grid-cols-3"
          stagger={0.06}
        >
          {services.map((service, i) => (
            <RevealItem
              key={service.id}
              className={cn("h-full", service.featured && "sm:col-span-2")}
            >
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
    <article
      className={cn(
        "group card-lux border-glow lift sheen relative flex h-full min-h-[15.5rem] flex-col gap-6 overflow-hidden rounded-[24px] p-6 sm:p-8",
        service.featured && "sm:flex-row sm:items-center sm:gap-10",
      )}
    >
      {/* wash that fades up on hover */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100",
          "bg-[radial-gradient(420px_circle_at_15%_110%,rgba(138,92,255,0.16),transparent_70%)]",
        )}
      />
      {service.featured && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(150deg,rgba(138,92,255,0.14),transparent_58%)]"
        />
      )}

      <div className="relative flex items-start justify-between gap-4 sm:flex-col sm:items-start">
        {service.icon && (
          <span
            className={cn(
              "grid h-14 w-14 shrink-0 place-items-center rounded-2xl border transition-all duration-500 group-hover:-translate-y-1",
              service.featured
                ? "btn-brand border-transparent text-white"
                : "border-white/10 bg-white/[0.03] text-brand-3 group-hover:border-transparent group-hover:bg-brand group-hover:text-white group-hover:shadow-[var(--shadow-brand)]",
            )}
          >
            {createElement(Icon, { className: "h-6 w-6" })}
          </span>
        )}
        <span className="ml-auto font-mono text-xs tabular-nums text-ink-3/50 sm:ml-0 sm:hidden">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col">
        <div className="flex items-baseline gap-3">
          {service.title && (
            <h3 className="font-display text-xl font-semibold text-ink transition-colors duration-300 group-hover:text-brand-3">
              {service.title}
            </h3>
          )}
          <span className="ml-auto hidden font-mono text-xs tabular-nums text-ink-3/50 sm:block">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {service.description && (
          <p
            className={cn(
              "mt-3 text-sm leading-relaxed text-ink-2",
              service.featured && "max-w-xl text-[15px]",
            )}
          >
            {service.description}
          </p>
        )}

        <span className="mt-auto flex items-center gap-2 pt-6 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3 transition-colors duration-300 group-hover:text-brand-3">
          <span
            aria-hidden
            className="h-px w-8 bg-linear-to-r from-brand-2/70 to-transparent transition-all duration-500 group-hover:w-14"
          />
          Learn more
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </article>
  );
}
