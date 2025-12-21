/**
 * i18next Configuration - Client App
 * Multi-language support with React i18next
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from '../i18n/translations';

// Supported languages
export type Language = 'en' | 'ru' | 'uz' | 'kaa';

const resources = {
  en: { translation: translations.en },
  ru: { translation: translations.ru },
  uz: { translation: translations.uz },
  kaa: { translation: translations.kaa },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    compatibilityJSON: 'v4', // Use latest JSON format
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

export default i18n;
