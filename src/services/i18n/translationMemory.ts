// Translation Memory Service
// Stores and retrieves previous translations for fuzzy matching

import type { TranslationMemoryEntry } from '@/i18n/types';

// In-memory storage (in production, this would be a database)
let memoryStore: TranslationMemoryEntry[] = [];

// Levenshtein distance for similarity calculation
const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
};

// Calculate similarity percentage
export const calculateSimilarity = (source: string, target: string): number => {
  const normalizedSource = source.toLowerCase().trim();
  const normalizedTarget = target.toLowerCase().trim();
  
  if (normalizedSource === normalizedTarget) return 100;
  
  const distance = levenshteinDistance(normalizedSource, normalizedTarget);
  const maxLength = Math.max(normalizedSource.length, normalizedTarget.length);
  
  if (maxLength === 0) return 100;
  
  return Math.round((1 - distance / maxLength) * 100);
};

// Find matching translations from memory
export const findMatches = (
  sourceText: string,
  sourceLanguage: string,
  targetLanguage: string,
  minSimilarity: number = 70
): TranslationMemoryEntry[] => {
  const matches = memoryStore
    .filter(entry => 
      entry.sourceLanguage === sourceLanguage &&
      entry.targetLanguage === targetLanguage
    )
    .map(entry => ({
      ...entry,
      similarity: calculateSimilarity(sourceText, entry.sourceText),
    }))
    .filter(entry => entry.similarity! >= minSimilarity)
    .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
    .slice(0, 5);
  
  return matches;
};

// Add entry to translation memory
export const addEntry = (
  sourceText: string,
  sourceLanguage: string,
  targetText: string,
  targetLanguage: string
): TranslationMemoryEntry => {
  // Check for existing entry
  const existing = memoryStore.find(
    e => e.sourceText === sourceText &&
         e.sourceLanguage === sourceLanguage &&
         e.targetLanguage === targetLanguage
  );
  
  if (existing) {
    existing.targetText = targetText;
    existing.usageCount += 1;
    existing.lastUsedAt = new Date().toISOString();
    return existing;
  }
  
  const entry: TranslationMemoryEntry = {
    id: `tm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    sourceText,
    sourceLanguage,
    targetText,
    targetLanguage,
    usageCount: 1,
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
  };
  
  memoryStore.push(entry);
  return entry;
};

// Get all entries
export const getAllEntries = (): TranslationMemoryEntry[] => {
  return [...memoryStore];
};

// Clear all entries
export const clearMemory = (): void => {
  memoryStore = [];
};

// Export to TMX format
export const exportToTMX = (entries: TranslationMemoryEntry[]): string => {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE tmx SYSTEM "tmx14.dtd">
<tmx version="1.4">
  <header creationtool="BurnerMail" creationtoolversion="1.0" datatype="plaintext" segtype="sentence" adminlang="en" srclang="*all*"/>
  <body>`;
  
  const body = entries.map(entry => `
    <tu>
      <tuv xml:lang="${entry.sourceLanguage}">
        <seg>${escapeXml(entry.sourceText)}</seg>
      </tuv>
      <tuv xml:lang="${entry.targetLanguage}">
        <seg>${escapeXml(entry.targetText)}</seg>
      </tuv>
    </tu>`
  ).join('');
  
  const footer = `
  </body>
</tmx>`;
  
  return header + body + footer;
};

// Import from TMX format
export const importFromTMX = (tmxContent: string): number => {
  // Simple XML parsing (in production, use a proper XML parser)
  const tuMatches = tmxContent.match(/<tu>[\s\S]*?<\/tu>/g) || [];
  let imported = 0;
  
  tuMatches.forEach(tu => {
    const tuvMatches = tu.match(/<tuv[^>]*>[\s\S]*?<\/tuv>/g) || [];
    
    if (tuvMatches.length >= 2) {
      const extractLang = (tuv: string) => {
        const match = tuv.match(/xml:lang="([^"]+)"/);
        return match ? match[1] : '';
      };
      
      const extractText = (tuv: string) => {
        const match = tuv.match(/<seg>([\s\S]*?)<\/seg>/);
        return match ? unescapeXml(match[1]) : '';
      };
      
      const lang1 = extractLang(tuvMatches[0]);
      const text1 = extractText(tuvMatches[0]);
      const lang2 = extractLang(tuvMatches[1]);
      const text2 = extractText(tuvMatches[1]);
      
      if (lang1 && text1 && lang2 && text2) {
        addEntry(text1, lang1, text2, lang2);
        imported++;
      }
    }
  });
  
  return imported;
};

const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const unescapeXml = (text: string): string => {
  return text
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
};

// Initialize with some sample data
export const initializeSampleData = () => {
  const samples = [
    { source: 'Save', sourceLang: 'en', target: 'Enregistrer', targetLang: 'fr' },
    { source: 'Cancel', sourceLang: 'en', target: 'Annuler', targetLang: 'fr' },
    { source: 'Delete', sourceLang: 'en', target: 'Supprimer', targetLang: 'fr' },
    { source: 'Save', sourceLang: 'en', target: 'Guardar', targetLang: 'es' },
    { source: 'Cancel', sourceLang: 'en', target: 'Cancelar', targetLang: 'es' },
    { source: 'Save changes', sourceLang: 'en', target: 'Enregistrer les modifications', targetLang: 'fr' },
    { source: 'Save changes', sourceLang: 'en', target: 'Guardar cambios', targetLang: 'es' },
  ];
  
  samples.forEach(s => addEntry(s.source, s.sourceLang, s.target, s.targetLang));
};

// Initialize sample data on load
initializeSampleData();
