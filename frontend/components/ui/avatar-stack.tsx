import { cn } from "@/lib/utils";

/**
 * Overlapping monogram avatars — social proof next to the hero CTAs.
 * Fed from real testimonial initials, so it never invents people.
 */
export function AvatarStack({
  items,
  className,
}: {
  items: { id: string; initials: string; name?: string }[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <span className={cn("flex items-center -space-x-2.5", className)}>
      {items.map((item, i) => (
        <span
          key={item.id}
          title={item.name}
          style={{ zIndex: items.length - i }}
          className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-linear-to-br from-brand-2 to-brand text-[11px] font-bold text-white shadow-[var(--shadow-e1)] ring-2 ring-bg"
        >
          {item.initials.slice(0, 2).toUpperCase()}
        </span>
      ))}
    </span>
  );
}
