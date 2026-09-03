'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language =
  | 'en' | 'ar' | 'hi' | 'ml' | 'fr' | 'es' | 'de' | 'zh' | 'ja' | 'ur' | 'tr' | 'ru'
  | 'ko' | 'pt' | 'it' | 'nl' | 'bn' | 'ta' | 'te' | 'kn' | 'mr' | 'gu' | 'pa' | 'id'
  | 'th' | 'vi' | 'pl' | 'sv' | 'no' | 'da' | 'fi' | 'el' | 'he' | 'fa';

export const RTL_LANGUAGES: Language[] = ['ar', 'ur', 'fa', 'he'];

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', flag: '🇬🇧', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ar', flag: '🇸🇦', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'hi', flag: '🇮🇳', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'ml', flag: '🇮🇳', name: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr' },
  { code: 'fr', flag: '🇫🇷', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'es', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'de', flag: '🇩🇪', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'zh', flag: '🇨🇳', name: 'Chinese', nativeName: '中文', dir: 'ltr' },
  { code: 'ja', flag: '🇯🇵', name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  { code: 'ur', flag: '🇵🇰', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
  { code: 'tr', flag: '🇹🇷', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr' },
  { code: 'ru', flag: '🇷🇺', name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
  { code: 'ko', flag: '🇰🇷', name: 'Korean', nativeName: '한국어', dir: 'ltr' },
  { code: 'pt', flag: '🇵🇹', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  { code: 'it', flag: '🇮🇹', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
  { code: 'nl', flag: '🇳🇱', name: 'Dutch', nativeName: 'Nederlands', dir: 'ltr' },
  { code: 'bn', flag: '🇧🇩', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
  { code: 'ta', flag: '🇮🇳', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
  { code: 'te', flag: '🇮🇳', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr' },
  { code: 'kn', flag: '🇮🇳', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr' },
  { code: 'mr', flag: '🇮🇳', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr' },
  { code: 'gu', flag: '🇮🇳', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr' },
  { code: 'pa', flag: '🇮🇳', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr' },
  { code: 'id', flag: '🇮🇩', name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'th', flag: '🇹🇭', name: 'Thai', nativeName: 'ไทย', dir: 'ltr' },
  { code: 'vi', flag: '🇻🇳', name: 'Vietnamese', nativeName: 'Tiếng Việt', dir: 'ltr' },
  { code: 'pl', flag: '🇵🇱', name: 'Polish', nativeName: 'Polski', dir: 'ltr' },
  { code: 'sv', flag: '🇸🇪', name: 'Swedish', nativeName: 'Svenska', dir: 'ltr' },
  { code: 'no', flag: '🇳🇴', name: 'Norwegian', nativeName: 'Norsk', dir: 'ltr' },
  { code: 'da', flag: '🇩🇰', name: 'Danish', nativeName: 'Dansk', dir: 'ltr' },
  { code: 'fi', flag: '🇫🇮', name: 'Finnish', nativeName: 'Suomi', dir: 'ltr' },
  { code: 'el', flag: '🇬🇷', name: 'Greek', nativeName: 'Ελληνικά', dir: 'ltr' },
  { code: 'he', flag: '🇮🇱', name: 'Hebrew', nativeName: 'עברית', dir: 'rtl' },
  { code: 'fa', flag: '🇮🇷', name: 'Persian', nativeName: 'فارسی', dir: 'rtl' },
];

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  t: (key: string) => string;
  changeLanguage: (lang: Language) => Promise<void>;
  loading: boolean;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaryLoaders: Record<Language, () => Promise<Record<string, string>>> = {
  en: () => import('../public/locales/en.json').then((m) => m.default),
  ar: () => import('../public/locales/ar.json').then((m) => m.default),
  hi: () => import('../public/locales/hi.json').then((m) => m.default),
  ml: () => import('../public/locales/ml.json').then((m) => m.default),
  fr: () => import('../public/locales/fr.json').then((m) => m.default),
  es: () => import('../public/locales/es.json').then((m) => m.default),
  de: () => import('../public/locales/de.json').then((m) => m.default),
  zh: () => import('../public/locales/zh.json').then((m) => m.default),
  ja: () => import('../public/locales/ja.json').then((m) => m.default),
  ur: () => import('../public/locales/ur.json').then((m) => m.default),
  tr: () => import('../public/locales/tr.json').then((m) => m.default),
  ru: () => import('../public/locales/ru.json').then((m) => m.default),
  ko: () => import('../public/locales/ko.json').then((m) => m.default),
  pt: () => import('../public/locales/pt.json').then((m) => m.default),
  it: () => import('../public/locales/it.json').then((m) => m.default),
  nl: () => import('../public/locales/nl.json').then((m) => m.default),
  bn: () => import('../public/locales/bn.json').then((m) => m.default),
  ta: () => import('../public/locales/ta.json').then((m) => m.default),
  te: () => import('../public/locales/te.json').then((m) => m.default),
  kn: () => import('../public/locales/kn.json').then((m) => m.default),
  mr: () => import('../public/locales/mr.json').then((m) => m.default),
  gu: () => import('../public/locales/gu.json').then((m) => m.default),
  pa: () => import('../public/locales/pa.json').then((m) => m.default),
  id: () => import('../public/locales/id.json').then((m) => m.default),
  th: () => import('../public/locales/th.json').then((m) => m.default),
  vi: () => import('../public/locales/vi.json').then((m) => m.default),
  pl: () => import('../public/locales/pl.json').then((m) => m.default),
  sv: () => import('../public/locales/sv.json').then((m) => m.default),
  no: () => import('../public/locales/no.json').then((m) => m.default),
  da: () => import('../public/locales/da.json').then((m) => m.default),
  fi: () => import('../public/locales/fi.json').then((m) => m.default),
  el: () => import('../public/locales/el.json').then((m) => m.default),
  he: () => import('../public/locales/he.json').then((m) => m.default),
  fa: () => import('../public/locales/fa.json').then((m) => m.default),
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, val: string, days = 365) => {
  if (typeof document === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${val};expires=${d.toUTCString()};path=/`;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const isRTL = RTL_LANGUAGES.includes(language);

  // Auto-detect & load initial language
  useEffect(() => {
    const initLanguage = async () => {
      let savedLang: Language = 'en';
      if (typeof window !== 'undefined') {
        const stored = (localStorage.getItem('language') || getCookie('ubs_lang')) as Language;
        if (stored && dictionaryLoaders[stored]) {
          savedLang = stored;
        } else if (navigator.language) {
          const browserLang = navigator.language.split('-')[0].toLowerCase() as Language;
          if (dictionaryLoaders[browserLang]) {
            savedLang = browserLang;
          }
        }
      }

      setLanguage(savedLang);
      try {
        const dict = await dictionaryLoaders[savedLang]();
        setTranslations(dict);
      } catch (err) {
        console.error('Failed to load translations:', err);
      } finally {
        if (typeof document !== 'undefined') {
          document.documentElement.dir = RTL_LANGUAGES.includes(savedLang) ? 'rtl' : 'ltr';
          document.documentElement.lang = savedLang;
        }
        setLoading(false);
      }
    };

    initLanguage();
  }, []);

  const changeLanguage = async (lang: Language) => {
    setLoading(true);
    try {
      const loader = dictionaryLoaders[lang] || dictionaryLoaders.en;
      const dict = await loader();
      setTranslations(dict);
      setLanguage(lang);

      if (typeof window !== 'undefined') {
        localStorage.setItem('language', lang);
        setCookie('ubs_lang', lang);
        document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
      }
    } catch (err) {
      console.error(`Failed to load translation for ${lang}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const t = (key: string): string => {
    if (!key) return '';
    const trimmed = key.trim();
    if (!trimmed) return key;

    if (/^\d+$/.test(trimmed) || /^\d{1,2}:\d{2}$/.test(trimmed) || trimmed.startsWith('Order #')) {
      return key;
    }

    const translated = translations[trimmed];
    return translated || key;
  };

  return (
    <LanguageContext.Provider value={{ language, isRTL, t, changeLanguage, loading, languages: LANGUAGE_OPTIONS }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
