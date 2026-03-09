"use client";

import { useState, useRef } from "react";
import { Pencil, Trash2, X, Loader2, Save, Camera } from "lucide-react";
import { updateAvatar, deleteAvatar } from "./actions";
import ImageCropper from "./ImageCropper";
import type { Avatar } from "@/lib/types";
import { useLanguage } from "@/lib/i18n";

interface AvatarCardActionsProps {
  avatar: Avatar;
}

export default function AvatarCardActions({ avatar }: AvatarCardActionsProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(formRef.current!);
      formData.set("id", avatar.id);
      
      if (croppedFile) {
        formData.set("file", croppedFile);
      }
      
      const result = await updateAvatar(formData);

      if (result.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
        setPreview(null);
        setCroppedFile(null);
      }
    } catch {
      setError(t("avatarUpload.unexpectedError"));
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
    } catch {
      setError(t("avatarUpload.unexpectedError"));
      setIsDeleting(false);
    } finally {
      setIsLoading(false);
    }
  };

  const closeEdit = () => {
    setIsEditing(false);
    setPreview(null);
    setCroppedFile(null);
    setError(null);
  };

  // Image Cropper Modal
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

  // Edit Modal
  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-lg font-bold text-foreground">{t("avatarUpload.editAvatar")}</h3>
            <button
              onClick={closeEdit}
              className="p-2 rounded-lg hover:bg-surface transition-colors"
            >
              <X className="w-5 h-5 text-muted" />
            </button>
          </div>

          {/* Body */}
          <form ref={formRef} onSubmit={handleUpdate} className="p-6 space-y-5">
            {/* Current/New Image */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-border bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview || avatar.image_url}
                    alt={avatar.display_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                  <div className="p-3 bg-white rounded-full shadow-lg">
                    <Camera className="w-5 h-5 text-primary" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <p className="text-xs text-center text-muted">{t("avatarUpload.clickToChange")}</p>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">
                  {t("avatarUpload.nameIdentifier")}
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={avatar.name}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">
                  {t("avatarUpload.displayName")}
                </label>
                <input
                  type="text"
                  name="displayName"
                  defaultValue={avatar.display_name}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-colors"
                />
              </div>

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
                      defaultChecked={avatar.category === "player"}
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
                      defaultChecked={avatar.category === "legend"}
                      className="peer sr-only"
                    />
                    <div className="px-4 py-3 rounded-xl border-2 border-border peer-checked:border-primary peer-checked:bg-primary/5 text-center transition-colors">
                      <span className="text-sm font-medium">{t("avatarUpload.legend")}</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeEdit}
                disabled={isLoading}
                className="flex-1 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                style={{
                  height: 48,
                  background: "#FFFFFF",
                  color: "#374151",
                  border: "1px solid #E5E7EB",
                }}
              >
                {t("matchEditor.cancel")}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                style={{
                  height: 48,
                  background: "linear-gradient(135deg, #005CFF 0%, #3385FF 100%)",
                  color: "#FFFFFF",
                  borderBottom: "2px solid #00E676",
                  boxShadow: "0 4px 14px rgba(0, 92, 255, 0.35)",
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t("avatarUpload.saveChanges")}
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2">{t("avatarUpload.deleteAvatar")}</h3>
            <p className="text-sm text-muted">
              {t("avatarUpload.deleteWarning").replace("{name}", avatar.display_name)}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsDeleting(false);
                setError(null);
              }}
              disabled={isLoading}
              className="flex-1 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              style={{
                height: 48,
                background: "#FFFFFF",
                color: "#374151",
                border: "1px solid #E5E7EB",
              }}
            >
              {t("matchEditor.cancel")}
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              style={{
                height: 48,
                background: "#DC2626",
                color: "#FFFFFF",
                boxShadow: "0 4px 14px rgba(220, 38, 38, 0.35)",
              }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  {t("deleteButton.confirm")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Action Buttons Row (always visible, clean layout)
  return (
    <div className="flex gap-2 justify-center pt-1">
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
      >
        <Pencil className="w-3 h-3" />
        {t("matchEditor.edit")}
      </button>
      <button
        onClick={() => setIsDeleting(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors"
      >
        <Trash2 className="w-3 h-3" />
        {t("deleteButton.confirm")}
      </button>
    </div>
  );
}
