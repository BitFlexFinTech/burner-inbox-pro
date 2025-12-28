// Complete language configuration for 12 languages (8 LTR + 4 RTL)

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  fontFamily?: string;
}

export const languages: Language[] = [
  // LTR Languages
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', direction: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', direction: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', direction: 'ltr' },
  // RTL Languages
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl', fontFamily: 'Noto Sans Arabic' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', direction: 'rtl', fontFamily: 'Noto Sans Hebrew' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', direction: 'rtl', fontFamily: 'Vazirmatn' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', direction: 'rtl', fontFamily: 'Noto Nastaliq Urdu' },
];

export const defaultLanguage = 'en';

export const getLanguage = (code: string): Language | undefined => 
  languages.find(l => l.code === code);

export const isRTL = (code: string): boolean => 
  getLanguage(code)?.direction === 'rtl';

export const getLanguageFont = (code: string): string | undefined =>
  getLanguage(code)?.fontFamily;

export type LanguageCode = typeof languages[number]['code'];
