// DEPRECATED: This file is a compatibility shim.
// New code should use stores/useLanguageStore.ts instead.

import React, { ReactNode, useEffect } from 'react';
import { useLanguageStore, Language } from '../stores/useLanguageStore';

// Re-export type
export type { Language };

// Re-export hook for backward compatibility
export const useLanguage = () => {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = useLanguageStore((state) => state.t);

  return {
    language,
    setLanguage,
    t,
  };
};

// Empty provider for backward compatibility
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const loadLanguage = useLanguageStore((state) => state.loadLanguage);

  useEffect(() => {
    loadLanguage();
  }, []);

  return <>{children}</>;
};
