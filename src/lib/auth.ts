

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  // Get user profile
  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("user_profiles")
    .select("id, first_name, last_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  
  // Construct display name from first_name + last_name
  const displayName = profile 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
    : user.email?.split("@")[0] || "لاعب";
  
  return {
    id: user.id,
    email: user.email,
    displayName,
    avatarUrl: profile?.avatar_url || null,
  };
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
  	// ...existing code...
    return { isAdmin: false, userId: null, error: "لم يتم تسجيل الدخول" };
  }

  // Use service role client for admin lookup
  const adminClient = createAdminClient();
  const { data: adminRow } = await adminClient
    .from("admins")
    .select("user_id, email, name")
    .eq("user_id", user.id)
    .maybeSingle();

	// ...existing code...

  if (!adminRow) {
    return {
      isAdmin: false,
      userId: user.id,
      error: "المستخدم ليس مشرفًا. تحقق من جدول المشرفين أو أضف معرفك (UID) يدويًا."
    };
  }

  return { isAdmin: true, userId: user.id, admin: adminRow };
}
