import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Language } from '../i18n/translations';
import { useUser } from './UserContext';

interface LanguageContextType {
  language: Language;
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const LANGUAGE_STORAGE_KEY = '@watergo_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, updateUser } = useUser();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language from storage on mount
  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      // Priority: 1. User language, 2. Stored language, 3. Default 'en'
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      const languageToUse = (user?.language || storedLanguage || 'en') as Language;
      setCurrentLanguage(languageToUse);
    } catch (error) {
      console.error('Failed to load language:', error);
      setCurrentLanguage('en');
    } finally {
      setIsLoaded(true);
    }
  };

  // Sync language when user object changes
  useEffect(() => {
    if (user?.language && isLoaded) {
      setCurrentLanguage(user.language as Language);
    }
  }, [user?.language, isLoaded]);

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage];

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
  };

  const setLanguage = async (lang: Language) => {
    try {
      // Save to AsyncStorage immediately (even if no user yet)
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setCurrentLanguage(lang);

      // Also update user object if it exists
      if (user) {
        updateUser({ language: lang });
      }
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language: currentLanguage, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
