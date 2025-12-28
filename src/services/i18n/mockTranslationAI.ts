// Mock AI Translation Service
// Simulates machine translation with realistic delays and confidence scores

import { translations } from '@/i18n/translations';

export interface TranslationResult {
  translatedText: string;
  confidence: number;
  alternatives?: string[];
  detectedLanguage?: string;
}

// Simulate translation (in real implementation, this would call an AI API)
const mockTranslate = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<TranslationResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Check if we have an existing translation
  const existingTranslation = Object.entries(translations.en).find(
    ([, value]) => value === text
  );
  
  if (existingTranslation) {
    const [key] = existingTranslation;
    const targetTranslation = translations[targetLanguage]?.[key];
    if (targetTranslation) {
      return {
        translatedText: targetTranslation,
        confidence: 0.95,
        alternatives: [],
      };
    }
  }
  
  // For demo: create a mock translation by adding language-specific markers
  const markers: Record<string, { prefix: string; suffix: string }> = {
    fr: { prefix: '', suffix: ' (FR)' },
    es: { prefix: '', suffix: ' (ES)' },
    de: { prefix: '', suffix: ' (DE)' },
    pt: { prefix: '', suffix: ' (PT)' },
    it: { prefix: '', suffix: ' (IT)' },
    ja: { prefix: '【', suffix: '】' },
    zh: { prefix: '「', suffix: '」' },
    ar: { prefix: '', suffix: ' ←' },
    he: { prefix: '', suffix: ' ←' },
    fa: { prefix: '', suffix: ' ←' },
    ur: { prefix: '', suffix: ' ←' },
  };
  
  const marker = markers[targetLanguage] || { prefix: '', suffix: ` [${targetLanguage.toUpperCase()}]` };
  
  return {
    translatedText: `${marker.prefix}${text}${marker.suffix}`,
    confidence: 0.7 + Math.random() * 0.2,
    alternatives: [
      `${text} (alt 1)`,
      `${text} (alt 2)`,
    ],
  };
};

export const translateText = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<TranslationResult> => {
  if (sourceLanguage === targetLanguage) {
    return {
      translatedText: text,
      confidence: 1.0,
    };
  }
  
  return mockTranslate(text, sourceLanguage, targetLanguage);
};

export const translateBatch = async (
  texts: string[],
  sourceLanguage: string,
  targetLanguage: string,
  onProgress?: (completed: number, total: number) => void
): Promise<TranslationResult[]> => {
  const results: TranslationResult[] = [];
  
  for (let i = 0; i < texts.length; i++) {
    const result = await translateText(texts[i], sourceLanguage, targetLanguage);
    results.push(result);
    onProgress?.(i + 1, texts.length);
  }
  
  return results;
};

export const detectLanguage = async (text: string): Promise<{
  language: string;
  confidence: number;
}> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Simple detection based on character ranges
  if (/[\u4e00-\u9fff]/.test(text)) {
    return { language: 'zh', confidence: 0.9 };
  }
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
    return { language: 'ja', confidence: 0.9 };
  }
  if (/[\u0600-\u06ff]/.test(text)) {
    // Could be Arabic, Persian, or Urdu
    return { language: 'ar', confidence: 0.7 };
  }
  if (/[\u0590-\u05ff]/.test(text)) {
    return { language: 'he', confidence: 0.9 };
  }
  
  // Default to English
  return { language: 'en', confidence: 0.8 };
};

export const getSupportedLanguages = () => [
  'en', 'fr', 'es', 'de', 'pt', 'it', 'ja', 'zh', 'ar', 'he', 'fa', 'ur'
];
