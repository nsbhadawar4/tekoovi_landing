import { redirect } from "next/navigation";
import { getSession } from "@/backend/lib/auth";
import { SettingsManager } from "@/components/admin/settings-manager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  // Site-wide configuration is an admin job — editors get sent back.
  const session = await getSession();
  if (session?.role !== "admin") redirect("/admin");

  return <SettingsManager />;
}
