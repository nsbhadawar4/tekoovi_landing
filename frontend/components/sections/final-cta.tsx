import { CalendarCheck, Mail, MessageCircle } from "lucide-react";
import { CONTACT } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { AuroraBlobs, GridBackdrop } from "@/components/ui/backgrounds";
import { Reveal } from "@/components/ui/reveal";
import { Section, Container } from "@/components/ui/section";

export function FinalCTA() {
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
                Let&apos;s talk
              </p>
              <h2 className="text-ink-gradient mt-5 text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
                Let&apos;s build something amazing together
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-ink-2">
                Book a free discovery call. We&apos;ll pressure-test your idea,
                map the fastest path to launch, and show you exactly how
                we&apos;d build it.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  href={CONTACT.calendly}
                  external
                  size="lg"
                  magnetic
                  withArrow
                >
                  Book Discovery Call
                </Button>
                <Button
                  href={CONTACT.whatsapp}
                  external
                  size="lg"
                  variant="secondary"
                >
                  <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-ink-2">
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-ink"
                >
                  <Mail className="h-4 w-4 text-brand-3" /> {CONTACT.email}
                </a>
                <a
                  href={CONTACT.calendly}
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
