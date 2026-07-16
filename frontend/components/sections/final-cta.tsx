import { CalendarCheck, Mail, MessageCircle } from "lucide-react";
import type { Contact } from "@/backend/types";
import { Button } from "@/components/ui/button";
import { AuroraBlobs, GridBackdrop } from "@/components/ui/backgrounds";
import { Reveal } from "@/components/ui/reveal";
import { Section, Container } from "@/components/ui/section";

export function FinalCTA({ contact }: { contact: Contact }) {
  return (
    <Section id="contact">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-bg-2 px-6 py-20 text-center md:px-16 md:py-28">
            <AuroraBlobs />
            <GridBackdrop />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-2/60 to-transparent"
            />

            <div className="relative mx-auto max-w-3xl">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-3">
                {contact.eyebrow}
              </p>
              <h2 className="text-ink-gradient mt-5 text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
                {contact.title}
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-ink-2">
                {contact.subtitle}
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  href={contact.calendly}
                  external
                  size="lg"
                  magnetic
                  withArrow
                >
                  Book Discovery Call
                </Button>
                <Button
                  href={contact.whatsapp}
                  external
                  size="lg"
                  variant="secondary"
                >
                  <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-ink-2">
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-ink"
                >
                  <Mail className="h-4 w-4 text-brand-3" /> {contact.email}
                </a>
                <a
                  href={contact.calendly}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-ink"
                >
                  <CalendarCheck className="h-4 w-4 text-brand-3" /> Calendly
                </a>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]" />
                  Replies within 24 hours
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
