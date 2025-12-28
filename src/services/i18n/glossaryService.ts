// Glossary Management Service
// Ensures consistent translation of key terms

import type { GlossaryTerm, GlossaryTranslation } from '@/i18n/types';

// In-memory glossary storage
let glossaryStore: GlossaryTerm[] = [];

// Core terms that should be consistently translated
const coreTerms: Omit<GlossaryTerm, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    term: 'inbox',
    definition: 'A disposable email inbox for receiving emails',
    category: 'Core',
    translations: {
      fr: { approved: 'boîte de réception', forbidden: ['inbox', 'courrier'] },
      es: { approved: 'buzón', forbidden: ['inbox', 'casilla'] },
      de: { approved: 'Posteingang', forbidden: ['inbox'] },
      ar: { approved: 'البريد الوارد', forbidden: [] },
      he: { approved: 'תיבת דואר', forbidden: [] },
    },
  },
  {
    term: 'verification code',
    definition: 'A code sent to verify user identity',
    category: 'Authentication',
    translations: {
      fr: { approved: 'code de vérification', forbidden: ['code secret'] },
      es: { approved: 'código de verificación', forbidden: ['código secreto'] },
      de: { approved: 'Bestätigungscode', forbidden: ['Geheimcode'] },
      ar: { approved: 'رمز التحقق', forbidden: [] },
      he: { approved: 'קוד אימות', forbidden: [] },
    },
  },
  {
    term: 'burner email',
    definition: 'A temporary/disposable email address',
    category: 'Core',
    translations: {
      fr: { approved: 'email jetable', alternatives: ['email temporaire'], forbidden: ['email brûleur'] },
      es: { approved: 'email desechable', alternatives: ['email temporal'], forbidden: ['email quemador'] },
      de: { approved: 'Wegwerf-E-Mail', alternatives: ['temporäre E-Mail'], forbidden: ['Brenner-E-Mail'] },
      ar: { approved: 'بريد مؤقت', forbidden: [] },
      he: { approved: 'דואר זמני', forbidden: [] },
    },
  },
  {
    term: 'dashboard',
    definition: 'The main control panel of the application',
    category: 'UI',
    translations: {
      fr: { approved: 'tableau de bord', forbidden: ['dashboard'] },
      es: { approved: 'panel de control', alternatives: ['tablero'], forbidden: ['dashboard'] },
      de: { approved: 'Dashboard', notes: 'Can keep English term' },
      ar: { approved: 'لوحة التحكم', forbidden: [] },
      he: { approved: 'לוח בקרה', forbidden: [] },
    },
  },
  {
    term: 'expiry',
    definition: 'When an inbox or email expires',
    category: 'Core',
    translations: {
      fr: { approved: 'expiration', forbidden: ['péremption'] },
      es: { approved: 'expiración', alternatives: ['vencimiento'], forbidden: [] },
      de: { approved: 'Ablauf', alternatives: ['Gültigkeit'], forbidden: [] },
      ar: { approved: 'انتهاء الصلاحية', forbidden: [] },
      he: { approved: 'תפוגה', forbidden: [] },
    },
  },
  {
    term: 'forwarding',
    definition: 'Email forwarding to real email address',
    category: 'Feature',
    translations: {
      fr: { approved: 'transfert', alternatives: ['redirection'], forbidden: ['forwarding'] },
      es: { approved: 'reenvío', forbidden: ['forwarding'] },
      de: { approved: 'Weiterleitung', forbidden: ['Forwarding'] },
      ar: { approved: 'إعادة التوجيه', forbidden: [] },
      he: { approved: 'העברה', forbidden: [] },
    },
  },
  {
    term: 'tag',
    definition: 'Label for organizing inboxes',
    category: 'Feature',
    translations: {
      fr: { approved: 'tag', alternatives: ['étiquette'], notes: 'Tag is acceptable in French' },
      es: { approved: 'etiqueta', forbidden: ['tag'] },
      de: { approved: 'Tag', alternatives: ['Schlagwort'], notes: 'Tag is acceptable in German' },
      ar: { approved: 'وسم', forbidden: [] },
      he: { approved: 'תגית', forbidden: [] },
    },
  },
];

