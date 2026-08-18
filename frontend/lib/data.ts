import { isBlockVisible } from "@/backend/types";

/* -------------------------------------------------------------- */
/*  Static navigation.                                             */
/*                                                                 */
/*  All editable page content now lives in backend/data/content.   */
/*  json and is managed from /admin. These nav links are structural */
/*  (each points at a section anchor id) so they stay in code.      */
/* -------------------------------------------------------------- */

export type NavLink = {
  label: string;
  href: string;
  /**
   * Landing-page block this link scrolls to (a key from PAGE_BLOCKS). When the
   * block is switched off in the admin its anchor no longer exists, so the link
   * goes with it. Links without a block are always shown.
   */
  block?: string;
};

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#home", block: "hero" },
  { label: "Work", href: "#work", block: "work" },
  { label: "Services", href: "#services", block: "services" },
  { label: "Process", href: "#process", block: "process" },
  { label: "Studio", href: "#studio", block: "founder" },
  { label: "Blog", href: "#blog", block: "blog" },
  { label: "FAQ", href: "#faq", block: "faq" },
];

/** The nav links whose landing-page section is switched on. */
export function visibleNavLinks(
  pageSections?: Record<string, boolean>,
): NavLink[] {
  return NAV_LINKS.filter(
    (link) => !link.block || isBlockVisible(pageSections, link.block),
  );
}
