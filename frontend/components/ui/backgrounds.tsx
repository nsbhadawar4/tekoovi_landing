import { cn } from "@/lib/utils";

/** Soft, slow-drifting aurora blobs. Pure CSS animation — cheap. */
export function AuroraBlobs({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div className="animate-aurora absolute -top-32 left-[15%] h-[520px] w-[520px] rounded-full bg-brand/20 blur-[140px]" />
      <div className="animate-aurora absolute top-[20%] right-[8%] h-[440px] w-[440px] rounded-full bg-brand-2/15 blur-[150px] [animation-delay:-7s]" />
      <div className="animate-aurora absolute bottom-[-10%] left-[35%] h-[400px] w-[400px] rounded-full bg-[#4a2bb0]/15 blur-[150px] [animation-delay:-13s]" />
    </div>
  );
}

/** Faint technical grid, faded via radial mask. */
export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "grid-lines mask-radial-fade pointer-events-none absolute inset-0",
        className,
      )}
    />
  );
}

/** Thin gradient hairline used to separate major sections. */
export function SectionDivider() {
  return (
    <div
      aria-hidden
      className="mx-auto h-px w-full max-w-7xl bg-linear-to-r from-transparent via-white/10 to-transparent"
    />
  );
}
