import { useState, useCallback } from 'react';
import TranslationService from '../services/translation.service';
import { useLanguage } from '../context/LanguageContext';

export const useTranslation = () => {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Translate text from current language to target language
   */
  const translateText = useCallback(
    async (text: string, targetLang: string, resultCase?: 'cyrill' | 'latin') => {
      setIsTranslating(true);
      setError(null);

      try {
        const result = await TranslationService.translate(
          text,
          language,
          targetLang,
          resultCase
        );
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Translation failed';
        setError(errorMessage);
        return text; // Return original text on error
      } finally {
        setIsTranslating(false);
      }
    },
    [language]
  );

  /**
   * Translate text from source language to target language
   */
  const translateFromTo = useCallback(
    async (
      text: string,
      fromLang: string,
      toLang: string,
      resultCase?: 'cyrill' | 'latin'
    ) => {
      setIsTranslating(true);
      setError(null);

      try {
        const result = await TranslationService.translate(text, fromLang, toLang, resultCase);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Translation failed';
        setError(errorMessage);
        return text; // Return original text on error
      } finally {
        setIsTranslating(false);
      }
    },
    []
  );

  /**
   * Batch translate multiple texts
   */
  const batchTranslate = useCallback(
    async (texts: string[], targetLang: string, resultCase?: 'cyrill' | 'latin') => {
      setIsTranslating(true);
      setError(null);

      try {
        const results = await TranslationService.batchTranslate(
          texts,
          language,
          targetLang,
          resultCase
        );
        return results;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Batch translation failed';
        setError(errorMessage);
        return texts; // Return original texts on error
      } finally {
        setIsTranslating(false);
      }
    },
    [language]
  );

  /**
   * Transliterate text between Latin and Cyrillic scripts
   */
  const transliterate = useCallback(
    async (
      text: string,
      fromScript: 'uz_latin' | 'uz_cyrillic' | 'kaa_latin' | 'kaa_cyrillic',
      toScript: 'uz_latin' | 'uz_cyrillic' | 'kaa_latin' | 'kaa_cyrillic'
    ) => {
      setIsTranslating(true);
      setError(null);

      try {
        const result = await TranslationService.transliterate(text, fromScript, toScript);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Transliteration failed';
        setError(errorMessage);
        return text; // Return original text on error
      } finally {
        setIsTranslating(false);
      }
    },
    []
  );

  return {
    translateText,
    translateFromTo,
    batchTranslate,
    transliterate,
    isTranslating,
    error,
    currentLanguage: language,
  };
};
