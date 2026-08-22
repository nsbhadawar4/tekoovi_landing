import type { MenuItem } from "@/backend/models/menu.model";
import { isBlockVisible } from "@/backend/types";

/* -------------------------------------------------------------- */
/*  Navigation.                                                    */
/*                                                                 */
/*  Menus are managed in the admin (Site → Menus). These constants  */
/*  are the fallback used when a menu has not been saved yet, so a  */
/*  fresh install still has a working header instead of an empty    */
/*  one.                                                            */
/* -------------------------------------------------------------- */

export type NavLink = {
  label: string;
  href: string;
  /**
   * Landing-page block this link scrolls to. When that block is switched off
   * its anchor no longer exists, so the link goes with it.
   */
  block?: string;
  newTab?: boolean;
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

/** Menu items from the database in the shape the header and footer expect. */
export function toNavLinks(items: MenuItem[]): NavLink[] {
  return items.map((item) => ({
    label: item.label,
    href: item.url,
    block: item.block || undefined,
    newTab: item.newTab,
  }));
}

/**
 * The links to render.
 *
 * Anything pointing at a switched-off landing-page block is dropped, which is
 * what stops the header offering a jump to a section that isn't on the page.
 */
export function visibleNavLinks(
  pageSections?: Record<string, boolean>,
  menuItems?: MenuItem[],
): NavLink[] {
  const links =
    menuItems && menuItems.length > 0 ? toNavLinks(menuItems) : NAV_LINKS;

  return links.filter(
    (link) => !link.block || isBlockVisible(pageSections, link.block),
  );
}
