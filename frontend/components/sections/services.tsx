import { Sparkles } from "lucide-react";
import type { Service } from "@/backend/types";
import { SERVICE_ICONS } from "@/lib/icons";
import { GlowCard } from "@/components/ui/glow-card";
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
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.06}
        >
          {services.map((service) => (
            <RevealItem key={service.id} className="h-full">
              <ServiceCard service={service} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const Icon = SERVICE_ICONS[service.icon] ?? Sparkles;
  return (
    <GlowCard
      className={cn(
        "flex h-full flex-col gap-4 p-6",
        service.featured && "ring-1 ring-brand/25",
      )}
    >
      <div
        className={cn(
          "grid h-11 w-11 place-items-center rounded-xl border transition-transform duration-300 group-hover:-translate-y-0.5",
          service.featured
            ? "btn-brand border-transparent text-white"
            : "border-white/10 bg-white/[0.03] text-brand-3",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-ink">
          {service.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          {service.description}
        </p>
      </div>
    </GlowCard>
  );
}
