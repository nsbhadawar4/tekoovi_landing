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
    <div className={cn("mx-auto w-full max-w-7xl px-6 md:px-8", className)}>
      {children}
    </div>
  );
}

export function Section({
  id,
  children,
  className,
  scrollOffset,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Override the fixed-header offset used by in-page navigation. */
  scrollOffset?: number;
}) {
  return (
    <section
      id={id}
      data-scroll-offset={scrollOffset}
      className={cn("relative py-24 md:py-32", className)}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  const isCenter = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        isCenter ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <Reveal>
        <Badge>{eyebrow}</Badge>
      </Reveal>
      <Reveal delay={0.06}>
        <h2
          className={cn(
            "text-ink-gradient max-w-3xl text-balance text-4xl font-semibold leading-[1.05] md:text-5xl",
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
              "max-w-2xl text-base leading-relaxed text-ink-2 md:text-lg",
              isCenter && "mx-auto",
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
