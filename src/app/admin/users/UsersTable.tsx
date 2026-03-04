"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import SportCard from "@/components/ui/SportCard";
import SportButton from "@/components/ui/SportButton";
import SportBadge from "@/components/ui/SportBadge";
import { Search, Shield, ShieldOff, UserX, UserCheck, Trash2, ChevronDown, X, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { 
  UserWithDetails, 
  promoteToAdmin, 
  demoteFromAdmin, 
  suspendUser, 
  reactivateUser, 
  deleteUser 
} from "./actions";

type FilterRole = "all" | "admin" | "user";
type FilterStatus = "all" | "active" | "suspended";

interface UsersTableProps {
  users: UserWithDetails[];
  currentUserId: string;
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<FilterRole>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    action: "delete" | "suspend" | "demote" | null;
    userId: string;
    userName: string;
  } | null>(null);

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        user.email.toLowerCase().includes(searchLower) ||
        (user.first_name?.toLowerCase() || "").includes(searchLower) ||
        (user.last_name?.toLowerCase() || "").includes(searchLower);
      
      // Role filter
      const matchesRole = 
        roleFilter === "all" ||
        (roleFilter === "admin" && user.is_admin) ||
        (roleFilter === "user" && !user.is_admin);
      
      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !user.is_suspended) ||
        (statusFilter === "suspended" && user.is_suspended);
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAction = async (action: () => Promise<{ success: boolean; error?: string }>) => {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        showMessage("success", t("admin.users.operationSuccess"));
      } else {
        showMessage("error", result.error || t("admin.users.operationError"));
      }
      setConfirmModal(null);
    });
  };

  const getUserDisplayName = (user: UserWithDetails) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    }
    return user.email.split("@")[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold ${
          message.type === "success" ? "bg-success text-white" : "bg-danger text-white"
        }`}>
          {message.text}
        </div>
      )}

      {/* Unified Filter Bar */}
      <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch gap-3">
          {/* Search Input - Takes most space */}
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder={t("admin.users.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pr-12 pl-10 rounded-xl bg-surface border border-border text-foreground placeholder-muted text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns Container */}
          <div className="flex items-center gap-3">
            {/* Role Filter */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as FilterRole)}
                className={`appearance-none h-12 px-4 pr-4 pl-10 rounded-xl border text-sm font-semibold cursor-pointer transition-all min-w-[150px] focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  roleFilter !== "all" 
                    ? "bg-primary/10 border-primary/30 text-primary" 
                    : "bg-surface border-border text-foreground hover:border-primary/40"
                }`}
              >
                <option value="all">{t("admin.users.allRoles")}</option>
                <option value="admin">{t("admin.users.adminsOnly")}</option>
                <option value="user">{t("admin.users.usersOnly")}</option>
              </select>
              <ChevronDown className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${
                roleFilter !== "all" ? "text-primary" : "text-muted"
              }`} />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className={`appearance-none h-12 px-4 pr-4 pl-10 rounded-xl border text-sm font-semibold cursor-pointer transition-all min-w-[150px] focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  statusFilter !== "all" 
                    ? "bg-primary/10 border-primary/30 text-primary" 
                    : "bg-surface border-border text-foreground hover:border-primary/40"
                }`}
              >
                <option value="all">{t("admin.users.allStatuses")}</option>
                <option value="active">{t("admin.users.activeOnly")}</option>
                <option value="suspended">{t("admin.users.suspendedOnly")}</option>
              </select>
              <ChevronDown className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${
                statusFilter !== "all" ? "text-primary" : "text-muted"
              }`} />
            </div>

            {/* Reset Filters Button - Only show when filters are active */}
            {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
                className="h-12 px-4 rounded-xl bg-danger/10 text-danger text-sm font-semibold hover:bg-danger/20 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <X className="w-4 h-4" />
                {t("admin.users.clearFilters")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count - Integrated better */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted font-medium">
          {t("admin.users.showing")} <span className="text-foreground font-bold">{filteredUsers.length}</span> {t("admin.users.of")} <span className="text-foreground font-bold">{users.length}</span> {t("admin.users.user")}
        </div>
        {filteredUsers.length !== users.length && (
          <div className="text-xs text-primary font-semibold">
            {t("admin.users.filteredResults")}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-muted">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>{t("admin.users.noUsersMatch")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  <th className="px-4 py-4 text-right font-bold text-foreground">{t("admin.users.tableUser")}</th>
                  <th className="px-4 py-4 text-right font-bold text-foreground">{t("admin.users.tableEmail")}</th>
                  <th className="px-4 py-4 text-center font-bold text-foreground">{t("admin.users.tableRole")}</th>
                  <th className="px-4 py-4 text-center font-bold text-foreground">{t("admin.users.tableStatus")}</th>
                  <th className="px-4 py-4 text-center font-bold text-foreground">{t("admin.users.tableJoined")}</th>
                  <th className="px-4 py-4 text-center font-bold text-foreground">{t("admin.users.tableActions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isCurrentUser = user.id === currentUserId;
                  const displayName = getUserDisplayName(user);

                  return (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                      {/* User Avatar & Name */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {user.avatar_url ? (
                              <Image
                                src={user.avatar_url}
                                alt={displayName}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <span className="text-lg font-bold text-primary">
                                {displayName[0]?.toUpperCase() || "?"}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {displayName}
                              {isCurrentUser && (
                                <span className="mr-2 text-xs text-muted">{t("admin.users.you")}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-4 text-muted">
                        <span className="font-mono text-xs">{user.email}</span>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-4 text-center">
                        {user.is_admin ? (
                          <SportBadge variant="primary">
                            <Shield className="w-3 h-3 ml-1" />
                            {t("admin.users.roleAdmin")}
                          </SportBadge>
                        ) : (
                          <SportBadge variant="info">{t("admin.users.roleUser")}</SportBadge>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-4 text-center">
                        {user.is_suspended ? (
                          <SportBadge variant="danger">{t("admin.users.statusSuspended")}</SportBadge>
                        ) : (
                          <SportBadge variant="success">{t("admin.users.statusActive")}</SportBadge>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="px-4 py-4 text-center text-muted text-xs">
                        {formatDate(user.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Role Toggle */}
                          {user.is_admin ? (
                            <button
                              onClick={() => setConfirmModal({ action: "demote", userId: user.id, userName: displayName })}
                              disabled={isPending || isCurrentUser}
                              className="p-2 rounded-lg text-warning hover:bg-warning/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={t("admin.users.demoteFromAdmin")}
                            >
                              <ShieldOff className="w-4 h-4" />
                            </button>
                          ) : (
                            <form action={(formData) => handleAction(() => promoteToAdmin(formData))}>
                              <input type="hidden" name="userId" value={user.id} />
                              <button
                                type="submit"
                                disabled={isPending}
                                className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                                title={t("admin.users.promoteToAdmin")}
                              >
                                <Shield className="w-4 h-4" />
                              </button>
                            </form>
                          )}

                          {/* Suspend/Reactivate Toggle */}
                          {user.is_suspended ? (
                            <form action={(formData) => handleAction(() => reactivateUser(formData))}>
                              <input type="hidden" name="userId" value={user.id} />
                              <button
                                type="submit"
                                disabled={isPending}
                                className="p-2 rounded-lg text-success hover:bg-success/10 transition-colors disabled:opacity-50"
                                title={t("admin.users.reactivate")}
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            </form>
                          ) : (
                            <button
                              onClick={() => setConfirmModal({ action: "suspend", userId: user.id, userName: displayName })}
                              disabled={isPending || isCurrentUser || user.is_admin}
                              className="p-2 rounded-lg text-warning hover:bg-warning/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={user.is_admin ? t("admin.users.cannotSuspendAdmin") : t("admin.users.suspend")}
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => setConfirmModal({ action: "delete", userId: user.id, userName: displayName })}
                            disabled={isPending || isCurrentUser || user.is_admin}
                            className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={user.is_admin ? t("admin.users.cannotDeleteAdmin") : t("admin.users.deleteAccount")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <SportCard padding="lg" className="max-w-md w-full animate-scale-in">
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                confirmModal.action === "delete" ? "bg-danger/10" :
                confirmModal.action === "suspend" ? "bg-warning/10" :
                "bg-warning/10"
              }`}>
                <AlertTriangle className={`w-8 h-8 ${
                  confirmModal.action === "delete" ? "text-danger" :
                  "text-warning"
                }`} />
              </div>

              <h3 className="text-xl font-bold text-foreground">
                {confirmModal.action === "delete" && t("admin.users.confirmDeleteTitle")}
                {confirmModal.action === "suspend" && t("admin.users.confirmSuspendTitle")}
                {confirmModal.action === "demote" && t("admin.users.confirmDemoteTitle")}
              </h3>

              <p className="text-muted">
                {confirmModal.action === "delete" && (
                  <>{t("admin.users.confirmDeleteDesc")} <strong className="text-foreground">{confirmModal.userName}</strong>{language === "ar" ? "؟" : "?"} {t("admin.users.confirmDeleteWarning")}</>
                )}
                {confirmModal.action === "suspend" && (
                  <>{t("admin.users.confirmSuspendDesc")} <strong className="text-foreground">{confirmModal.userName}</strong>{language === "ar" ? "؟" : "?"} {t("admin.users.confirmSuspendWarning")}</>
                )}
                {confirmModal.action === "demote" && (
                  <>{t("admin.users.confirmDemoteDesc")} <strong className="text-foreground">{confirmModal.userName}</strong>{language === "ar" ? "؟" : "?"}</>
                )}
              </p>

              <div className="flex gap-3 justify-center pt-4">
                <SportButton
                  variant="ghost"
                  onClick={() => setConfirmModal(null)}
                  disabled={isPending}
                >
                  {t("common.cancel")}
                </SportButton>
                <form action={(formData) => {
                  if (confirmModal.action === "delete") {
                    handleAction(() => deleteUser(formData));
                  } else if (confirmModal.action === "suspend") {
                    handleAction(() => suspendUser(formData));
                  } else if (confirmModal.action === "demote") {
                    handleAction(() => demoteFromAdmin(formData));
                  }
                }}>
                  <input type="hidden" name="userId" value={confirmModal.userId} />
                  <SportButton
                    type="submit"
                    variant="danger"
                    disabled={isPending}
                    isLoading={isPending}
                  >
                    {confirmModal.action === "delete" && t("common.delete")}
                    {confirmModal.action === "suspend" && t("admin.users.suspend")}
                    {confirmModal.action === "demote" && t("admin.users.demoteFromAdmin")}
                  </SportButton>
                </form>
              </div>
            </div>
          </SportCard>
        </div>
      )}
    </div>
  );
}

export default UsersTable;
