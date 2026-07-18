import type { Founder as FounderContent, Social } from "@/backend/types";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { Section, Container } from "@/components/ui/section";

/* Maps a social label to a brand glyph; falls back to the label text. */
function SocialGlyph({ label }: { label: string }) {
  const key = label.toLowerCase();
  const cls = "h-[18px] w-[18px]";

  if (key === "x" || key === "twitter")
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
      </svg>
    );
  if (key.includes("linkedin"))
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
      </svg>
    );
  if (key.includes("dribbble"))
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
        <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12Zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87Zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.816Zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855Zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.176ZM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285Zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.386Z" />
      </svg>
    );
  if (key.includes("github"))
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12Z" />
      </svg>
    );
  if (key.includes("instagram"))
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
      </svg>
    );
  return <span className="text-xs font-semibold">{label}</span>;
}

export function Founder({
  founder,
  socials,
}: {
  founder: FounderContent;
  socials: Social[];
}) {
  return (
    <Section id="studio">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          {/* portrait card */}
          <Reveal>
            <div className="group relative mx-auto w-full max-w-sm">
              {/* ambient glow */}
              <div
                aria-hidden
                className="absolute -inset-6 rounded-[2.5rem] bg-brand/20 opacity-70 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              />

              <div className="card-hairline glass relative overflow-hidden rounded-[1.75rem] p-8">
                <div
                  aria-hidden
                  className="grid-lines pointer-events-none absolute inset-0 opacity-30"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-brand/25 blur-[70px]"
                />

                {/* status pill */}
                <div className="relative flex justify-end">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium tracking-wide text-ink-2">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    Available for projects
                  </span>
                </div>

                <div className="relative mt-4 flex flex-col items-center text-center">
                  {/* avatar with rotating gradient ring */}
                  <div className="relative h-28 w-28">
                    <div
                      aria-hidden
                      className="absolute inset-0 animate-spin-slow rounded-full [background:conic-gradient(from_0deg,transparent_0deg,var(--color-brand-2)_90deg,var(--color-brand-3)_170deg,transparent_300deg)]"
                    />
                    <span className="absolute inset-[4px] grid place-items-center rounded-full btn-brand font-display text-3xl font-bold text-white">
                      {founder.initials}
                    </span>
                    {/* online dot */}
                    <span
                      aria-hidden
                      className="absolute bottom-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-card ring-1 ring-white/10"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-xl font-semibold text-ink">
                    {founder.name}
                  </h3>
                  <p className="mt-1 text-sm text-brand-3">{founder.role}</p>

                  <div className="my-6 h-px w-16 bg-line" />

                  {/* social icons */}
                  <div className="flex items-center gap-2.5">
                    {socials.slice(0, 4).map((s) => (
                      <a
                        key={s.id}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        title={s.label}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-ink-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:bg-brand/10 hover:text-ink"
                      >
                        <SocialGlyph label={s.label} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* story */}
          <div>
            <Reveal>
              <Badge>The Studio</Badge>
            </Reveal>
            <Reveal delay={0.06}>
              <blockquote className="relative mt-6">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -left-2 -top-8 font-display text-7xl leading-none text-brand/20 select-none"
                >
                  &ldquo;
                </span>
                <p className="relative text-balance font-display text-2xl font-medium leading-snug text-ink md:text-[28px]">
                  {founder.story}
                </p>
              </blockquote>
            </Reveal>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Reveal delay={0.1}>
                <div className="card-hairline h-full rounded-2xl p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-3" />
                    Mission
                  </p>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-2">
                    {founder.mission}
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.16}>
                <div className="card-hairline h-full rounded-2xl p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-3" />
                    Vision
                  </p>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-2">
                    {founder.vision}
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.2}>
              <p className="mt-8 font-display text-lg text-ink-3">
                — {founder.name.split(" ")[0]}, on why Tekoovi exists
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
