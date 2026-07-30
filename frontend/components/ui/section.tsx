import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import { Badge } from "./badge";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative py-20 sm:py-24 md:py-28 lg:py-36", className)}
    >
      {children}
    </section>
  );
}

/**
 * Section header.
 *
 * `action` puts a control (a "view all" button, carousel hint) opposite the
 * text on wide screens and underneath it on phones — the layout that keeps a
 * long page from reading as one column of centred text.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  action,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  action?: ReactNode;
  className?: string;
}) {
  const isCenter = align === "center" && !action;

  return (
    <div
      className={cn(
        "flex flex-col gap-8",
        Boolean(action) && "md:flex-row md:items-end md:justify-between md:gap-12",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-5",
          isCenter ? "items-center text-center" : "items-start text-left",
        )}
      >
        <Reveal>
          <Badge>{eyebrow}</Badge>
        </Reveal>
        <Reveal delay={0.06}>
          <h2
            className={cn(
              "text-ink-gradient max-w-3xl text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.02em] sm:text-4xl md:text-[2.9rem]",
              isCenter && "mx-auto",
            )}
          >
            {title}
          </h2>
        </Reveal>
        {description && (
          <Reveal delay={0.12}>
            <p
              className={cn(
                "max-w-2xl text-pretty text-[15px] leading-relaxed text-ink-2 sm:text-base md:text-lg",
                isCenter && "mx-auto",
              )}
            >
              {description}
            </p>
          </Reveal>
        )}
        {/* short brand rule under the heading block */}
        <Reveal delay={0.16}>
          <span
            aria-hidden
            className={cn(
              "block h-px w-24 bg-linear-to-r from-brand-2 to-transparent",
              isCenter && "mx-auto bg-linear-to-r from-transparent via-brand-2 to-transparent",
            )}
          />
        </Reveal>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
