import { redirect } from "next/navigation";
import { getSession } from "@/backend/lib/auth";
import { AdminShell } from "@/components/admin/shell";

/**
 * Guard for every CMS screen.
 *
 * The check runs on the server before anything renders, so an unauthenticated
 * visitor never receives the panel — client-side redirects are a convenience,
 * not a boundary. /admin/login sits outside this group and stays public.
 */
export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell
      user={{ name: session.name, email: session.email, role: session.role }}
    >
      {children}
    </AdminShell>
  );
}
