export enum TranslationStatus {
  Untranslated = 'Untranslated',
  ManuallyTranslated = 'ManuallyTranslated',
  FuzzyMatch = 'FuzzyMatch',
  TMMatch = 'TMMatch',
  MachineTranslated = 'MachineTranslated',
  InReview = 'InReview',
  Approved = 'Approved',
}

export enum TranslationJobStatus {
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'vendor' | 'lpm' | 'translator';
    status: 'Active' | 'Invited';
    avatarUrl?: string;
    costPerWord?: number;
    agencyId?: string; // For translators, linking them to a vendor
}

export interface TranslationEntry {
  text: string;
  status: TranslationStatus;
  matchPercentage?: number;
  jobId?: string;
  matchedSource?: string;
}

export interface Translation {
  [langCode: string]: TranslationEntry;
}

export interface GlossaryTerm {
    id: string;
    sourceTerm: string;
    targetTerm: string;
    description: string;
}

export interface TMEntry {
  id: string;
  sourceText: string;
  targetText: string;
}

export interface TranslationJob {
  id: string;
  name: string;
  projectId: string;
  langCode: string;
  vendorId: string;
  translatorId?: string;
  termIds: string[];
  status: TranslationJobStatus;
  instructions?: string;
  createdAt: string;
  dueDate?: string;
}

export interface Term {
  id: string;
  key: string;
  sourceString: string;
  context: string;
  createdAt: string;
  translations: Translation;
}

export interface Language {
  name: string;
  code: string;
}

export interface Project {
  id:string;
  name: string;
  description: string;
  productGroup: string;
  sourceLanguage: Language;
  targetLanguages: Language[];
  terms: Term[];
  glossary: GlossaryTerm[];
  translationMemory: {
    [langCode: string]: TMEntry[];
  };
  createdAt: string;
}