import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { languages, defaultLanguage, getLanguage, isRTL, getLanguageFont, type Language } from './languages';
import { translations, getTranslation } from './translations';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  languages: Language[];
  currentLanguage: Language;
  isRTL: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
  direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Detect browser language
const detectBrowserLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0];
  const supported = languages.find(l => l.code === browserLang);
  return supported ? browserLang : defaultLanguage;
};

// Get saved language or detect
const getInitialLanguage = (): string => {
  const saved = localStorage.getItem('language');
  if (saved && languages.find(l => l.code === saved)) {
    return saved;
  }
  return detectBrowserLanguage();
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(getInitialLanguage);
  
  const currentLanguage = getLanguage(language) || getLanguage(defaultLanguage)!;
  const rtl = isRTL(language);
  
  // Update document direction and lang attribute
  useEffect(() => {
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Apply RTL font if needed
    const font = getLanguageFont(language);
    if (font) {
      document.body.style.fontFamily = `'${font}', 'Outfit', system-ui, sans-serif`;
    } else {
      document.body.style.fontFamily = "'Outfit', system-ui, sans-serif";
    }
  }, [language, rtl]);
  
  const setLanguage = useCallback((lang: string) => {
    if (languages.find(l => l.code === lang)) {
      setLanguageState(lang);
      localStorage.setItem('language', lang);
    }
  }, []);
  
  // Translation function with interpolation
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let translation = getTranslation(language, key);
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
      });
    }
    
    return translation;
  }, [language]);
  
  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languages,
        currentLanguage,
        isRTL: rtl,
        t,
        direction: rtl ? 'rtl' : 'ltr',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Simple hook for just the translation function
export const useTranslation = () => {
  const { t, language, isRTL, direction } = useLanguage();
  return { t, language, isRTL, direction };
};
