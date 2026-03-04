"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

// Types for user management
export type UserWithDetails = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  is_admin: boolean;
  is_suspended: boolean;
};

async function assertAdmin() {
  const { isAdmin, userId } = await requireAdmin();
  if (!isAdmin) {
    throw new Error("غير مصرح");
  }
  return userId;
}

/**
 * Get all users with their profiles and admin status
 */
export async function getAllUsers(): Promise<UserWithDetails[]> {
  await assertAdmin();
  const supabase = createAdminClient();

  // Get all users from auth.users via supabase admin
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error("[getAllUsers] Auth error:", authError);
    return [];
  }

  // Get all user profiles
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, first_name, last_name, avatar_url");
  
  const profileMap = new Map<string, { first_name: string | null; last_name: string | null; avatar_url: string | null }>();
  (profiles || []).forEach(p => profileMap.set(p.id, p));

  // Get all admins
  const { data: admins } = await supabase
    .from("admins")
    .select("user_id");
  
  const adminSet = new Set((admins || []).map(a => a.user_id));

  // Combine data
  const users: UserWithDetails[] = authUsers.users.map(user => {
    const profile = profileMap.get(user.id);
    return {
      id: user.id,
      email: user.email || "",
      first_name: profile?.first_name || null,
      last_name: profile?.last_name || null,
      avatar_url: profile?.avatar_url || null,
      created_at: user.created_at,
      is_admin: adminSet.has(user.id),
      is_suspended: user.banned_until !== null && user.banned_until !== undefined,
    };
  });

  // Sort: admins first, then by creation date
  users.sort((a, b) => {
    if (a.is_admin !== b.is_admin) return a.is_admin ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return users;
}

/**
 * Get count of admins (to prevent removing last admin)
 */
async function getAdminCount(): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("admins")
    .select("*", { count: "exact", head: true });
  
  if (error) {
    console.error("[getAdminCount] Error:", error);
    return 0;
  }
  return count || 0;
}

/**
 * Promote a user to admin
 */
export async function promoteToAdmin(formData: FormData): Promise<{ success: boolean; error?: string }> {
  await assertAdmin();
  const targetUserId = String(formData.get("userId") ?? "").trim();
  
  if (!targetUserId) {
    return { success: false, error: "معرف المستخدم مطلوب" };
  }

  const supabase = createAdminClient();

  // Get user email for admin record
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(targetUserId);
  
  if (userError || !userData.user) {
    return { success: false, error: "المستخدم غير موجود" };
  }

  // Check if already admin
  const { data: existingAdmin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", targetUserId)
    .maybeSingle();
  
  if (existingAdmin) {
    return { success: false, error: "المستخدم مشرف بالفعل" };
  }

  // Get profile for name
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("first_name, last_name")
    .eq("id", targetUserId)
    .maybeSingle();
  
  const name = profile 
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() 
    : null;

  // Add to admins
  const { error: insertError } = await supabase
    .from("admins")
    .insert({
      user_id: targetUserId,
      email: userData.user.email,
      name: name || userData.user.email,
    });
  
  if (insertError) {
    console.error("[promoteToAdmin] Error:", insertError);
    return { success: false, error: "فشل في ترقية المستخدم" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Demote an admin to regular user
 */
export async function demoteFromAdmin(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const currentUserId = await assertAdmin();
  const targetUserId = String(formData.get("userId") ?? "").trim();
  
  if (!targetUserId) {
    return { success: false, error: "معرف المستخدم مطلوب" };
  }

  // Prevent self-demotion
  if (currentUserId === targetUserId) {
    return { success: false, error: "لا يمكنك إزالة صلاحياتك الخاصة" };
  }

  // Check if this would remove the last admin
  const adminCount = await getAdminCount();
  if (adminCount <= 1) {
    return { success: false, error: "لا يمكن إزالة آخر مشرف في النظام" };
  }

  const supabase = createAdminClient();

  // Remove from admins
  const { error: deleteError } = await supabase
    .from("admins")
    .delete()
    .eq("user_id", targetUserId);
  
  if (deleteError) {
    console.error("[demoteFromAdmin] Error:", deleteError);
    return { success: false, error: "فشل في إزالة صلاحيات المشرف" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Suspend a user account
 */
export async function suspendUser(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const currentUserId = await assertAdmin();
  const targetUserId = String(formData.get("userId") ?? "").trim();
  
  if (!targetUserId) {
    return { success: false, error: "معرف المستخدم مطلوب" };
  }

  // Prevent self-suspension
  if (currentUserId === targetUserId) {
    return { success: false, error: "لا يمكنك تعليق حسابك الخاص" };
  }

  const supabase = createAdminClient();

  // Check if target is admin
  const { data: isTargetAdmin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", targetUserId)
    .maybeSingle();
  
  if (isTargetAdmin) {
    return { success: false, error: "لا يمكن تعليق حساب مشرف. قم بإزالة صلاحياته أولاً" };
  }

  // Ban user indefinitely (use a far future date)
  const { error: banError } = await supabase.auth.admin.updateUserById(targetUserId, {
    ban_duration: "876000h", // ~100 years
  });
  
  if (banError) {
    console.error("[suspendUser] Error:", banError);
    return { success: false, error: "فشل في تعليق الحساب" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Reactivate a suspended user account
 */
export async function reactivateUser(formData: FormData): Promise<{ success: boolean; error?: string }> {
  await assertAdmin();
  const targetUserId = String(formData.get("userId") ?? "").trim();
  
  if (!targetUserId) {
    return { success: false, error: "معرف المستخدم مطلوب" };
  }

  const supabase = createAdminClient();

  // Unban user
  const { error: unbanError } = await supabase.auth.admin.updateUserById(targetUserId, {
    ban_duration: "none",
  });
  
  if (unbanError) {
    console.error("[reactivateUser] Error:", unbanError);
    return { success: false, error: "فشل في إعادة تفعيل الحساب" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Delete a user account (with safeguards)
 * Note: This performs a soft-delete by removing auth user
 * Foreign key relations are handled via ON DELETE CASCADE/SET NULL
 */
export async function deleteUser(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const currentUserId = await assertAdmin();
  const targetUserId = String(formData.get("userId") ?? "").trim();
  
  if (!targetUserId) {
    return { success: false, error: "معرف المستخدم مطلوب" };
  }

  // Prevent self-deletion
  if (currentUserId === targetUserId) {
    return { success: false, error: "لا يمكنك حذف حسابك الخاص" };
  }

  const supabase = createAdminClient();

  // Check if target is admin
  const { data: isTargetAdmin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", targetUserId)
    .maybeSingle();
  
  if (isTargetAdmin) {
    return { success: false, error: "لا يمكن حذف حساب مشرف. قم بإزالة صلاحياته أولاً" };
  }

  // Delete the user from auth.users
  // This will cascade to:
  // - user_profiles (ON DELETE CASCADE)
  // - user_stats (ON DELETE CASCADE)
  // - participants.user_id (ON DELETE CASCADE or SET NULL)
  // - team_members.user_id (ON DELETE CASCADE or SET NULL)
  // - teams.created_by (ON DELETE CASCADE)
  const { error: deleteError } = await supabase.auth.admin.deleteUser(targetUserId);
  
  if (deleteError) {
    console.error("[deleteUser] Error:", deleteError);
    return { success: false, error: "فشل في حذف الحساب" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}
