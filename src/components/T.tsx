"use client";

import { useLanguage } from "@/lib/i18n";
import { TranslationKey } from "@/lib/i18n/translations";
import { ReactNode } from "react";

interface TProps {
  k: TranslationKey;
  children?: ReactNode;
}

/**
 * Simple translation component for use in mixed server/client contexts.
 * Usage: <T k="header.login" /> or <T k="header.login">Fallback</T>
 */
export function T({ k, children }: TProps) {
  const { t } = useLanguage();
  return <>{t(k) || children}</>;
}

/**
 * Client component that renders translated text inline.
 * For use when you need translated text in server components.
 */
export function TranslatedText({ k }: { k: TranslationKey }) {
  const { t } = useLanguage();
  return <>{t(k)}</>;
}
