"use client";

import { useEffect, useRef } from "react";
import SportButton from "@/components/ui/SportButton";
import { X, CheckCircle } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  variant?: "success" | "primary" | "danger";
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  variant = "primary",
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus trap
      dialogRef.current?.focus();
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div 
        ref={dialogRef}
        tabIndex={-1}
        className="relative bg-surface rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1 text-muted hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            variant === "success" ? "bg-success/10" :
            variant === "danger" ? "bg-danger/10" :
            "bg-primary/10"
          }`}>
            <CheckCircle className={`w-8 h-8 ${
              variant === "success" ? "text-success" :
              variant === "danger" ? "text-danger" :
              "text-primary"
            }`} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-foreground mb-2">
            {title}
          </h3>
          <p className="text-muted">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <SportButton
            variant="outline"
            size="base"
            className="flex-1"
            onClick={onClose}
          >
            {cancelLabel}
          </SportButton>
          <SportButton
            variant={variant}
            size="base"
            className="flex-1"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </SportButton>
        </div>
      </div>
    </div>
  );
}
