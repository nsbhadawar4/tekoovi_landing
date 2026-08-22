"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { api, SessionExpired } from "./api";
import {
  Button,
  Card,
  ErrorState,
  PageHeader,
  Skeleton,
  inputClass,
  useToast,
} from "./ui";

/* -------------------------------------------------------------- */
/*  Menu manager.                                                   */
/*                                                                  */
/*  Order is the array order — the arrows move an item and the save  */
/*  sends the list as it stands, so nothing has to track index       */
/*  numbers. Header and footer are edited on the same screen.        */
/* -------------------------------------------------------------- */

interface MenuItem {
  label: string;
  url: string;
  newTab: boolean;
  active: boolean;
  block?: string;
  order: number;
}

interface Menu {
  _id: string;
  name: string;
  location: "header" | "footer" | "custom";
  items: MenuItem[];
}

const BLANK_ITEM: MenuItem = {
  label: "",
  url: "",
  newTab: false,
  active: true,
  block: "",
  order: 0,
};

export function MenuManager() {
  const notify = useToast();

  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingLocation, setSavingLocation] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.get<Menu[]>("/menus");
      if (!result.ok) {
        setError(result.message || "Could not load the menus.");
        return;
      }
      setMenus(result.data ?? []);
    } catch (err) {
      if (err instanceof SessionExpired) window.location.assign("/admin/login");
      else setError("Could not load the menus.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Scheduled rather than called during the commit: the first thing load()
  // does is flip a loading flag, and React must not be told to re-render while
  // it is still committing this one.
  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  function update(location: string, items: MenuItem[]) {
    setMenus((current) =>
      current.map((menu) => (menu.location === location ? { ...menu, items } : menu)),
    );
  }

  function move(location: string, index: number, direction: -1 | 1) {
    const menu = menus.find((m) => m.location === location);
    if (!menu) return;

    const items = [...menu.items];
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    [items[index], items[target]] = [items[target], items[index]];
    update(location, items);
  }

  async function save(menu: Menu) {
    setSavingLocation(menu.location);
    try {
      const result = await api.put("/menus", {
        location: menu.location,
        name: menu.name,
        items: menu.items,
      });

      if (!result.ok) {
        notify("error", result.message || "Could not save the menu.");
        return;
      }
      notify("success", `${menu.name} saved`);
    } catch (err) {
      if (err instanceof SessionExpired) window.location.assign("/admin/login");
      else notify("error", "Could not save the menu.");
    } finally {
      setSavingLocation("");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menus"
        description="The links in the site header and footer."
      />

      {loading ? (
        <Skeleton rows={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        menus.map((menu) => (
          <Card key={menu.location} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold capitalize text-ink">
                  {menu.location} menu
                </h2>
                <p className="mt-0.5 text-xs text-ink-3">
                  {menu.items.length} item{menu.items.length === 1 ? "" : "s"}
                </p>
              </div>
              <Button
                onClick={() => save(menu)}
                loading={savingLocation === menu.location}
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>

            <div className="space-y-2">
              {menu.items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-line bg-white/[0.02] p-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      value={item.label}
                      onChange={(e) => {
                        const items = [...menu.items];
                        items[index] = { ...item, label: e.target.value };
                        update(menu.location, items);
                      }}
                      placeholder="Label"
                      aria-label="Label"
                      className={`${inputClass} sm:w-44`}
                    />
                    <input
                      value={item.url}
                      onChange={(e) => {
                        const items = [...menu.items];
                        items[index] = { ...item, url: e.target.value };
                        update(menu.location, items);
                      }}
                      placeholder="/about or #work or https://…"
                      aria-label="Link"
                      className={`${inputClass} flex-1`}
                    />

                    <div className="flex shrink-0 items-center gap-1">
                      <IconButton
                        label="Move up"
                        disabled={index === 0}
                        onClick={() => move(menu.location, index, -1)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        label="Move down"
                        disabled={index === menu.items.length - 1}
                        onClick={() => move(menu.location, index, 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        label="Remove"
                        onClick={() =>
                          update(
                            menu.location,
                            menu.items.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-300" />
                      </IconButton>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 pl-1 text-xs text-ink-3">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.active}
                        onChange={(e) => {
                          const items = [...menu.items];
                          items[index] = { ...item, active: e.target.checked };
                          update(menu.location, items);
                        }}
                        className="h-3.5 w-3.5 accent-brand"
                      />
                      Visible
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.newTab}
                        onChange={(e) => {
                          const items = [...menu.items];
                          items[index] = { ...item, newTab: e.target.checked };
                          update(menu.location, items);
                        }}
                        className="h-3.5 w-3.5 accent-brand"
                      />
                      Open in a new tab
                    </label>
                    {item.block && (
                      <span title="Hidden automatically when this landing-page block is switched off">
                        linked to the “{item.block}” block
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="secondary"
              onClick={() =>
                update(menu.location, [
                  ...menu.items,
                  { ...BLANK_ITEM, order: menu.items.length },
                ])
              }
            >
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </Card>
        ))
      )}
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white/[0.02] text-ink-3 transition-colors hover:bg-white/[0.06] hover:text-ink disabled:opacity-40"
    >
      {children}
    </button>
  );
}
