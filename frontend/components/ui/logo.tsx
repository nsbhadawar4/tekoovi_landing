import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-8 w-8 place-items-center rounded-[9px] btn-brand">
        <span className="font-display text-[15px] font-bold leading-none text-white">
          T
        </span>
      </span>
      {showWordmark && (
        <span className="font-display text-[17px] font-semibold tracking-tight text-ink">
          Tekoovi
        </span>
      )}
    </span>
  );
}
