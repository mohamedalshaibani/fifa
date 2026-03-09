"use client";

import { useLanguage } from "@/lib/i18n";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                 bg-surface-2 border border-border text-foreground
                 hover:bg-primary/10 hover:border-primary/30 hover:text-primary
                 transition-all duration-200"
      aria-label={t("language.toggle")}
    >
      <Globe className="w-4 h-4" />
      <span>{t("language.toggle")}</span>
    </button>
  );
}
