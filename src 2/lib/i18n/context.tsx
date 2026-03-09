"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useSyncExternalStore } from "react";
import { Language, TranslationKey, getTranslation } from "./translations";

const STORAGE_KEY = "fifa-lang";
const DEFAULT_LANGUAGE: Language = "ar";

// Simple hydration detection using useSyncExternalStore
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  dir: "rtl" | "ltr";
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Detect hydration without setState in effect
  const isHydrated = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  
  // Initialize with stored value synchronously to avoid setState in effect
  const getInitialLanguage = (): Language => {
    if (typeof window === "undefined") return DEFAULT_LANGUAGE;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "ar" || stored === "en" ? stored : DEFAULT_LANGUAGE;
  };
  
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

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
