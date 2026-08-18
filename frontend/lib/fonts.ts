/* -------------------------------------------------------------- */
/*  Selectable site fonts.                                         */
/*                                                                 */
/*  Single source of truth for the font picker in /admin (Settings */
/*  section) and for applying the chosen family on the frontend    */
/*  (app/(site)/layout.tsx). Plain data — safe to import on both    */
/*  server and client.                                             */
/*                                                                 */
/*  `href` is a Google Fonts stylesheet loaded only when that       */
/*  family is selected; `null` means no external load (the default  */
/*  design font, or a native system stack). Weights in each href    */
/*  are limited to what the family actually ships so the Google     */
/*  Fonts API never 400s on a missing weight.                       */
/* -------------------------------------------------------------- */

export interface FontOption {
  value: string;
  label: string;
  /** CSS font-family stack applied to the whole site when selected. */
  stack: string;
  /** Google Fonts stylesheet href, or null for the default / system fonts. */
  href: string | null;
}

const GF = "https://fonts.googleapis.com/css2?family=";
const SANS = "ui-sans-serif, system-ui, sans-serif";
const SERIF = "ui-serif, Georgia, serif";

/** The default keeps the site's designed look (Inter body + Jakarta headings). */
export const DEFAULT_FONT = "inter";

export const FONT_OPTIONS: FontOption[] = [
  {
    value: "inter",
    label: "Inter (default)",
    stack: `var(--font-inter), ${SANS}`,
    href: null,
  },
  {
    value: "system",
    label: "System (native)",
    stack: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
    href: null,
  },
  {
    value: "poppins",
    label: "Poppins",
    stack: `"Poppins", ${SANS}`,
    href: `${GF}Poppins:wght@400;500;600;700&display=swap`,
  },
  {
    value: "montserrat",
    label: "Montserrat",
    stack: `"Montserrat", ${SANS}`,
    href: `${GF}Montserrat:wght@400;500;600;700&display=swap`,
  },
  {
    value: "roboto",
    label: "Roboto",
    stack: `"Roboto", ${SANS}`,
    href: `${GF}Roboto:wght@400;500;700&display=swap`,
  },
  {
    value: "open-sans",
    label: "Open Sans",
    stack: `"Open Sans", ${SANS}`,
    href: `${GF}Open+Sans:wght@400;500;600;700&display=swap`,
  },
  {
    value: "lato",
    label: "Lato",
    stack: `"Lato", ${SANS}`,
    href: `${GF}Lato:wght@400;700&display=swap`,
  },
  {
    value: "raleway",
    label: "Raleway",
    stack: `"Raleway", ${SANS}`,
    href: `${GF}Raleway:wght@400;500;600;700&display=swap`,
  },
  {
    value: "nunito",
    label: "Nunito",
    stack: `"Nunito", ${SANS}`,
    href: `${GF}Nunito:wght@400;500;600;700&display=swap`,
  },
  {
    value: "work-sans",
    label: "Work Sans",
    stack: `"Work Sans", ${SANS}`,
    href: `${GF}Work+Sans:wght@400;500;600;700&display=swap`,
  },
  {
    value: "dm-sans",
    label: "DM Sans",
    stack: `"DM Sans", ${SANS}`,
    href: `${GF}DM+Sans:wght@400;500;600;700&display=swap`,
  },
  {
    value: "space-grotesk",
    label: "Space Grotesk",
    stack: `"Space Grotesk", ${SANS}`,
    href: `${GF}Space+Grotesk:wght@400;500;600;700&display=swap`,
  },
  {
    value: "manrope",
    label: "Manrope",
    stack: `"Manrope", ${SANS}`,
    href: `${GF}Manrope:wght@400;500;600;700&display=swap`,
  },
  {
    value: "playfair",
    label: "Playfair Display (serif)",
    stack: `"Playfair Display", ${SERIF}`,
    href: `${GF}Playfair+Display:wght@400;500;600;700&display=swap`,
  },
  {
    value: "lora",
    label: "Lora (serif)",
    stack: `"Lora", ${SERIF}`,
    href: `${GF}Lora:wght@400;500;600;700&display=swap`,
  },
];

/** Resolve a stored font value to its option, falling back to the default. */
export function getFont(value: string | undefined | null): FontOption {
  return (
    FONT_OPTIONS.find((f) => f.value === value) ??
    FONT_OPTIONS.find((f) => f.value === DEFAULT_FONT) ??
    FONT_OPTIONS[0]
  );
}
