"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutList,
  ListTree,
  LogOut,
  Newspaper,
  Settings,

  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastProvider } from "./ui";

/* -------------------------------------------------------------- */
/*  The CMS shell — sidebar, header, and the mobile section sheet.  */
/* -------------------------------------------------------------- */

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Hidden from editors. */
  adminOnly?: boolean;
};

type NavGroup = { heading: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    heading: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Content",
    items: [
      { href: "/admin/posts", label: "Posts", icon: Newspaper },
      { href: "/admin/pages", label: "Pages", icon: FileText },
      { href: "/admin/taxonomy", label: "Categories & Tags", icon: Tags },
      { href: "/admin/media", label: "Media", icon: ImageIcon },
      { href: "/admin/content", label: "Landing page", icon: LayoutList },
    ],
  },
  {
    heading: "Site",
    items: [
      { href: "/admin/menus", label: "Menus", icon: ListTree },
      { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
      { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
    ],
  },
];

export interface CurrentUser {
  name: string;
  email: string;
  role: "admin" | "editor";
}

export function AdminShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  const groups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.adminOnly || user.role === "admin"),
  })).filter((group) => group.items.length > 0);

  const current =
    groups
      .flatMap((group) => group.items)
      // The longest matching href wins, so /admin/posts beats /admin.
      .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0] ?? groups[0].items[0];

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" }).catch(() => null);
    router.replace("/admin/login");
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col md:flex-row">
        {/* ---------------- sidebar (tablet and up) ---------------- */}
        <aside className="hidden shrink-0 border-line bg-bg-2/50 backdrop-blur-xl md:block md:w-64 md:border-r">
          <div className="flex items-center gap-2.5 px-5 py-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg btn-brand font-display text-sm font-bold text-white">
              T
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">Tekoovi CMS</p>
              <p className="text-[11px] text-ink-3">Content studio</p>
            </div>
          </div>

          <nav className="flex max-h-[calc(100vh-140px)] flex-col gap-5 overflow-y-auto px-3 pb-4">
            {groups.map((group) => (
              <div key={group.heading}>
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3/60">
                  {group.heading}
                </p>
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      active={item.href === current.href}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-line px-4 py-4">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-[11px] capitalize text-ink-3">
              {user.role}
            </p>
          </div>
        </aside>

        {/* ---------------------- main column ---------------------- */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg btn-brand font-display text-sm font-bold text-white md:hidden">
                  T
                </span>
                <h1 className="truncate text-[15px] font-semibold text-ink md:text-lg">
                  {current.label}
                </h1>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <a
                  href="/"
                  target="_blank"
                  aria-label="View site"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.02] p-2 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink sm:px-3"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline">View site</span>
                </a>
                <button
                  onClick={logout}
                  aria-label="Log out"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.02] p-2 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink sm:px-3"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              </div>
            </div>

            {/* phone: one tap opens the whole menu */}
            <div className="relative md:hidden">
              <button
                type="button"
                onClick={() => setNavOpen((open) => !open)}
                aria-expanded={navOpen}
                className="flex w-full items-center gap-3 border-t border-line px-4 py-3 text-left"
              >
                <current.icon className="h-4 w-4 shrink-0 text-brand-3" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                  {current.label}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-ink-3 transition-transform duration-300",
                    navOpen && "rotate-180",
                  )}
                />
              </button>

              <AnimatePresence>
                {navOpen && (
                  <motion.nav
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-x-0 top-full z-40 max-h-[62vh] overflow-y-auto border-b border-line bg-bg/95 p-3 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.95)] backdrop-blur-xl"
                  >
                    {groups.map((group) => (
                      <div key={group.heading} className="mb-3 last:mb-0">
                        <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3/60">
                          {group.heading}
                        </p>
                        <div className="grid grid-cols-1 gap-1 min-[430px]:grid-cols-2">
                          {group.items.map((item) => (
                            <NavLink
                              key={item.href}
                              item={item}
                              active={item.href === current.href}
                              onNavigate={() => setNavOpen(false)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.nav>
                )}
              </AnimatePresence>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8 md:px-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
        active
          ? "bg-brand/15 text-ink ring-1 ring-inset ring-brand/25"
          : "text-ink-3 hover:bg-white/[0.04] hover:text-ink",
      )}
    >
      <item.icon className={cn("h-4 w-4 shrink-0", active && "text-brand-3")} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
