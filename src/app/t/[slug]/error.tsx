"use client";

import { useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();
  
  useEffect(() => {
    // Log the error to console for debugging
    console.error("[Tournament Page Error]", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error digest:", error.digest);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold text-foreground">{t("error.title")}</h1>
        <p className="text-secondary">
          {t("error.apology")}
        </p>
        
        {/* Always show error details for debugging */}
        <div className="text-left p-4 bg-danger/10 rounded-lg border border-danger/30 overflow-auto max-h-48">
          <p className="text-xs font-mono text-danger mb-2 break-all">
            <strong>Error:</strong> {error.name || "Unknown"}
          </p>
          <p className="text-xs font-mono text-danger mb-2 break-all">
            <strong>Message:</strong> {error.message || "No message"}
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-danger break-all">
              <strong>Digest:</strong> {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>
            {t("error.tryAgain")}
          </Button>
          <Link href="/tournaments">
            <Button variant="secondary">
              {t("register.backToTournaments")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
