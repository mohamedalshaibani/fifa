"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadAvatar } from "./actions";

interface UploadAvatarFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UploadAvatarForm({ onSuccess, onCancel }: UploadAvatarFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file) {
      // Validate on client side too
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError("نوع الملف غير مدعوم. يجب أن يكون JPG أو PNG أو WebP");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("حجم الملف كبير جداً. الحد الأقصى 2 ميجابايت");
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      // Create a DataTransfer to set the file
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleFileChange(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(formRef.current!);
      const result = await uploadAvatar(formData);

      if (result.error) {
        setError(result.error);
      } else {
        onSuccess?.();
      }
    } catch {
      setError("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="معاينة" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-sm text-muted hover:text-foreground"
            >
              إزالة الصورة
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center">
              <Upload className="w-8 h-8 text-muted" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                اسحب وأفلت الصورة هنا
              </p>
              <p className="text-xs text-muted mt-1">
                أو انقر للاختيار • JPG, PNG, WebP • حد أقصى 2MB
              </p>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          required
        />
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">
            الاسم (معرّف)
          </label>
          <input
            type="text"
            name="name"
            placeholder="مثال: messi"
            required
            className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">
            الاسم المعروض
          </label>
          <input
            type="text"
            name="displayName"
            placeholder="مثال: ليونيل ميسي"
            required
            className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground"
          />
        </div>
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
              defaultChecked
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm font-medium text-foreground">لاعب حالي</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              value="legend"
              className="w-4 h-4 text-primary"
            />
            <span className="text-sm font-medium text-foreground">أسطورة</span>
          </label>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-lg border border-border text-muted hover:bg-surface transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الرفع...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              رفع الصورة
            </>
          )}
        </button>
      </div>
    </form>
  );
}
