"use client";

import { AnimatePresence, motion } from "motion/react";
import { MessagesSquare, Plus } from "lucide-react";
import { useState } from "react";
import type { Faq } from "@/backend/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Section, Container } from "@/components/ui/section";
import { cn } from "@/lib/utils";

export function FAQ({ faqs, calendly }: { faqs: Faq[]; calendly?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  // A question switched off in the admin leaves nothing to open.
  const items = faqs.filter((faq) => faq.q);

  return (
    <Section id="faq" className="relative overflow-hidden">
      <span data-scroll-target aria-hidden className="absolute top-24 md:top-32" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-[420px] w-[420px] rounded-full bg-brand/10 blur-[140px]"
      />

      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          {/* ---------- left: heading + help card ---------- */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Badge>FAQ</Badge>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="text-ink-gradient mt-6 text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.02em] sm:text-4xl md:text-[2.9rem]">
                Answers before you ask
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-ink-2">
                The questions founders ask us most, answered plainly. Anything
                we&apos;ve missed, we&apos;ll happily walk you through.
              </p>
            </Reveal>

            {calendly && (
              <Reveal delay={0.18}>
                <div className="card-lux relative mt-8 overflow-hidden rounded-[22px] p-6">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-brand/25 blur-2xl"
                  />
                  <span className="relative grid h-11 w-11 place-items-center rounded-xl btn-brand text-white">
                    <MessagesSquare className="h-5 w-5" />
                  </span>
                  <p className="relative mt-5 font-display text-lg font-semibold text-ink">
                    Still have a question?
                  </p>
                  <p className="relative mt-2 text-sm leading-relaxed text-ink-2">
                    Grab a 30-minute slot — we&apos;ll answer it and sketch out
                    what building it would take.
                  </p>
                  <Button
                    href={calendly}
                    withArrow
                    className="relative mt-6 w-full"
                  >
                    Book a call
                  </Button>
                </div>
              </Reveal>
            )}
          </div>

          {/* ---------- right: accordion ---------- */}
          <div className="flex flex-col gap-3">
            {items.map((faq, i) => {
              const isOpen = open === i;
              return (
                <Reveal key={faq.id} delay={Math.min(i, 5) * 0.04}>
                  <div
                    className={cn(
                      "card-lux group relative overflow-hidden rounded-[20px] transition-colors duration-500",
                      isOpen && "border-brand-2/35",
                    )}
                  >
                    {isOpen && (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_circle_at_10%_0%,rgba(138,92,255,0.14),transparent_70%)]"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="relative flex w-full items-center gap-4 p-5 text-left sm:gap-6 sm:p-6"
                    >
                      <span
                        className={cn(
                          "font-mono text-xs tabular-nums transition-colors duration-300",
                          isOpen ? "text-brand-3" : "text-ink-3/50",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 font-display text-base font-medium leading-snug text-ink sm:text-lg">
                        {faq.q}
                      </span>
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-out-expo",
                          isOpen
                            ? "rotate-45 border-transparent btn-brand text-white"
                            : "border-white/10 text-ink-2 group-hover:border-brand-2/40 group-hover:text-brand-3",
                        )}
                      >
                        <Plus className="h-4 w-4" />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && faq.a && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                          className="relative overflow-hidden"
                        >
                          <p className="max-w-2xl px-5 pb-6 pl-13 text-sm leading-relaxed text-ink-2 sm:px-6 sm:pl-16">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
