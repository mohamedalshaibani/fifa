"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function uploadAvatar(formData: FormData) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { error: "غير مصرح" };
  }

  const file = formData.get("file") as File | null;
  const name = formData.get("name") as string | null;
  const displayName = formData.get("displayName") as string | null;
  const category = formData.get("category") as string | null;

  if (!file || !name || !displayName || !category) {
    return { error: "جميع الحقول مطلوبة" };
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "نوع الملف غير مدعوم. يجب أن يكون JPG أو PNG أو WebP" };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { error: "حجم الملف كبير جداً. الحد الأقصى 2 ميجابايت" };
  }

  // Validate category
  if (!["player", "legend"].includes(category)) {
    return { error: "الفئة غير صالحة" };
  }

  try {
    const supabase = createAdminClient();
    
    // Generate unique filename
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const uniqueName = `${category}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // Convert File to ArrayBuffer then to Uint8Array for upload
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(uniqueName, uint8Array, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[uploadAvatar] Storage error:", uploadError);
      return { error: `فشل رفع الصورة: ${uploadError.message}` };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(uniqueName);

    // Insert into avatars table
    const { error: dbError } = await supabase
      .from("avatars")
      .insert({
        name,
        display_name: displayName,
        category,
        image_url: urlData.publicUrl,
      });

    if (dbError) {
      console.error("[uploadAvatar] DB error:", dbError);
      // Try to clean up the uploaded file
      await supabase.storage.from("avatars").remove([uniqueName]);
      return { error: `فشل حفظ البيانات: ${dbError.message}` };
    }

    revalidatePath("/admin/avatars");
    return { success: true };
  } catch (err) {
    console.error("[uploadAvatar] Exception:", err);
    return { error: "حدث خطأ غير متوقع" };
  }
}

export async function updateAvatar(formData: FormData) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { error: "غير مصرح" };
  }

  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string | null;
  const displayName = formData.get("displayName") as string | null;
  const category = formData.get("category") as string | null;
  const file = formData.get("file") as File | null;

  if (!id || !name || !displayName || !category) {
    return { error: "جميع الحقول مطلوبة" };
  }

  if (!["player", "legend"].includes(category)) {
    return { error: "الفئة غير صالحة" };
  }

  try {
    const supabase = createAdminClient();

    // Get current avatar to check for image replacement
    const { data: currentAvatar, error: fetchError } = await supabase
      .from("avatars")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError || !currentAvatar) {
      return { error: "الصورة الرمزية غير موجودة" };
    }

    let newImageUrl = currentAvatar.image_url;

    // If a new file is provided, upload it and delete the old one
    if (file && file.size > 0) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return { error: "نوع الملف غير مدعوم. يجب أن يكون JPG أو PNG أو WebP" };
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return { error: "حجم الملف كبير جداً. الحد الأقصى 2 ميجابايت" };
      }

      // Generate unique filename
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const uniqueName = `${category}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      // Convert File to ArrayBuffer then to Uint8Array
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(uniqueName, uint8Array, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("[updateAvatar] Storage error:", uploadError);
        return { error: `فشل رفع الصورة: ${uploadError.message}` };
      }

      // Get new public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(uniqueName);

      newImageUrl = urlData.publicUrl;

      // Delete old image from storage
      const oldPath = extractStoragePath(currentAvatar.image_url);
      if (oldPath) {
        await supabase.storage.from("avatars").remove([oldPath]);
      }
    }

    // Update avatar record
    const { error: dbError } = await supabase
      .from("avatars")
      .update({
        name,
        display_name: displayName,
        category,
        image_url: newImageUrl,
      })
      .eq("id", id);

    if (dbError) {
      console.error("[updateAvatar] DB error:", dbError);
      return { error: `فشل تحديث البيانات: ${dbError.message}` };
    }

    revalidatePath("/admin/avatars");
    return { success: true };
  } catch (err) {
    console.error("[updateAvatar] Exception:", err);
    return { error: "حدث خطأ غير متوقع" };
  }
}

export async function deleteAvatar(id: string) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { error: "غير مصرح" };
  }

  if (!id) {
    return { error: "معرف الصورة مطلوب" };
  }

  try {
    const supabase = createAdminClient();

    // Get avatar to find the image URL
    const { data: avatar, error: fetchError } = await supabase
      .from("avatars")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError || !avatar) {
      return { error: "الصورة الرمزية غير موجودة" };
    }

    // Delete from avatars table
    const { error: dbError } = await supabase
      .from("avatars")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("[deleteAvatar] DB error:", dbError);
      return { error: `فشل حذف السجل: ${dbError.message}` };
    }

    // Delete from storage
    const storagePath = extractStoragePath(avatar.image_url);
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from("avatars")
        .remove([storagePath]);

      if (storageError) {
        console.error("[deleteAvatar] Storage delete error:", storageError);
        // Don't fail the whole operation, the DB record is already deleted
      }
    }

    revalidatePath("/admin/avatars");
    return { success: true };
  } catch (err) {
    console.error("[deleteAvatar] Exception:", err);
    return { error: "حدث خطأ غير متوقع" };
  }
}

// Helper function to extract storage path from public URL
function extractStoragePath(publicUrl: string): string | null {
  try {
    // URL format: https://xxx.supabase.co/storage/v1/object/public/avatars/path/to/file.jpg
    const match = publicUrl.match(/\/storage\/v1\/object\/public\/avatars\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
