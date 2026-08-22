"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { api, SessionExpired } from "./api";
import { ImagePicker, MediaPickerDialog, useMediaPicker } from "./media-picker";
import {
  Button,
  Card,
  ErrorState,
  Field,
  PageHeader,
  Skeleton,
  inputClass,
  useToast,
} from "./ui";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------- */
/*  Site settings.                                                  */
/*                                                                  */
/*  Four groups, one tab each, one document each. Everything the     */
/*  site reads globally lives here rather than being scattered.      */
/* -------------------------------------------------------------- */

type Settings = Record<string, Record<string, unknown>>;

interface Social {
  label: string;
  href: string;
}

const TABS = [
  { key: "general", label: "General" },
  { key: "contact", label: "Contact" },
  { key: "seo", label: "SEO" },
  { key: "footer", label: "Footer" },
];

export function SettingsManager() {
  const notify = useToast();
  const picker = useMediaPicker();

  const [settings, setSettings] = useState<Settings>({});
  const [tab, setTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.get<Settings>("/settings");
      if (!result.ok) {
        setError(result.message || "Could not load the settings.");
        return;
      }
      setSettings(result.data ?? {});
    } catch (err) {
      if (err instanceof SessionExpired) window.location.assign("/admin/login");
      else setError("Could not load the settings.");
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

  const group = settings[tab] ?? {};

  function set(key: string, value: unknown) {
    setSettings((current) => ({
      ...current,
      [tab]: { ...(current[tab] ?? {}), [key]: value },
    }));
  }

  const text = (key: string) => String(group[key] ?? "");

  async function save() {
    setSaving(true);
    try {
      const result = await api.put(`/settings/${tab}`, group);

      if (!result.ok) {
        notify("error", result.message || "Could not save.");
        return;
      }
      notify("success", "Settings saved");
    } catch (err) {
      if (err instanceof SessionExpired) window.location.assign("/admin/login");
      else notify("error", "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  const socials = Array.isArray(group.socials) ? (group.socials as Social[]) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Site-wide details the whole website reads from."
        action={
          <Button onClick={save} loading={saving} className="w-full sm:w-auto">
            <Save className="h-4 w-4" />
            Save
          </Button>
        }
      />

      <div className="flex flex-wrap gap-1 border-b border-line pb-px">
        {TABS.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded-t-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === item.key
                ? "border-b-2 border-brand-2 text-ink"
                : "text-ink-3 hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <Card className="space-y-5">
          {tab === "general" && (
            <>
              <Field label="Site name">
                <input
                  value={text("siteName")}
                  onChange={(e) => set("siteName", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Tagline" hint="Used as the default page description.">
                <input
                  value={text("tagline")}
                  onChange={(e) => set("tagline", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Logo" hint="Wide lockup. Falls back to the wordmark.">
                <ImagePicker
                  value={text("logo")}
                  onChange={(url) => set("logo", url)}
                  onPick={picker.pick}
                  label="Logo"
                />
              </Field>
              <Field label="Favicon">
                <ImagePicker
                  value={text("favicon")}
                  onChange={(url) => set("favicon", url)}
                  onPick={picker.pick}
                  label="Favicon"
                />
              </Field>
            </>
          )}

          {tab === "contact" && (
            <>
              <Field label="Email">
                <input
                  type="email"
                  value={text("email")}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Phone">
                <input
                  value={text("phone")}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="WhatsApp link">
                <input
                  value={text("whatsapp")}
                  onChange={(e) => set("whatsapp", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field
                label="Calendly link"
                hint="Every “Book a call” button opens this."
              >
                <input
                  value={text("calendly")}
                  onChange={(e) => set("calendly", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Address">
                <textarea
                  value={text("address")}
                  onChange={(e) => set("address", e.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </Field>

              <div>
                <p className="text-xs font-medium text-ink-3">Social links</p>
                <div className="mt-2 space-y-2">
                  {socials.map((social, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={social.label}
                        onChange={(e) => {
                          const next = [...socials];
                          next[index] = { ...social, label: e.target.value };
                          set("socials", next);
                        }}
                        placeholder="LinkedIn"
                        aria-label="Social label"
                        className={`${inputClass} w-36`}
                      />
                      <input
                        value={social.href}
                        onChange={(e) => {
                          const next = [...socials];
                          next[index] = { ...social, href: e.target.value };
                          set("socials", next);
                        }}
                        placeholder="https://…"
                        aria-label="Social URL"
                        className={`${inputClass} flex-1`}
                      />
                      <button
                        type="button"
                        aria-label="Remove"
                        onClick={() =>
                          set(
                            "socials",
                            socials.filter((_, i) => i !== index),
                          )
                        }
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line text-red-300 transition-colors hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => set("socials", [...socials, { label: "", href: "" }])}
                  className="mt-2 px-3 py-1.5 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add social link
                </Button>
              </div>
            </>
          )}

          {tab === "seo" && (
            <>
              <Field
                label="Default meta title"
                hint="Used when a page has no title of its own."
              >
                <input
                  value={text("defaultTitle")}
                  onChange={(e) => set("defaultTitle", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Default meta description">
                <textarea
                  value={text("defaultDescription")}
                  onChange={(e) => set("defaultDescription", e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </Field>
              <Field label="Default share image" hint="Shown when a link is posted.">
                <ImagePicker
                  value={text("ogImage")}
                  onChange={(url) => set("ogImage", url)}
                  onPick={picker.pick}
                  label="Share image"
                />
              </Field>
            </>
          )}

          {tab === "footer" && (
            <>
              <Field label="Footer description">
                <textarea
                  value={text("description")}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </Field>
              <Field
                label="Copyright"
                hint="Use {year} and it becomes the current year."
              >
                <input
                  value={text("copyright")}
                  onChange={(e) => set("copyright", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </>
          )}
        </Card>
      )}

      <MediaPickerDialog open={picker.open} onClose={picker.close} />
    </div>
  );
}
