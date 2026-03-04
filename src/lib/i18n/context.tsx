"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Language, TranslationKey, getTranslation } from "./translations";

const STORAGE_KEY = "fifa-lang";
const DEFAULT_LANGUAGE: Language = "ar";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  dir: "rtl" | "ltr";
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && (stored === "ar" || stored === "en")) {
      setLanguageState(stored);
    }
    setIsHydrated(true);
  }, []);

  // Update document direction when language changes
  useEffect(() => {
    if (!isHydrated) return;
    
    const dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", language);
  }, [language, isHydrated]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return getTranslation(key, language);
  }, [language]);

  const dir = language === "ar" ? "rtl" : "ltr";
  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

/**
 * Hook for server components - returns default language functions
 * Server components should use this and client components can override
 */
export function getServerTranslation(lang: Language = DEFAULT_LANGUAGE) {
  return {
    t: (key: TranslationKey) => getTranslation(key, lang),
    dir: lang === "ar" ? "rtl" : "ltr",
    isRTL: lang === "ar",
    language: lang,
  };
}
