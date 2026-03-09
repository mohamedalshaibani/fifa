"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface BackLinkProps {
  /** Fallback URL if history is not available */
  fallbackHref?: string;
}

/**
 * Unified back button component for consistent navigation across all pages.
 * 
 * Behavior:
 * - Uses browser history.back() for natural back navigation
 * - Falls back to fallbackHref if provided and no history exists
 * - Falls back to home page "/" if no fallbackHref provided
 * 
 * Styling:
 * - Font: text-sm font-semibold
 * - Color: text-primary with hover effect
 * - Icon: ArrowRight for RTL (Arabic), ArrowLeft for LTR (English)
 * - Gap: gap-2 between icon and text
 * 
 * Text:
 * - Arabic: العودة
 * - English: Back
 */
export default function BackLink({ fallbackHref = "/" }: BackLinkProps) {
  const { isRTL, t } = useLanguage();
  const router = useRouter();
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;
  
  const handleBack = () => {
    // Check if there's history to go back to
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      // Fallback to provided URL or home
      router.push(fallbackHref);
    }
  };
  
  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors mb-6 cursor-pointer"
    >
      <ArrowIcon className="w-4 h-4" />
      <span>{t("common.back")}</span>
    </button>
  );
}
