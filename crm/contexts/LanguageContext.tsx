// file: contexts/LanguageContext.tsx

"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { translations, Language, TranslationKeys } from "@/i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "crm-language";

const languageLabels: Record<Language, string> = {
  en: "English",
  ru: "Русский",
  uz: "O'zbek",
  kaa: "Qaraqalpaq",
};

export const languageFlags: Record<Language, string> = {
  en: "🇬🇧",
  ru: "🇷🇺",
  uz: "🇺🇿",
  kaa: "🇺🇿",
};

export const languages: { code: Language; label: string; flag: string }[] = [
  { code: "uz", label: languageLabels.uz, flag: languageFlags.uz },
  { code: "ru", label: languageLabels.ru, flag: languageFlags.ru },
  { code: "en", label: languageLabels.en, flag: languageFlags.en },
  { code: "kaa", label: languageLabels.kaa, flag: languageFlags.kaa },
];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("uz");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = translations[language];

  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
