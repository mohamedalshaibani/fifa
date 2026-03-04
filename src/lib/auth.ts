

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getCurrentUser() {
  try {
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
    const firstName = profile?.first_name || user.email?.split("@")[0] || "لاعب";
    const displayName = profile 
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
      : user.email?.split("@")[0] || "لاعب";
    
    return {
      id: user.id,
      email: user.email,
      firstName,
      displayName,
      avatarUrl: profile?.avatar_url || null,
    };
  } catch (error) {
    console.error("[getCurrentUser] Error:", error);
    return null;
  }
}

export async function requireAdmin() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { isAdmin: false, userId: null, error: "لم يتم تسجيل الدخول" };
    }

    // Use service role client for admin lookup
    const adminClient = createAdminClient();
    const { data: adminRow, error } = await adminClient
      .from("admins")
      .select("user_id, email, name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[requireAdmin] Supabase error:", error);
      return {
        isAdmin: false,
        userId: user.id,
        error: `خطأ في قاعدة البيانات: ${error.message}`
      };
    }

    if (!adminRow) {
      return {
        isAdmin: false,
        userId: user.id,
        error: "المستخدم ليس مشرفًا. تحقق من جدول المشرفين أو أضف معرفك (UID) يدويًا."
      };
    }

    return { isAdmin: true, userId: user.id, admin: adminRow };
  } catch (error) {
    console.error("[requireAdmin] Exception:", error);
    return {
      isAdmin: false,
      userId: null,
      error: error instanceof Error ? error.message : "حدث خطأ غير متوقع"
    };
  }
}
