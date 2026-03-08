"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n";

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional icon to display before the title */
  icon?: ReactNode;
  /** Fallback back link URL (if history not available) */
  backHref?: string;
  /** Optional badge/status element to display */
  badge?: ReactNode;
  /** Optional subtitle text */
  subtitle?: string;
  /** Optional additional actions/buttons */
  actions?: ReactNode;
  /** Optional live indicator text (e.g., "BRACKET", "STANDINGS") */
  liveIndicator?: string;
  /** Use scoreboard style (broadcast TV look) */
  scoreboard?: boolean;
}

/**
 * Unified page header with consistent back button styling.
 * 
 * Back Button Standards:
 * - Uses browser history.back() for natural navigation
 * - Falls back to backHref if provided
 * - Font: text-sm font-semibold
 * - Color: text-primary hover:text-primary-hover
 * - Icon: ArrowRight for RTL, ArrowLeft for LTR
 * - Text: "العودة" (Arabic) / "Back" (English)
 * - Spacing: mb-4 (space between back button and title)
 */
export default function PageHeader({
  title,
  icon,
  backHref,
  badge,
  subtitle,
  actions,
  liveIndicator,
  scoreboard = false,
}: PageHeaderProps) {
  const { isRTL, t } = useLanguage();
  const router = useRouter();
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;
  
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (backHref) {
      router.push(backHref);
    } else {
      router.push("/");
    }
  };
  
  // Unified back button component used in both variants
  const BackButtonElement = backHref !== undefined ? (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
    >
      <ArrowIcon className="w-4 h-4" />
      <span>{t("common.back")}</span>
    </button>
  ) : null;

  if (scoreboard) {
    return (
      <header className="mb-8 space-y-4">
        {/* Back Button - Consistent styling */}
        {BackButtonElement}

        {/* Scoreboard Style Header */}
        <div className="scoreboard">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
              {liveIndicator && (
                <div className="live-indicator flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  {liveIndicator}
                </div>
              )}
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-foreground heading-tight flex items-start sm:items-center gap-2 break-words hyphens-auto leading-tight min-w-0">
                {icon && <span className="flex-shrink-0 mt-0.5 sm:mt-0">{icon}</span>}
                <span className="break-words">{title}</span>
              </h1>
            </div>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-muted text-sm">{subtitle}</p>
        )}

        {/* Actions */}
        {actions && (
          <div className="flex flex-wrap gap-3">{actions}</div>
        )}
      </header>
    );
  }

  return (
    <header className="mb-8 space-y-4">
      {/* Back Button - Consistent styling */}
      {BackButtonElement}

      {/* Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground flex items-start sm:items-center gap-2 sm:gap-3 break-words hyphens-auto leading-tight">
            {icon && <span className="flex-shrink-0 mt-1 sm:mt-0">{icon}</span>}
            <span className="break-words">{title}</span>
          </h1>
          {subtitle && (
            <p className="text-muted text-sm">{subtitle}</p>
          )}
        </div>

        {/* Badge & Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {badge}
          {actions}
        </div>
      </div>
    </header>
  );
}
