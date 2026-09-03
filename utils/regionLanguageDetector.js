const COUNTRY_TO_LANG_MAP = {
  'SA': 'ar', 'AE': 'ar', 'QA': 'ar', 'KW': 'ar', 'OM': 'ar', 'BH': 'ar', 'EG': 'ar', 'JO': 'ar',
  'IN': 'hi', 'PK': 'ur', 'BD': 'bn', 'KR': 'ko', 'JP': 'ja', 'CN': 'zh', 'TW': 'zh',
  'ID': 'id', 'TH': 'th', 'VN': 'vi', 'FR': 'fr', 'ES': 'es', 'MX': 'es', 'DE': 'de',
  'PT': 'pt', 'BR': 'pt', 'IT': 'it', 'NL': 'nl', 'RU': 'ru', 'TR': 'tr', 'PL': 'pl',
  'SE': 'sv', 'NO': 'no', 'DK': 'da', 'FI': 'fi', 'GR': 'el', 'IL': 'he', 'IR': 'fa',
  'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en'
};

const SUPPORTED_LANG_CODES = [
  'en', 'ar', 'hi', 'ml', 'fr', 'es', 'de', 'zh', 'ja', 'ur',
  'tr', 'ru', 'ko', 'pt', 'it', 'nl', 'bn', 'ta', 'te', 'kn',
  'mr', 'gu', 'pa', 'id', 'th', 'vi', 'pl', 'sv', 'no', 'da',
  'fi', 'el', 'he', 'fa'
];

export function detectWebLanguage() {
  if (typeof window === 'undefined') return 'en';

  try {
    const saved = localStorage.getItem('language');
    if (saved && SUPPORTED_LANG_CODES.includes(saved)) {
      return saved;
    }

    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    const code = browserLang.split('-')[0];
    if (code && SUPPORTED_LANG_CODES.includes(code)) {
      return code;
    }
  } catch (e) {
    console.warn('[WebLanguageDetector] Detection error:', e);
  }

  return 'en';
}
