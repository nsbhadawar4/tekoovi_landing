import { ArrowUpRight, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { Stars } from "@/components/ui/stars";

/**
 * The closing conversion panel that sits above the footer on every page.
 *
 * Renders only when there's somewhere to send people — a Calendly link or an
 * email address. Both come from the admin Contact section, so switching either
 * field off takes its half of the panel with it.
 */
export function CtaBand({
  calendly,
  email,
}: {
  calendly?: string;
  email?: string;
}) {
  if (!calendly && !email) return null;

  return (
    <section className="relative pb-16 pt-4 md:pb-24">
      <Container>
        <div className="frame-gradient relative overflow-hidden rounded-[32px]">
          <div className="relative overflow-hidden rounded-[31px] bg-bg-2 px-6 py-14 text-center sm:px-10 md:px-16 md:py-20">
            {/* depth: brand bloom, dotted field and a top hairline */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-28 left-1/2 h-72 w-[520px] -translate-x-1/2 rounded-full bg-brand/25 blur-[110px]"
            />
            <div
              aria-hidden
              className="dot-grid mask-radial-fade pointer-events-none absolute inset-0 opacity-70"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-16 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent"
            />

            <div className="relative mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-2 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-brand-3" />
                Taking on new projects
              </span>

              <h2 className="text-ink-gradient mt-6 text-balance text-3xl font-semibold leading-[1.06] sm:text-4xl md:text-5xl">
                Let&apos;s build the product your roadmap keeps promising
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-2">
                A 30-minute call is enough to map the fastest route from where
                you are to something shipped. No pitch deck, no pressure.
              </p>

              <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                {calendly && (
                  <Button href={calendly} size="lg" magnetic withArrow>
                    Book a free consultation
                  </Button>
                )}
                {email && (
                  <Button
                    href={`mailto:${email}`}
                    size="lg"
                    variant="secondary"
                    external={false}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {email}
                    </span>
                  </Button>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-ink-3">
                <span className="inline-flex items-center gap-2">
                  <Stars size="h-3 w-3" />
                  Rated 5.0 by the founders we&apos;ve shipped with
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ArrowUpRight className="h-3.5 w-3.5 text-brand-3" />
                  Replies within one business day
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
