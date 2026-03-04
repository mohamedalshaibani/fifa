"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/context";

interface SetupBannerProps {
  tournamentId: string;
  tournamentSlug: string;
  isAdmin: boolean;
  setupMessage: string;
}

/**
 * Shows a warning banner when tournament is not fully configured
 * Optionally shows admin button to complete setup
 */
export default function SetupBanner({
  tournamentId,
  tournamentSlug,
  isAdmin,
  setupMessage,
}: SetupBannerProps) {
  const { t } = useLanguage();
  
  return (
    <div className="mb-6 rounded-2xl border-l-4 border-warning bg-warning/5 border border-warning/30 p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-warning mb-1">
              {t("setupBanner.inProgress")}
            </p>
            <p className="text-sm text-secondary">
              {setupMessage}
            </p>
          </div>
        </div>

        {isAdmin && (
          <Link href={`/admin/tournaments/${tournamentId}`} className="flex-shrink-0">
            <Button size="sm" variant="secondary">
              {t("setupBanner.completeSetup")}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
