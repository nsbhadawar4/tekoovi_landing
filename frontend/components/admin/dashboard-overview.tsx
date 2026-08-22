"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Newspaper,
  PenLine,
  Plus,
  Tags,
  Upload,
  Users,
} from "lucide-react";
import { api, SessionExpired } from "./api";
import {
  Card,
  ErrorState,
  PageHeader,
  Skeleton,
  StatusBadge,
} from "./ui";

interface DashboardData {
  counts: {
    posts: number;
    publishedPosts: number;
    draftPosts: number;
    scheduledPosts: number;
    pages: number;
    publishedPages: number;
    media: number;
    categories: number;
    tags: number;
    users: number;
  };
  recentActivity: {
    _id: string;
    action: string;
    entity: string;
    title: string;
    userName: string;
    createdAt: string;
  }[];
  recentContent: {
    _id: string;
    title: string;
    slug: string;
    status: string;
    updatedAt: string;
  }[];
}

/** "3 hours ago" — enough precision for an activity feed. */
function ago(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.35, "week"],
    [12, "month"],
  ];

  let value = seconds;
  let unit = "second";

  for (const [size, name] of units) {
    if (Math.abs(value) < size) break;
    value = Math.round(value / size);
    unit = name === "second" ? "minute" : name;
  }

  if (Math.abs(seconds) < 60) return "just now";
  return `${value} ${unit}${Math.abs(value) === 1 ? "" : "s"} ago`;
}

export function DashboardOverview({ userName }: { userName: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.get<DashboardData>("/dashboard");
      if (!result.ok || !result.data) {
        setError(result.message || "Could not load the dashboard.");
      } else {
        setData(result.data);
      }
    } catch (err) {
      if (err instanceof SessionExpired) {
        window.location.assign("/admin/login");
        return;
      }
      setError("Could not load the dashboard.");
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

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title={`Welcome back, ${userName.split(" ")[0]}`} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-hairline h-28 animate-pulse rounded-2xl" />
          ))}
        </div>
        <Skeleton rows={4} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <ErrorState message={error || "No data."} onRetry={load} />
      </div>
    );
  }

  const { counts } = data;

  const stats = [
    {
      label: "Posts",
      value: counts.posts,
      detail: `${counts.publishedPosts} published · ${counts.draftPosts} draft`,
      href: "/admin/posts",
      icon: Newspaper,
    },
    {
      label: "Pages",
      value: counts.pages,
      detail: `${counts.publishedPages} published`,
      href: "/admin/pages",
      icon: FileText,
    },
    {
      label: "Media",
      value: counts.media,
      detail: "files in the library",
      href: "/admin/media",
      icon: ImageIcon,
    },
    {
      label: "Taxonomy",
      value: counts.categories + counts.tags,
      detail: `${counts.categories} categories · ${counts.tags} tags`,
      href: "/admin/taxonomy",
      icon: Tags,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${userName.split(" ")[0]}`}
        description="Everything on the site, at a glance."
      />

      {/* ---------------------- stat cards ---------------------- */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card-hairline group rounded-2xl p-5 transition-colors hover:border-white/15"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-3">
                {stat.label}
              </p>
              <stat.icon className="h-4 w-4 text-ink-3 transition-colors group-hover:text-brand-3" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-ink">
              {stat.value}
            </p>
            <p className="mt-1 text-[11px] text-ink-3">{stat.detail}</p>
          </Link>
        ))}
      </div>

      {/* --------------------- quick actions -------------------- */}
      <div className="flex flex-wrap gap-2">
        <QuickAction href="/admin/posts/new" icon={Plus} label="New post" />
        <QuickAction href="/admin/pages/new" icon={Plus} label="New page" />
        <QuickAction href="/admin/media" icon={Upload} label="Upload media" />
        <QuickAction href="/admin/content" icon={PenLine} label="Edit landing page" />
        {counts.users > 0 && (
          <QuickAction href="/admin/users" icon={Users} label="Manage users" />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ------------------ recently updated ------------------ */}
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Recently updated</h2>
            <Link href="/admin/posts" className="text-xs text-brand-3 hover:underline">
              All posts
            </Link>
          </div>

          {data.recentContent.length === 0 ? (
            <p className="mt-6 text-sm text-ink-3">Nothing yet.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-line">
              {data.recentContent.map((item) => (
                <li key={item._id} className="flex items-center gap-3 py-3">
                  <Link
                    href={`/admin/posts/${item._id}`}
                    className="min-w-0 flex-1 truncate text-sm text-ink hover:text-brand-3"
                  >
                    {item.title}
                  </Link>
                  <StatusBadge status={item.status} />
                  <span className="hidden shrink-0 text-[11px] text-ink-3 sm:inline">
                    {ago(item.updatedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* -------------------- recent activity ------------------ */}
        <Card>
          <h2 className="text-sm font-semibold text-ink">Recent activity</h2>

          {data.recentActivity.length === 0 ? (
            <p className="mt-6 text-sm text-ink-3">No activity recorded yet.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-line">
              {data.recentActivity.map((entry) => (
                <li key={entry._id} className="flex items-baseline gap-2 py-3 text-sm">
                  <span className="min-w-0 flex-1 text-ink-2">
                    <span className="text-ink">{entry.title || entry.entity}</span>{" "}
                    {entry.action} by {entry.userName || "someone"}
                  </span>
                  <span className="shrink-0 text-[11px] text-ink-3">
                    {ago(entry.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Plus;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/[0.02] px-3.5 py-2 text-sm text-ink-2 transition-colors hover:border-brand-2/40 hover:bg-brand/10 hover:text-ink"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
