import axios from 'axios';

const TRANSLATION_API_BASE_URL = 'https://api.from-to.uz/api/v1';
const LANGUAGES_CDN_URL = 'https://cdn.from-to.uz/languages.json';

// Language code mapping from app codes to API codes
const LANGUAGE_CODE_MAP: Record<string, string> = {
  en: 'eng_Latn',
  ru: 'rus_Cyrl',
  uz: 'uzn_Latn',
  kaa: 'kaa',
};

// Reverse mapping for API codes to app codes
const REVERSE_LANGUAGE_CODE_MAP: Record<string, string> = {
  eng_Latn: 'en',
  rus_Cyrl: 'ru',
  uzn_Latn: 'uz',
  kaa: 'kaa',
};

export interface TranslateRequest {
  lang_from: string;
  lang_to: string;
  resultCase?: 'cyrill' | 'latin';
  text: string;
}

export interface TranslateResponse {
  result: string;
}

export interface TransliterateRequest {
  lang_from: 'uz_latin' | 'uz_cyrillic' | 'kaa_latin' | 'kaa_cyrillic';
  lang_to: 'uz_latin' | 'uz_cyrillic' | 'kaa_latin' | 'kaa_cyrillic';
  text: string;
}

export interface LanguageInfo {
  name: string;
  code: string;
}

class TranslationService {
  /**
   * Translate text from one language to another
   */
  async translate(
    text: string,
    fromLang: string,
    toLang: string,
    resultCase?: 'cyrill' | 'latin'
  ): Promise<string> {
    try {
      const langFrom = LANGUAGE_CODE_MAP[fromLang] || fromLang;
      const langTo = LANGUAGE_CODE_MAP[toLang] || toLang;

      const response = await axios.post<TranslateResponse>(
        `${TRANSLATION_API_BASE_URL}/translate`,
        {
          body: {
            lang_from: langFrom,
            lang_to: langTo,
            resultCase: resultCase || 'latin',
            text,
          },
        }
      );

      return response.data.result;
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Failed to translate text');
    }
  }

  /**
   * Transliterate text between Latin and Cyrillic scripts
   */
  async transliterate(
    text: string,
    fromScript: 'uz_latin' | 'uz_cyrillic' | 'kaa_latin' | 'kaa_cyrillic',
    toScript: 'uz_latin' | 'uz_cyrillic' | 'kaa_latin' | 'kaa_cyrillic'
  ): Promise<string> {
    try {
      const response = await axios.post<TranslateResponse>(
        `${TRANSLATION_API_BASE_URL}/transliterate`,
        {
          body: {
            lang_from: fromScript,
            lang_to: toScript,
            text,
          },
        }
      );

      return response.data.result;
    } catch (error) {
      console.error('Transliteration error:', error);
      throw new Error('Failed to transliterate text');
    }
  }

  /**
   * Get list of all available languages from the API
   */
  async getAvailableLanguages(): Promise<LanguageInfo[]> {
    try {
      const response = await axios.get<LanguageInfo[]>(LANGUAGES_CDN_URL);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      throw new Error('Failed to fetch available languages');
    }
  }

  /**
   * Batch translate multiple texts
   */
  async batchTranslate(
    texts: string[],
    fromLang: string,
    toLang: string,
    resultCase?: 'cyrill' | 'latin'
  ): Promise<string[]> {
    try {
      const translations = await Promise.all(
        texts.map((text) => this.translate(text, fromLang, toLang, resultCase))
      );
      return translations;
    } catch (error) {
      console.error('Batch translation error:', error);
      throw new Error('Failed to batch translate texts');
    }
  }

  /**
   * Get the API language code from app language code
   */
  getApiLanguageCode(appLangCode: string): string {
    return LANGUAGE_CODE_MAP[appLangCode] || appLangCode;
  }

  /**
   * Get the app language code from API language code
   */
  getAppLanguageCode(apiLangCode: string): string {
    return REVERSE_LANGUAGE_CODE_MAP[apiLangCode] || apiLangCode;
  }
}

export default new TranslationService();
