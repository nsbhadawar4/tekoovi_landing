import { cn } from "@/lib/utils";

export const LOGO_ASPECT = 3;

export function Logo({
  className,
  logoImage,
  showWordmark = true,
}: {
  className?: string;
  logoImage?: string;
  showWordmark?: boolean;
}) {
  const image = logoImage?.trim();

  if (image) {
    return (
      <span
        role="img"
        aria-label="Tekoovi"
        className={cn("inline-block h-9 bg-contain bg-left bg-no-repeat", className)}
        style={{ backgroundImage: `url(${image})`, aspectRatio: LOGO_ASPECT }}
      />
    );
  }

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
