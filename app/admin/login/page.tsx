"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { API_BASE, apiSend } from "@/lib/api";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiSend("/admin/login", "POST", { email, password });

      if (res.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "Login failed.");
    } catch {
      // The API is unreachable — CORS, a wrong NEXT_PUBLIC_API_URL, or the
      // backend simply not running. Say so instead of spinning forever.
      setError(`Can't reach the API at ${API_BASE}. Is the backend running?`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-8 sm:px-6">
      <form
        onSubmit={onSubmit}
        className="card-elevated w-full max-w-sm rounded-3xl p-6 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl btn-brand font-display text-lg font-bold text-white">
            T
          </span>
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">
              Tekoovi Admin
            </h1>
            <p className="text-xs text-ink-3">Content management</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-ink-2">
          Sign in to manage your landing page content.
        </p>

        <label className="mt-6 block text-xs font-medium text-ink-3">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            autoComplete="email"
            className="mt-2 w-full rounded-xl border border-line bg-bg/60 px-3.5 py-2.5 text-sm text-ink outline-none transition-shadow placeholder:text-ink-3/70 focus:focus-ring"
            placeholder="tekoovi@gmail.com"
          />
        </label>

        <label className="mt-4 block text-xs font-medium text-ink-3">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-2 w-full rounded-xl border border-line bg-bg/60 px-3.5 py-2.5 text-sm text-ink outline-none transition-shadow placeholder:text-ink-3/70 focus:focus-ring"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl btn-brand px-4 py-2.5 text-sm font-semibold text-white transition-[filter,opacity] hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
