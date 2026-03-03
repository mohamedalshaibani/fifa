import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional icon to display before the title */
  icon?: ReactNode;
  /** Back link URL */
  backHref?: string;
  /** Back link text - defaults to "العودة" */
  backText?: string;
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
 * Unified page header with consistent back link styling.
 * 
 * Back Link Standards:
 * - Font: text-sm font-semibold
 * - Color: text-primary hover:text-primary-hover
 * - Icon: ArrowRight w-4 h-4
 * - Spacing: mb-4 (space between back link and title)
 */
export default function PageHeader({
  title,
  icon,
  backHref,
  backText = "العودة",
  badge,
  subtitle,
  actions,
  liveIndicator,
  scoreboard = false,
}: PageHeaderProps) {
  // Unified back link component used in both variants
  const BackLinkElement = backHref ? (
    <Link
      href={backHref}
      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
    >
      <ArrowRight className="w-4 h-4" />
      <span>{backText}</span>
    </Link>
  ) : null;

  if (scoreboard) {
    return (
      <header className="mb-8 space-y-4">
        {/* Back Link - Consistent styling */}
        {BackLinkElement}

        {/* Scoreboard Style Header */}
        <div className="scoreboard">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {liveIndicator && (
                <div className="live-indicator">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  {liveIndicator}
                </div>
              )}
              <h1 className="text-xl sm:text-2xl font-black text-foreground heading-tight flex items-center gap-2">
                {icon}
                {title}
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
      {/* Back Link - Consistent styling */}
      {BackLinkElement}

      {/* Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
            {icon}
            <span>{title}</span>
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
