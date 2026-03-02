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
  if (scoreboard) {
    return (
      <header className="mb-8 space-y-4">
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

        {/* Back Link - Separate row */}
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors font-bold text-sm"
          >
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            <span>{backText}</span>
          </Link>
        )}

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
      {/* Back Link - Top Row (RTL: right-aligned) */}
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-90 transition-opacity"
        >
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          <span>{backText}</span>
        </Link>
      )}

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
