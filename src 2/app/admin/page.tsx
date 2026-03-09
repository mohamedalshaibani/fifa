import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import AdminDashboardContent from "@/components/AdminDashboardContent";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { isAdmin, userId } = await requireAdmin();
  if (!isAdmin) {
    redirect(userId ? "/account" : "/auth/login");
  }

  return <AdminDashboardContent />;
}
