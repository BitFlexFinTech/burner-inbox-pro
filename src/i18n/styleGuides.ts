// Style guides for all 12 supported languages

import type { LanguageCode } from './languages';

export interface StyleGuideRules {
  formality: 'formal' | 'informal' | 'neutral';
  formalityNotes: string;
  punctuation: {
    rule: string;
    example: string;
  }[];
  capitalization: {
    rule: string;
    example: string;
  }[];
  dateFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    example: string;
  };
  doList: string[];
  dontList: string[];
  exampleTranslations: {
    original: string;
    good: string;
    bad: string;
    explanation: string;
  }[];
}

export const styleGuides: Record<string, StyleGuideRules> = {
  en: {
    formality: 'neutral',
    formalityNotes: 'Use a friendly, professional tone. Avoid overly casual slang but keep it accessible.',
    punctuation: [
      { rule: 'Use Oxford comma in lists', example: 'apples, oranges, and bananas' },
      { rule: 'Use double quotes for quotations', example: '"Hello, World!"' },
      { rule: 'Period inside quotation marks', example: 'She said "hello."' },
    ],
    capitalization: [
      { rule: 'Title Case for headings', example: 'Welcome to Your Dashboard' },
      { rule: 'Sentence case for body text', example: 'Create a new inbox to get started.' },
      { rule: 'Capitalize brand names', example: 'BurnerMail, Gmail, Outlook' },
    ],
    dateFormat: 'MM/DD/YYYY or Month DD, YYYY',
    numberFormat: { decimal: '.', thousands: ',', example: '1,234.56' },
    doList: [
      'Use active voice',
      'Keep sentences concise',
      'Address the user directly with "you"',
      'Use contractions naturally (you\'re, it\'s)',
    ],
    dontList: [
      'Don\'t use jargon without explanation',
      'Avoid double negatives',
      'Don\'t use all caps for emphasis',
    ],
    exampleTranslations: [
      {
        original: 'Click the button to continue',
        good: 'Click Continue to proceed',
        bad: 'CLICK HERE NOW!!!',
        explanation: 'Keep CTAs clear and calm, no aggressive capitalization',
      },
    ],
  },
  
  fr: {
    formality: 'formal',
    formalityNotes: 'Use "vous" (formal you) for all user-facing text. Avoid tutoyement unless specifically for youth marketing.',
    punctuation: [
      { rule: 'Space before : ; ! ?', example: 'Bonjour ! Comment allez-vous ?' },
      { rule: 'Guillemets for quotes', example: '« Bonjour »' },
      { rule: 'No Oxford comma', example: 'pommes, oranges et bananes' },
    ],
    capitalization: [
      { rule: 'Only first word capitalized in titles', example: 'Bienvenue sur votre tableau de bord' },
      { rule: 'Days and months lowercase', example: 'lundi, janvier' },
      { rule: 'Languages lowercase', example: 'français, anglais' },
    ],
    dateFormat: 'DD/MM/YYYY or DD mois YYYY',
    numberFormat: { decimal: ',', thousands: ' ', example: '1 234,56' },
    doList: [
      'Use "vous" consistently',
      'Include accents on capitals (É, È, À)',
      'Use non-breaking space before punctuation',
    ],
    dontList: [
      'Don\'t mix tu/vous forms',
      'Avoid anglicisms when French alternatives exist',
      'Don\'t omit accents',
    ],
    exampleTranslations: [
      {
        original: 'Your inbox is ready',
        good: 'Votre boîte de réception est prête',
        bad: 'Ta boîte de réception est prête',
        explanation: 'Use formal "votre" not informal "ta"',
      },
    ],
  },

  es: {
    formality: 'formal',
    formalityNotes: 'Use "usted" form for formal contexts. Consider regional variations (Spain vs Latin America).',
    punctuation: [
      { rule: 'Inverted punctuation at start', example: '¿Cómo estás? ¡Hola!' },
      { rule: 'Quotes use comillas angulares', example: '«Hola»' },
    ],
    capitalization: [
      { rule: 'Only first word capitalized in titles', example: 'Bienvenido a su panel' },
      { rule: 'Days, months, languages lowercase', example: 'lunes, enero, español' },
    ],
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimal: ',', thousands: '.', example: '1.234,56' },
    doList: [
      'Include opening ¿ and ¡',
      'Use accent marks correctly',
      'Consider Latin American variants for broader reach',
    ],
    dontList: [
      'Don\'t omit inverted punctuation',
      'Avoid Spain-specific terms for international audience',
    ],
    exampleTranslations: [
      {
        original: 'Delete inbox?',
        good: '¿Eliminar bandeja de entrada?',
        bad: 'Eliminar bandeja de entrada?',
        explanation: 'Always include inverted question mark',
      },
    ],
  },

  de: {
    formality: 'formal',
    formalityNotes: 'Use "Sie" (formal you) and capitalize it. German UI tends to be formal.',
    punctuation: [
      { rule: 'Quotes use „ and "', example: '„Hallo"' },
      { rule: 'Decimal comma, period for thousands', example: '1.234,56' },
    ],
    capitalization: [
      { rule: 'Capitalize all nouns', example: 'Ihre E-Mail-Adresse' },
      { rule: 'Capitalize Sie (formal you)', example: 'Wie können wir Ihnen helfen?' },
    ],
    dateFormat: 'DD.MM.YYYY',
    numberFormat: { decimal: ',', thousands: '.', example: '1.234,56' },
    doList: [
      'Capitalize all nouns',
      'Use Sie consistently',
      'Keep compound words as single words',
    ],
    dontList: [
      'Don\'t use du/Sie inconsistently',
      'Avoid unnecessary anglicisms',
      'Don\'t separate compound nouns',
    ],
    exampleTranslations: [
      {
        original: 'email address',
        good: 'E-Mail-Adresse',
        bad: 'e-mail adresse',
        explanation: 'Nouns capitalized, hyphenated compound',
      },
    ],
  },

  pt: {
    formality: 'neutral',
    formalityNotes: 'Brazilian Portuguese uses more informal "você", European Portuguese prefers formal treatment.',
    punctuation: [
      { rule: 'Standard punctuation, no inverted marks', example: 'Como você está?' },
      { rule: 'Quotes use aspas', example: '"Olá"' },
    ],
    capitalization: [
      { rule: 'Similar to Spanish - minimal capitalization', example: 'Bem-vindo ao seu painel' },
    ],
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimal: ',', thousands: '.', example: '1.234,56' },
    doList: [
      'Include accents (ã, õ, ç)',
      'Specify Brazilian vs European variants if needed',
    ],
    dontList: [
      'Don\'t omit accents and cedilla',
      'Avoid mixing Brazilian and European spellings',
    ],
    exampleTranslations: [
      {
        original: 'Settings',
        good: 'Configurações',
        bad: 'Configuracoes',
        explanation: 'Include tilde on ões ending',
      },
    ],
  },

  it: {
    formality: 'formal',
    formalityNotes: 'Use "Lei" (formal you, capitalized) for professional contexts.',
    punctuation: [
      { rule: 'Standard European punctuation', example: 'Buongiorno! Come sta?' },
      { rule: 'Quotes use virgolette', example: '«Ciao»' },
    ],
    capitalization: [
      { rule: 'Minimal capitalization', example: 'Benvenuto nella tua casella di posta' },
    ],
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimal: ',', thousands: '.', example: '1.234,56' },
    doList: [
      'Use accents correctly (è, é, à, ì, ò, ù)',
      'Maintain formal register with Lei',
    ],
    dontList: [
      'Don\'t use apostrophe instead of accent',
      'Avoid mixing formal/informal registers',
    ],
    exampleTranslations: [
      {
        original: 'Your email',
        good: 'La Sua email',
        bad: 'La tua email',
        explanation: 'Use formal "Sua" not informal "tua"',
      },
    ],
  },

  ja: {
    formality: 'formal',
    formalityNotes: 'Use polite form (です/ます) consistently. Avoid overly casual forms.',
    punctuation: [
      { rule: 'Use Japanese punctuation', example: '。and 、' },
      { rule: 'Japanese quotes', example: '「こんにちは」' },
    ],
    capitalization: [
      { rule: 'N/A - no case distinction', example: '' },
    ],
    dateFormat: 'YYYY年MM月DD日',
    numberFormat: { decimal: '.', thousands: ',', example: '1,234.56' },
    doList: [
      'Use polite form (です/ます)',
      'Include appropriate particles',
      'Use Katakana for foreign words appropriately',
    ],
    dontList: [
      'Don\'t use casual だ/する endings',
      'Avoid excessive Katakana for words with Japanese equivalents',
    ],
    exampleTranslations: [
      {
        original: 'Welcome',
        good: 'ようこそ',
        bad: 'ウェルカム',
        explanation: 'Use Japanese word, not Katakana transliteration of English',
      },
    ],
  },

  zh: {
    formality: 'formal',
    formalityNotes: 'Use formal second-person "您" for respectful address. Simplified Chinese for mainland audience.',
    punctuation: [
      { rule: 'Use Chinese punctuation', example: '。，！？' },
      { rule: 'Chinese quotes', example: '"你好"' },
    ],
    capitalization: [
      { rule: 'N/A - no case distinction', example: '' },
    ],
    dateFormat: 'YYYY年MM月DD日',
    numberFormat: { decimal: '.', thousands: ',', example: '1,234.56' },
    doList: [
      'Use 您 for formal address',
      'Keep sentences concise',
      'Use Simplified Chinese characters',
    ],
    dontList: [
      'Don\'t mix Simplified and Traditional characters',
      'Avoid literal translations of idioms',
    ],
    exampleTranslations: [
      {
        original: 'Your inbox',
        good: '您的收件箱',
        bad: '你的inbox',
        explanation: 'Use formal 您 and Chinese term for inbox',
      },
    ],
  },

  ar: {
    formality: 'formal',
    formalityNotes: 'Use Modern Standard Arabic (MSA) for broad accessibility. Formal address preferred.',
    punctuation: [
      { rule: 'Arabic punctuation marks', example: '؟ ، ؛' },
      { rule: 'Text flows right-to-left', example: 'مرحباً بك' },
    ],
    capitalization: [
      { rule: 'N/A - no case distinction', example: '' },
    ],
    dateFormat: 'DD/MM/YYYY or Arabic numerals',
    numberFormat: { decimal: '٫', thousands: '٬', example: '١٬٢٣٤٫٥٦ or 1,234.56' },
    doList: [
      'Use MSA for professional content',
      'Ensure proper RTL formatting',
      'Consider Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩)',
    ],
    dontList: [
      'Don\'t mix dialects',
      'Avoid left-to-right embedded text issues',
    ],
    exampleTranslations: [
      {
        original: 'Create Inbox',
        good: 'إنشاء صندوق بريد',
        bad: 'Create صندوق بريد',
        explanation: 'Translate action words, don\'t mix languages',
      },
    ],
  },

  he: {
    formality: 'neutral',
    formalityNotes: 'Modern Hebrew is generally less formal. Use natural, conversational tone.',
    punctuation: [
      { rule: 'Standard punctuation, reversed for RTL', example: '!שלום' },
    ],
    capitalization: [
      { rule: 'N/A - no case distinction', example: '' },
    ],
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimal: '.', thousands: ',', example: '1,234.56' },
    doList: [
      'Ensure proper RTL rendering',
      'Use modern Hebrew vocabulary',
    ],
    dontList: [
      'Don\'t use overly biblical language for UI',
      'Avoid RTL/LTR mixing issues',
    ],
    exampleTranslations: [
      {
        original: 'Dashboard',
        good: 'לוח בקרה',
        bad: 'דשבורד',
        explanation: 'Use Hebrew term, not transliteration',
      },
    ],
  },

  fa: {
    formality: 'formal',
    formalityNotes: 'Persian uses formal pronouns. Use "شما" (formal you) consistently.',
    punctuation: [
      { rule: 'Persian punctuation', example: '؟ ، ؛' },
      { rule: 'Right-to-left text', example: 'سلام' },
    ],
    capitalization: [
      { rule: 'N/A - no case distinction', example: '' },
    ],
    dateFormat: 'YYYY/MM/DD (Solar Hijri)',
    numberFormat: { decimal: '٫', thousands: '٬', example: '۱٬۲۳۴٫۵۶' },
    doList: [
      'Use Persian numerals (۰۱۲۳۴۵۶۷۸۹)',
      'Ensure RTL formatting',
      'Use formal شما',
    ],
    dontList: [
      'Don\'t mix Arabic and Persian vocabulary incorrectly',
      'Avoid transliterations when Persian words exist',
    ],
    exampleTranslations: [
      {
        original: 'Email',
        good: 'ایمیل or پست الکترونیک',
        bad: 'email',
        explanation: 'Use Persian script',
      },
    ],
  },

  ur: {
    formality: 'formal',
    formalityNotes: 'Urdu is typically formal. Use "آپ" (formal you) consistently.',
    punctuation: [
      { rule: 'Urdu punctuation similar to Arabic/Persian', example: '؟ ، ؛' },
      { rule: 'Right-to-left script', example: 'خوش آمدید' },
    ],
    capitalization: [
      { rule: 'N/A - no case distinction', example: '' },
    ],
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimal: '.', thousands: ',', example: '1,234.56' },
    doList: [
      'Use Nastaliq style font when possible',
      'Ensure proper RTL formatting',
      'Use formal آپ',
    ],
    dontList: [
      'Don\'t use Hindi vocabulary for Urdu text',
      'Avoid mixing scripts',
    ],
    exampleTranslations: [
      {
        original: 'Welcome',
        good: 'خوش آمدید',
        bad: 'ویلکم',
        explanation: 'Use proper Urdu phrase, not transliteration',
      },
    ],
  },
};

export const getStyleGuide = (languageCode: string): StyleGuideRules | undefined => {
  return styleGuides[languageCode];
};
