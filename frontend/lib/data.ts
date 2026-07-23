/* -------------------------------------------------------------- */
/*  Static navigation.                                             */
/*                                                                 */
/*  All editable page content now lives in backend/data/content.   */
/*  json and is managed from /admin. These nav links are structural */
/*  (each points at a section anchor id) so they stay in code.      */
/* -------------------------------------------------------------- */

export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Studio", href: "#studio" },
  { label: "FAQ", href: "#faq" },
  // Route link (not a section anchor) — opens the blog page.
  { label: "Blog", href: "/blog" },
] as const;
