import { redirect } from "next/navigation";
import { getSession } from "@/backend/lib/auth";
import { UserManager } from "@/components/admin/user-manager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getSession();
  if (session?.role !== "admin") redirect("/admin");

  return <UserManager currentUserId={session.userId} />;
}
