// Translation Quality Checker Service
import type { QualityIssue, QualityGrade } from '@/i18n/types';

interface QualityCheckResult {
  score: number;
  grade: QualityGrade;
  issues: QualityIssue[];
  canPublish: boolean;
}

// Extract placeholders from text (e.g., {{name}}, {{count}})
const extractPlaceholders = (text: string): string[] => {
  const matches = text.match(/\{\{(\w+)\}\}/g) || [];
  return matches.map(m => m.replace(/\{\{|\}\}/g, ''));
};

// Check for HTML tags
const extractHtmlTags = (text: string): string[] => {
  const matches = text.match(/<\/?[a-z][a-z0-9]*[^>]*>/gi) || [];
  return matches;
};

// Calculate Levenshtein distance for similarity
const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix = Array(b.length + 1).fill(null).map(() => 
    Array(a.length + 1).fill(null)
  );
  
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  
  return matrix[b.length][a.length];
};

// Check if translation appears to be untranslated
const looksUntranslated = (source: string, target: string): boolean => {
  if (source === target) return true;
  
  const normalizedSource = source.toLowerCase().trim();
  const normalizedTarget = target.toLowerCase().trim();
  
  if (normalizedSource === normalizedTarget) return true;
  
  // Calculate similarity
  const distance = levenshteinDistance(normalizedSource, normalizedTarget);
  const maxLength = Math.max(source.length, target.length);
  const similarity = 1 - (distance / maxLength);
  
  return similarity > 0.95;
};

export const checkTranslationQuality = (
  sourceText: string,
  translatedText: string,
  targetLanguage: string
): QualityCheckResult => {
  const issues: QualityIssue[] = [];
  let score = 100;
  
  // 1. Check for missing placeholders
  const sourcePlaceholders = extractPlaceholders(sourceText);
  const targetPlaceholders = extractPlaceholders(translatedText);
  
  sourcePlaceholders.forEach(placeholder => {
    if (!targetPlaceholders.includes(placeholder)) {
      issues.push({
        type: 'placeholder_missing',
        severity: 'error',
        message: `Missing placeholder: {{${placeholder}}}`,
        details: 'Required placeholder from source text is missing',
      });
      score -= 25;
    }
  });
  
  // 2. Check for extra placeholders
  targetPlaceholders.forEach(placeholder => {
    if (!sourcePlaceholders.includes(placeholder)) {
      issues.push({
        type: 'placeholder_extra',
        severity: 'warning',
        message: `Extra placeholder: {{${placeholder}}}`,
        details: 'This placeholder does not exist in the source text',
      });
      score -= 10;
    }
  });
  
  // 3. Check length ratio
  const lengthRatio = translatedText.length / sourceText.length;
  if (lengthRatio > 2) {
    issues.push({
      type: 'too_long',
      severity: 'warning',
      message: 'Translation is significantly longer than source',
      details: `Translation is ${Math.round(lengthRatio * 100)}% of source length`,
    });
    score -= 10;
  } else if (lengthRatio < 0.3 && sourceText.length > 10) {
    issues.push({
      type: 'too_short',
      severity: 'warning',
      message: 'Translation is significantly shorter than source',
      details: `Translation is only ${Math.round(lengthRatio * 100)}% of source length`,
    });
    score -= 10;
  }
  
  // 4. Check for untranslated text
  if (looksUntranslated(sourceText, translatedText)) {
    issues.push({
      type: 'untranslated',
      severity: 'error',
      message: 'Text appears to be untranslated',
      details: 'The translation is identical or nearly identical to the source',
    });
    score -= 30;
  }
  
  // 5. Check HTML tag consistency
  const sourceHtml = extractHtmlTags(sourceText);
  const targetHtml = extractHtmlTags(translatedText);
  
  if (sourceHtml.length !== targetHtml.length) {
    issues.push({
      type: 'html_mismatch',
      severity: 'error',
      message: 'HTML tags mismatch',
      details: `Source has ${sourceHtml.length} tags, translation has ${targetHtml.length}`,
    });
    score -= 20;
  }
  
  // 6. Check leading/trailing whitespace
  if (translatedText !== translatedText.trim()) {
    issues.push({
      type: 'whitespace',
      severity: 'info',
      message: 'Extra whitespace detected',
      details: 'Translation has leading or trailing whitespace',
    });
    score -= 5;
  }
  
  // 7. Check punctuation at end (for sentences)
  if (sourceText.length > 20) {
    const sourcePunc = sourceText.slice(-1).match(/[.!?。！？]/);
    const targetPunc = translatedText.slice(-1).match(/[.!?。！？]/);
    
    if (sourcePunc && !targetPunc) {
      issues.push({
        type: 'punctuation',
        severity: 'warning',
        message: 'Missing ending punctuation',
        details: 'Source ends with punctuation but translation does not',
      });
      score -= 5;
    }
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  // Determine grade
  let grade: QualityGrade;
  if (score >= 90) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 40) grade = 'D';
  else grade = 'F';
  
  // Can publish if no errors
  const hasErrors = issues.some(i => i.severity === 'error');
  
  return {
    score,
    grade,
    issues,
    canPublish: !hasErrors && score >= 60,
  };
};

export const getGradeColor = (grade: QualityGrade): string => {
  switch (grade) {
    case 'A': return 'text-green-500';
    case 'B': return 'text-blue-500';
    case 'C': return 'text-yellow-500';
    case 'D': return 'text-orange-500';
    case 'F': return 'text-red-500';
    default: return 'text-muted-foreground';
  }
};

export const getGradeBgColor = (grade: QualityGrade): string => {
  switch (grade) {
    case 'A': return 'bg-green-500/10 border-green-500/30';
    case 'B': return 'bg-blue-500/10 border-blue-500/30';
    case 'C': return 'bg-yellow-500/10 border-yellow-500/30';
    case 'D': return 'bg-orange-500/10 border-orange-500/30';
    case 'F': return 'bg-red-500/10 border-red-500/30';
    default: return 'bg-muted';
  }
};
