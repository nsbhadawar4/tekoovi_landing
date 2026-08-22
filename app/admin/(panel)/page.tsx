import { getSession } from "@/backend/lib/auth";
import { DashboardOverview } from "@/components/admin/dashboard-overview";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  // The panel layout has already guaranteed a session; this only needs the name.
  const session = await getSession();
  return <DashboardOverview userName={session?.name ?? "there"} />;
}
