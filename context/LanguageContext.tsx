'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ml' | 'hi' | 'ar' | 'de' | 'es' | 'fr' | 'ru' | 'zh' | 'ur';

interface LanguageContextType {
  language: Language;
  t: (key: string) => string;
  changeLanguage: (lang: Language) => Promise<void>;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaryLoaders: Record<Language, () => Promise<Record<string, string>>> = {
  en: () => import('../public/locales/en.json').then((m) => m.default),
  ml: () => import('../public/locales/ml.json').then((m) => m.default),
  hi: () => import('../public/locales/hi.json').then((m) => m.default),
  ar: () => import('../public/locales/ar.json').then((m) => m.default),
  de: () => import('../public/locales/de.json').then((m) => m.default),
  es: () => import('../public/locales/es.json').then((m) => m.default),
  fr: () => import('../public/locales/fr.json').then((m) => m.default),
  ru: () => import('../public/locales/ru.json').then((m) => m.default),
  zh: () => import('../public/locales/zh.json').then((m) => m.default),
  ur: () => import('../public/locales/ur.json').then((m) => m.default),
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Load language preference and initial translations
  useEffect(() => {
    const initLanguage = async () => {
      let savedLang = 'en' as Language;
      if (typeof window !== 'undefined') {
        savedLang = (localStorage.getItem('language') as Language) || 'en';
      }
      setLanguage(savedLang);
      try {
        const dict = await dictionaryLoaders[savedLang]();
        setTranslations(dict);
      } catch (err) {
        console.error('Failed to load translations:', err);
      } finally {
        setLoading(false);
      }
    };
    initLanguage();
  }, []);

  const changeLanguage = async (lang: Language) => {
    setLoading(true);
    try {
      const dict = await dictionaryLoaders[lang]();
      setTranslations(dict);
      setLanguage(lang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', lang);
        // Force text direction class for RTL support (e.g. Arabic)
        if (lang === 'ar' || lang === 'ur') {
          document.documentElement.dir = 'rtl';
        } else {
          document.documentElement.dir = 'ltr';
        }
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

    // Skip numbers or times
    if (/^\d+$/.test(trimmed) || /^\d{1,2}:\d{2}$/.test(trimmed) || trimmed.startsWith('Order #')) {
      return key;
    }

    const translated = translations[trimmed];
    return translated || key;
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage, loading }}>
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
