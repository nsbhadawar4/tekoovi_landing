import { CalendarDays, Mail } from "lucide-react";
import type { Contact, LegalClause, LegalMeta } from "@/backend/types";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/section";
import { LegalToc } from "@/components/ui/legal-toc";
import { Reveal } from "@/components/ui/reveal";
import { slugify } from "@/lib/utils";

/** Anchor id for a clause — stable enough for links, readable in the URL. */
const clauseSlug = (heading: string) => slugify(heading, "clause");

/**
 * Clause bodies are authored in the admin as plain text: a blank line starts a
 * new paragraph, and a line beginning with "- " becomes a bullet. Consecutive
 * bullet lines group into one list.
 */
function renderBody(body: string) {
  const blocks = body
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block, i) => {
    const lines = block.split("\n").map((l) => l.trim());
    const bullets = lines.filter((l) => l.startsWith("- "));

    if (bullets.length === lines.length) {
      return (
        <ul key={i} className="flex flex-col gap-2.5">
          {bullets.map((line, j) => (
            <li key={j} className="flex gap-3 text-[15px] leading-relaxed text-ink-2">
              <span
                aria-hidden
                className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-3/70"
              />
              <span>{line.slice(2)}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={i} className="text-[15px] leading-relaxed text-ink-2">
        {block}
      </p>
    );
  });
}

export function LegalPage({
  eyebrow,
  meta,
  clauses,
  contact,
}: {
  eyebrow: string;
  meta: LegalMeta;
  clauses: LegalClause[];
  contact: Contact;
}) {
  // A clause whose heading is switched off in the admin has nothing to list in
  // the contents rail, but its body still belongs on the page.
  const items = clauses
    .filter((c) => c.heading)
    .map((c) => ({
      id: c.id,
      slug: clauseSlug(c.heading),
      heading: c.heading,
    }));

  return (
    <>
      {/* ------------------------- header ------------------------- */}
      <section className="relative overflow-hidden pt-36 pb-16 md:pt-44 md:pb-20">
        <div
          aria-hidden
          className="grid-lines mask-radial-fade pointer-events-none absolute inset-0"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[70%] -translate-x-1/2 rounded-full bg-brand/12 blur-[140px]"
        />
        <Container className="relative">
          <div className="max-w-3xl">
            <Reveal>
              <Badge>{eyebrow}</Badge>
            </Reveal>
            {meta.title && (
              <Reveal delay={0.06}>
                <h1 className="text-ink-gradient mt-6 text-4xl font-semibold leading-[1.05] md:text-6xl">
                  {meta.title}
                </h1>
              </Reveal>
            )}
            {meta.intro && (
              <Reveal delay={0.12}>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-2 md:text-lg">
                  {meta.intro}
                </p>
              </Reveal>
            )}
            {meta.updated && (
              <Reveal delay={0.18}>
                <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-ink-3">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Last updated {meta.updated}
                </span>
              </Reveal>
            )}
          </div>
        </Container>
      </section>

      {/* -------------------------- body -------------------------- */}
      <Container className="relative pb-24 md:pb-32">
        <div className="grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-16">
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              <LegalToc items={items} />
            </div>
          </aside>

          <article className="min-w-0">
            {clauses.length === 0 ? (
              <p className="text-sm text-ink-3">
                This policy is being updated. Please check back shortly.
              </p>
            ) : (
              <div className="flex flex-col gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
                {clauses.map((clause, i) => (
                  <section
                    key={clause.id}
                    id={clause.heading ? clauseSlug(clause.heading) : undefined}
                    className="scroll-mt-28 border-b border-white/[0.06] p-6 last:border-b-0 md:p-9"
                  >
                    {clause.heading && (
                      <div className="flex items-baseline gap-4">
                        <span className="font-mono text-xs tabular-nums text-brand-3/70">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h2 className="text-xl font-semibold text-ink md:text-2xl">
                          {clause.heading}
                        </h2>
                      </div>
                    )}
                    {clause.body && (
                      <div className="mt-4 flex flex-col gap-4 md:pl-10">
                        {renderBody(clause.body)}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}

            {/* questions CTA — nothing to offer without an email address */}
            {contact.email && (
              <div className="mt-10 rounded-3xl border border-white/10 bg-[linear-gradient(140deg,rgba(138,92,255,0.12),rgba(255,255,255,0.02))] p-6 md:p-8">
                <h3 className="text-lg font-semibold text-ink">
                  Questions about this page?
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-2">
                  A real person reads every message. Reach out and we&apos;ll
                  get back to you.
                </p>
                <a
                  href={`mailto:${contact.email}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <Mail className="h-4 w-4" />
                  {contact.email}
                </a>
              </div>
            )}
          </article>
        </div>
      </Container>
    </>
  );
}
