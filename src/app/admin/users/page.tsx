import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import Container from "@/components/Container";
import AdminLayout from "@/components/AdminLayout";
import BackLink from "@/components/BackLink";
import SportCard from "@/components/ui/SportCard";
import SportBadge from "@/components/ui/SportBadge";
import { Users, Shield, ShieldOff, UserX, UserCheck, Trash2, Search as SearchIcon } from "lucide-react";
import { getAllUsers, UserWithDetails } from "./actions";
import UsersTable from "./UsersTable";

export const dynamic = "force-dynamic";

export default async function UsersManagementPage() {
  const { isAdmin, userId } = await requireAdmin();
  if (!isAdmin) {
    redirect(userId ? "/account" : "/auth/login");
  }

  const users = await getAllUsers();
  
  // Stats
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.is_admin).length;
  const suspendedUsers = users.filter(u => u.is_suspended).length;
  const activeUsers = totalUsers - suspendedUsers;

  return (
    <AdminLayout>
      <Container>
        <div className="py-8 md:py-12 space-y-8">
          {/* Back Link */}
          <BackLink href="/admin" text="العودة للوحة التحكم" />

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black text-primary flex items-center gap-3">
                <Users className="w-8 h-8" />
                إدارة المستخدمين
              </h1>
              <p className="text-muted">إدارة الحسابات والصلاحيات</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SportCard padding="base" variant="default">
              <div className="text-center">
                <div className="text-3xl font-black text-primary">{totalUsers}</div>
                <div className="text-sm text-muted font-semibold">إجمالي المستخدمين</div>
              </div>
            </SportCard>
            <SportCard padding="base" variant="success">
              <div className="text-center">
                <div className="text-3xl font-black text-success">{activeUsers}</div>
                <div className="text-sm text-muted font-semibold">مستخدم نشط</div>
              </div>
            </SportCard>
            <SportCard padding="base" variant="highlighted">
              <div className="text-center">
                <div className="text-3xl font-black text-secondary">{totalAdmins}</div>
                <div className="text-sm text-muted font-semibold">مشرف</div>
              </div>
            </SportCard>
            <SportCard padding="base" variant="danger">
              <div className="text-center">
                <div className="text-3xl font-black text-danger">{suspendedUsers}</div>
                <div className="text-sm text-muted font-semibold">معلق</div>
              </div>
            </SportCard>
          </div>

          {/* Users Table */}
          <UsersTable users={users} currentUserId={userId!} />
        </div>
      </Container>
    </AdminLayout>
  );
}
