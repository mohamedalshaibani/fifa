// Re-export everything from i18n modules
export { translations, getTranslation } from "./translations";
export type { Language, TranslationKey } from "./translations";
export { LanguageProvider, useLanguage, getServerTranslation } from "./context";
