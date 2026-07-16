import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Marquee({
  children,
  reverse = false,
  slow = false,
  className,
}: {
  children: ReactNode;
  reverse?: boolean;
  slow?: boolean;
  className?: string;
}) {
  const speed = reverse
    ? "animate-marquee-rev"
    : slow
      ? "animate-marquee-slow"
      : "animate-marquee";

  return (
    <div className={cn("mask-fade-x flex w-full overflow-hidden", className)}>
      <div className={cn("flex shrink-0 items-center", speed)}>
        <div className="flex shrink-0 items-center gap-4 pr-4">{children}</div>
        <div
          aria-hidden
          className="flex shrink-0 items-center gap-4 pr-4"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
