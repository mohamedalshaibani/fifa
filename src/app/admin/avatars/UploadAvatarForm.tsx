"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, ImagePlus } from "lucide-react";
import { uploadAvatar } from "./actions";
import ImageCropper from "./ImageCropper";
import { useLanguage } from "@/lib/i18n";

interface UploadAvatarFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UploadAvatarForm({ onSuccess, onCancel }: UploadAvatarFormProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError(t("avatarUpload.invalidType"));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(t("avatarUpload.fileTooLarge"));
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImageSrc(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "cropped-avatar.jpg", { type: "image/jpeg" });
    setCroppedFile(file);
    setPreview(URL.createObjectURL(croppedBlob));
    setShowCropper(false);
    setRawImageSrc(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!croppedFile) {
      setError(t("avatarUpload.selectImage"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(formRef.current!);
      formData.set("file", croppedFile);
      
      const result = await uploadAvatar(formData);

      if (result.error) {
        setError(result.error);
      } else {
        onSuccess?.();
      }
    } catch {
      setError(t("avatarUpload.unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setCroppedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Show Cropper Modal
  if (showCropper && rawImageSrc) {
    return (
      <ImageCropper
        imageSrc={rawImageSrc}
        onCropComplete={handleCropComplete}
        onCancel={() => {
          setShowCropper(false);
          setRawImageSrc(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
      />
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
          dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : preview
            ? "border-primary/40 bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-surface"
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
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt={t("avatarUpload.preview")} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                {t("avatarUpload.changeImage")}
              </button>
              <span className="text-muted">|</span>
              <button
                type="button"
                onClick={clearImage}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                {t("avatarUpload.remove")}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <ImagePlus className="w-10 h-10 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                {t("avatarUpload.dragDrop")}
              </p>
              <p className="text-sm text-muted mt-1">
                {t("avatarUpload.orClickToSelect")}
              </p>
              <p className="text-xs text-muted mt-2">
                {t("avatarUpload.fileRestrictions")}
              </p>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Name Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">
            {t("avatarUpload.nameIdentifier")}
          </label>
          <input
            type="text"
            name="name"
            placeholder={t("avatarUpload.namePlaceholder")}
            required
            className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">
            {t("avatarUpload.displayName")}
          </label>
          <input
            type="text"
            name="displayName"
            placeholder={t("avatarUpload.displayNamePlaceholder")}
            required
            className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-3">
          {t("avatarUpload.category")}
        </label>
        <div className="flex gap-4">
          <label className="flex-1 cursor-pointer">
            <input
              type="radio"
              name="category"
              value="player"
              defaultChecked
              className="peer sr-only"
            />
            <div className="px-4 py-3 rounded-xl border-2 border-border peer-checked:border-primary peer-checked:bg-primary/5 text-center transition-colors">
              <span className="text-sm font-medium">{t("avatarUpload.currentPlayer")}</span>
            </div>
          </label>
          <label className="flex-1 cursor-pointer">
            <input
              type="radio"
              name="category"
              value="legend"
              className="peer sr-only"
            />
            <div className="px-4 py-3 rounded-xl border-2 border-border peer-checked:border-primary peer-checked:bg-primary/5 text-center transition-colors">
              <span className="text-sm font-medium">{t("avatarUpload.legend")}</span>
            </div>
          </label>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl border border-border text-muted font-medium hover:bg-surface transition-colors disabled:opacity-50"
          >
            {t("matchEditor.cancel")}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !croppedFile}
          className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("avatarUpload.uploading")}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {t("avatarUpload.uploadImage")}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
