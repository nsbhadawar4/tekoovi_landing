export type ClassValue = string | number | false | null | undefined;

/** Tiny classnames joiner — no external dependency. */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}
