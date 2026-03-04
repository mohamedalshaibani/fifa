"use client";

import Container from "@/components/Container";
import AdminLayout from "@/components/AdminLayout";
import BackLink from "@/components/BackLink";
import SportCard from "@/components/ui/SportCard";
import { Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import UsersTable from "@/app/admin/users/UsersTable";
import type { UserWithDetails } from "@/app/admin/users/actions";

interface AdminUsersContentProps {
  users: UserWithDetails[];
  currentUserId: string;
}

export default function AdminUsersContent({ users, currentUserId }: AdminUsersContentProps) {
  const { t } = useLanguage();
  
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
          <BackLink href="/admin" text={t("admin.backToPanel")} />

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black text-primary flex items-center gap-3">
                <Users className="w-8 h-8" />
                {t("admin.users.title")}
              </h1>
              <p className="text-muted">{t("admin.users.subtitle")}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SportCard padding="base" variant="default">
              <div className="text-center">
                <div className="text-3xl font-black text-primary">{totalUsers}</div>
                <div className="text-sm text-muted font-semibold">{t("admin.users.totalUsers")}</div>
              </div>
            </SportCard>
            <SportCard padding="base" variant="success">
              <div className="text-center">
                <div className="text-3xl font-black text-success">{activeUsers}</div>
                <div className="text-sm text-muted font-semibold">{t("admin.users.activeUsers")}</div>
              </div>
            </SportCard>
            <SportCard padding="base" variant="highlighted">
              <div className="text-center">
                <div className="text-3xl font-black text-secondary">{totalAdmins}</div>
                <div className="text-sm text-muted font-semibold">{t("admin.users.admins")}</div>
              </div>
            </SportCard>
            <SportCard padding="base" variant="danger">
              <div className="text-center">
                <div className="text-3xl font-black text-danger">{suspendedUsers}</div>
                <div className="text-sm text-muted font-semibold">{t("admin.users.suspended")}</div>
              </div>
            </SportCard>
          </div>

          {/* Users Table */}
          <UsersTable users={users} currentUserId={currentUserId} />
        </div>
      </Container>
    </AdminLayout>
  );
}
