// Types for translation system

export type WorkflowStatus = 'draft' | 'pending_review' | 'in_review' | 'approved' | 'rejected' | 'published';

export interface TranslationOverride {
  id: string;
  key: string;
  language: string;
  value: string;
  originalValue?: string;
  status: WorkflowStatus;
  qualityScore?: number;
  qualityIssues?: QualityIssue[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  reviewedBy?: string;
  reviewNote?: string;
  isAutoTranslated?: boolean;
  version: number;
}

export interface TranslationVersion {
  id: string;
  translationId: string;
  versionNumber: number;
  value: string;
  status: WorkflowStatus;
  createdAt: string;
  createdBy: string;
  changeReason?: string;
}

export interface QualityIssue {
  type: 'placeholder_missing' | 'placeholder_extra' | 'too_long' | 'too_short' | 'untranslated' | 'punctuation' | 'html_mismatch' | 'whitespace';
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
}

export type QualityGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface TranslationMemoryEntry {
  id: string;
  sourceText: string;
  sourceLanguage: string;
  targetText: string;
  targetLanguage: string;
  similarity?: number;
  usageCount: number;
  createdAt: string;
  lastUsedAt: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category?: string;
  translations: Record<string, GlossaryTranslation>;
  createdAt: string;
  updatedAt: string;
}

export interface GlossaryTranslation {
  approved: string;
  alternatives?: string[];
  forbidden?: string[];
  notes?: string;
}

export interface ContributorProfile {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  points: number;
  badges: Badge[];
  languages: string[];
  submissionCount: number;
  approvedCount: number;
  rejectedCount: number;
  rank?: number;
  joinedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface TranslationSubmission {
  id: string;
  key: string;
  language: string;
  value: string;
  contributorId: string;
  status: 'pending' | 'approved' | 'rejected';
  votes: number;
  upvoters: string[];
  downvoters: string[];
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface LanguageStyleGuide {
  language: string;
  formality: 'formal' | 'informal' | 'neutral';
  addressForm: string;
  punctuationRules: string[];
  capitalizationRules: string[];
  numberFormat: string;
  dateFormat: string;
  examples: {
    original: string;
    good: string;
    bad: string;
    explanation: string;
  }[];
  notes: string[];
}

export interface WorkflowNotification {
  id: string;
  type: 'submission_received' | 'translation_approved' | 'translation_rejected' | 'review_requested' | 'changes_requested' | 'published' | 'level_up' | 'badge_earned';
  recipientId: string;
  translationId?: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Contributor levels and badges
export const CONTRIBUTOR_LEVELS = [
  { level: 1, name: 'Novice', pointsRequired: 0, color: 'gray' },
  { level: 2, name: 'Contributor', pointsRequired: 100, color: 'green' },
  { level: 3, name: 'Translator', pointsRequired: 500, color: 'blue' },
  { level: 4, name: 'Expert', pointsRequired: 1500, color: 'purple' },
  { level: 5, name: 'Master', pointsRequired: 5000, color: 'gold' },
] as const;

export const BADGES = [
  { id: 'first_translation', name: 'First Steps', description: 'Submit your first translation', icon: '🎯' },
  { id: 'ten_approved', name: 'Rising Star', description: 'Get 10 translations approved', icon: '⭐' },
  { id: 'fifty_approved', name: 'Wordsmith', description: 'Get 50 translations approved', icon: '✍️' },
  { id: 'hundred_approved', name: 'Language Master', description: 'Get 100 translations approved', icon: '👑' },
  { id: 'multilingual', name: 'Polyglot', description: 'Contribute to 3+ languages', icon: '🌍' },
  { id: 'quality_champion', name: 'Quality Champion', description: 'Maintain 95%+ approval rate', icon: '💎' },
  { id: 'helpful_voter', name: 'Community Voice', description: 'Vote on 50+ translations', icon: '🗳️' },
] as const;
