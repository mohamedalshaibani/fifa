import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAllUsers } from "./actions";
import AdminUsersContent from "@/components/AdminUsersContent";

export const dynamic = "force-dynamic";

export default async function UsersManagementPage() {
  const { isAdmin, userId } = await requireAdmin();
  if (!isAdmin) {
    redirect(userId ? "/account" : "/auth/login");
  }

  const users = await getAllUsers();

  return <AdminUsersContent users={users} currentUserId={userId!} />;
}
