"use client";

import { useState, useRef } from "react";
import { Pencil, Trash2, X, Loader2, Save, Upload } from "lucide-react";
import { updateAvatar, deleteAvatar } from "./actions";
import type { Avatar } from "@/lib/types";

interface AvatarCardActionsProps {
  avatar: Avatar;
}

export default function AvatarCardActions({ avatar }: AvatarCardActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError("نوع الملف غير مدعوم");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("حجم الملف كبير جداً");
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(formRef.current!);
      formData.set("id", avatar.id);
      const result = await updateAvatar(formData);

      if (result.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
        setPreview(null);
      }
    } catch {
      setError("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteAvatar(avatar.id);
      if (result.error) {
        setError(result.error);
        setIsDeleting(false);
      }
      // If successful, the component will be removed by revalidation
    } catch {
      setError("حدث خطأ غير متوقع");
      setIsDeleting(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit Modal
  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">تعديل الصورة الرمزية</h3>
            <button
              onClick={() => {
                setIsEditing(false);
                setPreview(null);
                setError(null);
              }}
              className="p-2 rounded-lg hover:bg-surface transition-colors"
            >
              <X className="w-5 h-5 text-muted" />
            </button>
          </div>

          <form ref={formRef} onSubmit={handleUpdate} className="space-y-4">
            {/* Current/New Image */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview || avatar.image_url}
                    alt={avatar.display_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                  <Upload className="w-4 h-4" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1">
                الاسم (معرّف)
              </label>
              <input
                type="text"
                name="name"
                defaultValue={avatar.name}
                required
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border focus:border-primary outline-none text-sm"
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1">
                الاسم المعروض
              </label>
              <input
                type="text"
                name="displayName"
                defaultValue={avatar.display_name}
                required
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border focus:border-primary outline-none text-sm"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">
                الفئة
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value="player"
                    defaultChecked={avatar.category === "player"}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">لاعب</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value="legend"
                    defaultChecked={avatar.category === "legend"}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">أسطورة</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setPreview(null);
                  setError(null);
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-muted hover:bg-surface transition-colors disabled:opacity-50 text-sm"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    حفظ
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Delete Confirmation Modal
  if (isDeleting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-foreground">حذف الصورة الرمزية؟</h3>
          <p className="text-sm text-muted">
            سيتم حذف &quot;{avatar.display_name}&quot; نهائياً. هذا الإجراء لا يمكن التراجع عنه.
          </p>

          {error && (
            <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                setIsDeleting(false);
                setError(null);
              }}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-muted hover:bg-surface transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  حذف
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Action Buttons (shown on hover)
  return (
    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => setIsEditing(true)}
        className="p-1.5 rounded-lg bg-white/90 hover:bg-white border border-border shadow-sm transition-colors"
        title="تعديل"
      >
        <Pencil className="w-3.5 h-3.5 text-primary" />
      </button>
      <button
        onClick={() => setIsDeleting(true)}
        className="p-1.5 rounded-lg bg-white/90 hover:bg-white border border-border shadow-sm transition-colors"
        title="حذف"
      >
        <Trash2 className="w-3.5 h-3.5 text-red-500" />
      </button>
    </div>
  );
}
