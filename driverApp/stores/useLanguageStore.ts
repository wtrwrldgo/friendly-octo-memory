import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Language } from '../i18n/translations';

// Re-export Language type for easy importing
export type { Language };

const LANGUAGE_STORAGE_KEY = '@watergo_driver_language';

interface LanguageStore {
  // State
  language: Language;

  // Actions
  setLanguage: (lang: Language) => Promise<void>;
  loadLanguage: () => Promise<void>;
  t: (key: string) => string;
}

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  // Initial state
  language: 'en',

  // Load language from storage
  loadLanguage: async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      const languageToUse = (storedLanguage || 'en') as Language;
      set({ language: languageToUse });
    } catch (error) {
      console.error('Failed to load language:', error);
      set({ language: 'en' });
    }
  },

  // Set language
  setLanguage: async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      set({ language: lang });
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  },

  // Translation function with fallback to English
  t: (key: string): string => {
    const { language } = get();
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object') {
            value = value[fallbackKey];
          }
        }
        break;
      }
    }

    return typeof value === 'string' ? value : key;
  },
}));
