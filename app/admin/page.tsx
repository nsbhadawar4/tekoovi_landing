import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiUrl } from "@/lib/api";
import AdminDashboard from "./dashboard";

export const dynamic = "force-dynamic";

/**
 * Is the browser that asked for this page signed in?
 *
 * The session cookie is set by the Laravel API, but it's a host cookie, so the
 * browser sends it here too. We hand it straight back to the API and let the
 * backend — which owns the credentials — be the one to decide.
 */
async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  const header = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  try {
    const res = await fetch(apiUrl("/admin/session"), {
      headers: { cookie: header },
      cache: "no-store",
    });

    return res.ok;
  } catch {
    // API unreachable — send them to the login screen rather than rendering an
    // admin panel that can't talk to its backend.
    return false;
  }
}

export default async function AdminPage() {
  if (!(await isAuthed())) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
