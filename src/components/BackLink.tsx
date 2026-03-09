"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface BackLinkProps {
  /** Target URL to navigate to */
  fallbackHref?: string;
}

/**
 * Unified back button component for consistent navigation across all pages.
 * 
 * Behavior:
 * - Uses explicit Link navigation to the provided fallbackHref
 * - Always scrolls to top of the target page
 * - Provides predictable navigation (no history-dependent behavior)
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
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;
  
  return (
    <Link
      href={fallbackHref}
      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors mb-6"
    >
      <ArrowIcon className="w-4 h-4" />
      <span>{t("common.back")}</span>
    </Link>
  );
}