// Initialize with core terms
export const initializeGlossary = () => {
  const now = new Date().toISOString();
  glossaryStore = coreTerms.map((term, index) => ({
    ...term,
    id: `term_${index + 1}`,
    createdAt: now,
    updatedAt: now,
  }));
};

// Get all terms
export const getAllTerms = (): GlossaryTerm[] => {
  return [...glossaryStore];
};

// Get term by ID
export const getTermById = (id: string): GlossaryTerm | undefined => {
  return glossaryStore.find(t => t.id === id);
};

// Search terms
export const searchTerms = (query: string): GlossaryTerm[] => {
  const lowerQuery = query.toLowerCase();
  return glossaryStore.filter(
    t => t.term.toLowerCase().includes(lowerQuery) ||
         t.definition.toLowerCase().includes(lowerQuery)
  );
};

// Add new term
export const addTerm = (term: Omit<GlossaryTerm, 'id' | 'createdAt' | 'updatedAt'>): GlossaryTerm => {
  const now = new Date().toISOString();
  const newTerm: GlossaryTerm = {
    ...term,
    id: `term_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  glossaryStore.push(newTerm);
  return newTerm;
};

// Update term
export const updateTerm = (id: string, updates: Partial<GlossaryTerm>): GlossaryTerm | undefined => {
  const index = glossaryStore.findIndex(t => t.id === id);
  if (index === -1) return undefined;
  
  glossaryStore[index] = {
    ...glossaryStore[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  return glossaryStore[index];
};

// Delete term
export const deleteTerm = (id: string): boolean => {
  const index = glossaryStore.findIndex(t => t.id === id);
  if (index === -1) return false;
  
  glossaryStore.splice(index, 1);
  return true;
};

// Check translation against glossary
export interface GlossaryViolation {
  term: GlossaryTerm;
  issue: 'missing' | 'forbidden' | 'inconsistent';
  found?: string;
  expected: string;
}

export const checkTranslation = (
  text: string,
  language: string
): GlossaryViolation[] => {
  const violations: GlossaryViolation[] = [];
  const lowerText = text.toLowerCase();
  
  glossaryStore.forEach(term => {
    const translation = term.translations[language];
    if (!translation) return;
    
    // Check if forbidden term is used
    translation.forbidden?.forEach(forbidden => {
      if (lowerText.includes(forbidden.toLowerCase())) {
        violations.push({
          term,
          issue: 'forbidden',
          found: forbidden,
          expected: translation.approved,
        });
      }
    });
  });
  
  return violations;
};

// Get approved translation for a term
export const getApprovedTranslation = (
  termText: string,
  language: string
): string | undefined => {
  const term = glossaryStore.find(
    t => t.term.toLowerCase() === termText.toLowerCase()
  );
  
  return term?.translations[language]?.approved;
};

// Get terms by category
export const getTermsByCategory = (category: string): GlossaryTerm[] => {
  return glossaryStore.filter(t => t.category === category);
};

// Get all categories
export const getAllCategories = (): string[] => {
  const categories = new Set(glossaryStore.map(t => t.category).filter(Boolean));
  return Array.from(categories) as string[];
};

// Export glossary
export const exportGlossary = (): string => {
  return JSON.stringify(glossaryStore, null, 2);
};

// Import glossary
export const importGlossary = (json: string): number => {
  try {
    const terms = JSON.parse(json) as GlossaryTerm[];
    let imported = 0;
    
    terms.forEach(term => {
      const existing = glossaryStore.find(t => t.term === term.term);
      if (!existing) {
        glossaryStore.push(term);
        imported++;
      }
    });
    
    return imported;
  } catch {
    return 0;
  }
};

// Initialize glossary on load
initializeGlossary();
