import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Five-star row used in the hero trust bar and on testimonials. */
export function Stars({
  count = 5,
  className,
  size = "h-3.5 w-3.5",
}: {
  count?: number;
  className?: string;
  size?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${count} out of 5 stars`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn("fill-amber-300 text-amber-300", size)}
        />
      ))}
    </span>
  );
}
