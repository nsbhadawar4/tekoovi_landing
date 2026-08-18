export type ClassValue = string | number | false | null | undefined;

/** Tiny classnames joiner — no external dependency. */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}

/** URL/anchor-safe slug. Empty or symbol-only input falls back to `fallback`. */
export function slugify(value: string, fallback = "item"): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
}
