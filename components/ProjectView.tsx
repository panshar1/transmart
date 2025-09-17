import React, { useState, useMemo, useEffect } from 'react';
import type { Project, Term, GlossaryTerm, TMEntry, TranslationEntry, User, TranslationJob } from '../types';
import { TranslationStatus, TranslationJobStatus } from '../types';
import Modal from './Modal';
import { ChevronLeftIcon, PlusIcon, TrashIcon, SparklesIcon, SpinnerIcon, CheckIcon, UploadIcon, DownloadIcon, BookOpenIcon, SearchIcon, DatabaseIcon, BriefcaseIcon } from './Icons';
import * as XLSX from 'xlsx';

const LANGUAGES: { name: string; code: string }[] = [
    { name: 'Afrikaans', code: 'af' }, { name: 'Albanian', code: 'sq' }, { name: 'Amharic', code: 'am' },
    { name: 'Arabic', code: 'ar' }, { name: 'Armenian', code: 'hy' }, { name: 'Azerbaijani', code: 'az' },
    { name: 'Basque', code: 'eu' }, { name: 'Belarusian', code: 'be' }, { name: 'Bengali', code: 'bn' },
    { name: 'Bosnian', code: 'bs' }, { name: 'Bulgarian', code: 'bg' }, { name: 'Catalan', code: 'ca' },
    { name: 'Cebuano', code: 'ceb' }, { name: 'Chinese (Simplified)', code: 'zh-CN' },
    { name: 'Chinese (Traditional)', code: 'zh-TW' }, { name: 'Corsican', code: 'co' },
    { name: 'Croatian', code: 'hr' }, { name: 'Czech', code: 'cs' }, { name: 'Danish', code: 'da' },
    { name: 'Dutch', code: 'nl' }, { name: 'English', code: 'en' }, { name: 'Esperanto', code: 'eo' },
    { name: 'Estonian', code: 'et' }, { name: 'Finnish', code: 'fi' }, { name: 'French', code: 'fr' },
    { name: 'Frisian', code: 'fy' }, { name: 'Galician', code: 'gl' }, { name: 'Georgian', code: 'ka' },
    { name: 'German', code: 'de' }, { name: 'Greek', code: 'el' }, { name: 'Gujarati', code: 'gu' },
    { name: 'Haitian Creole', code: 'ht' }, { name: 'Hausa', code: 'ha' }, { name: 'Hawaiian', code: 'haw' },
    { name: 'Hebrew', code: 'he' }, { name: 'Hindi', code: 'hi' }, { name: 'Hmong', code: 'hmn' },
    { name: 'Hungarian', code: 'hu' }, { name: 'Icelandic', code: 'is' }, { name: 'Igbo', code: 'ig' },
    { name: 'Indonesian', code: 'id' }, { name: 'Irish', code: 'ga' }, { name: 'Italian', code: 'it' },
    { name: 'Japanese', code: 'ja' }, { name: 'Javanese', code: 'jw' }, { name: 'Kannada', code: 'kn' },
    { name: 'Kazakh', code: 'kk' }, { name: 'Khmer', code: 'km' }, { name: 'Korean', code: 'ko' },
    { name: 'Kurdish', code: 'ku' }, { name: 'Kyrgyz', code: 'ky' }, { name: 'Lao', code: 'lo' },
    { name: 'Latin', code: 'la' }, { name: 'Latvian', code: 'lv' }, { name: 'Lithuanian', code: 'lt' },
    { name: 'Luxembourgish', code: 'lb' }, { name: 'Macedonian', code: 'mk' }, { name: 'Malagasy', code: 'mg' },
    { name: 'Malay', code: 'ms' }, { name: 'Malayalam', code: 'ml' }, { name: 'Maltese', code: 'mt' },
    { name: 'Maori', code: 'mi' }, { name: 'Marathi', code: 'mr' }, { name: 'Mongolian', code: 'mn' },
    { name: 'Myanmar (Burmese)', code: 'my' }, { name: 'Nepali', code: 'ne' }, { name: 'Norwegian', code: 'no' },
    { name: 'Nyanja (Chichewa)', code: 'ny' }, { name: 'Pashto', code: 'ps' }, { name: 'Persian', code: 'fa' },
    { name: 'Polish', code: 'pl' }, { name: 'Portuguese', code: 'pt' }, { name: 'Punjabi', code: 'pa' },
    { name: 'Romanian', code: 'ro' }, { name: 'Russian', code: 'ru' }, { name: 'Samoan', code: 'sm' },
    { name: 'Scots Gaelic', code: 'gd' }, { name: 'Serbian', code: 'sr' }, { name: 'Sesotho', code: 'st' },
    { name: 'Shona', code: 'sn' }, { name: 'Sindhi', code: 'sd' }, { name: 'Sinhala (Sinhalese)', code: 'si' },
    { name: 'Slovak', code: 'sk' }, { name: 'Slovenian', code: 'sl' }, { name: 'Somali', code: 'so' },
    { name: 'Spanish', code: 'es' }, { name: 'Sundanese', code: 'su' }, { name: 'Swahili', code: 'sw' },
    { name: 'Swedish', code: 'sv' }, { name: 'Tagalog (Filipino)', code: 'tl' }, { name: 'Tajik', code: 'tg' },
    { name: 'Tamil', code: 'ta' }, { name: 'Telugu', code: 'te' }, { name: 'Thai', code: 'th' },
    { name: 'Turkish', code: 'tr' }, { name: 'Ukrainian', code: 'uk' }, { name: 'Urdu', code: 'ur' },
    { name: 'Uzbek', code: 'uz' }, { name: 'Vietnamese', code: 'vi' }, { name: 'Welsh', code: 'cy' },
    { name: 'Xhosa', code: 'xh' }, { name: 'Yiddish', code: 'yi' }, { name: 'Yoruba', code: 'yo' },
    { name: 'Zulu', code: 'zu' },
];

interface ProjectViewProps {
  project: Project;
  users: User[];
  translationJobs: TranslationJob[];
  onBack: () => void;
  onAddLanguage: (projectId: string, name: string, code: string) => void;
  onDeleteLanguage: (projectId: string, langCode: string) => void;
  onAddTerm: (projectId: string, key: string, sourceString: string, context: string) => void;
  onUpdateTranslation: (projectId: string, termId: string, langCode: string, translation: string, status: TranslationStatus, matchPercentage?: number, matchedSource?: string) => void;
  onDeleteTerm: (projectId: string, termId: string) => void;
  onSuggestTranslation: (projectId: string, termId: string, langCode: string) => Promise<void>;
  onPreTranslate: (projectId: string, langCode: string) => Promise<{ tmCount: number, mtCount: number }>;
  onCreateTranslationJob: (jobDetails: Omit<TranslationJob, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateTranslationStatus: (projectId: string, termId: string, langCode: string, status: TranslationStatus) => void;
  onImportTranslations: (projectId: string, langCode: string, fileContent: string) => void;
  onImportSourceTerms: (projectId: string, fileContent: string) => void;
  onAddGlossaryTerm: (projectId: string, sourceTerm: string, targetTerm: string, description: string) => void;
  onDeleteGlossaryTerm: (projectId: string, termId: string) => void;
  onImportGlossary: (projectId: string, terms: Omit<GlossaryTerm, 'id'>[]) => void;
  onImportTM: (projectId: string, langCode: string, entries: Omit<TMEntry, 'id'>[]) => void;
}

const statusConfig: { [key in TranslationStatus]: { color: string; label: string, textColor: string } } = {
    [TranslationStatus.Untranslated]: { color: 'bg-red-100', label: 'Untranslated', textColor: 'text-red-800' },
    [TranslationStatus.ManuallyTranslated]: { color: 'bg-teal-100', label: 'Translated', textColor: 'text-teal-800' },
    [TranslationStatus.FuzzyMatch]: { color: 'bg-yellow-100', label: 'Fuzzy Match', textColor: 'text-yellow-800' },
    [TranslationStatus.TMMatch]: { color: 'bg-green-100', label: 'TM Match', textColor: 'text-green-800' },
    [TranslationStatus.MachineTranslated]: { color: 'bg-blue-100', label: 'MT', textColor: 'text-blue-800' },
    [TranslationStatus.InReview]: { color: 'bg-purple-100', label: 'In Review', textColor: 'text-purple-800' },
    [TranslationStatus.Approved]: { color: 'bg-gray-200', label: 'Approved', textColor: 'text-gray-800' },
};

const StatusIndicator: React.FC<{ status: TranslationStatus; percentage?: number, jobId?: string, jobs: TranslationJob[], matchedSource?: string }> = ({ status, percentage, jobId, jobs, matchedSource }) => {
    const isMatch = (status === TranslationStatus.TMMatch || status === TranslationStatus.FuzzyMatch) && typeof percentage === 'number';
    const label = isMatch ? `${percentage}% Match` : statusConfig[status].label;
    const job = jobId ? jobs.find(j => j.id === jobId) : null;
    
    let tooltip = null;
    if (job && status === TranslationStatus.InReview) {
        const hasMatchInfo = (typeof percentage === 'number') && matchedSource;
        tooltip = (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                <p className="font-bold border-b border-gray-600 pb-1 mb-1">Job: {job.name}</p>
                {job.dueDate && <p>Due: {new Date(job.dueDate).toLocaleDateString()}</p>}
                {hasMatchInfo && (
                    <div className="pt-1 mt-1 border-t border-gray-600">
                        <p className="font-semibold">Original Match ({percentage}%)</p>
                        <p className="italic">"{matchedSource}"</p>
                    </div>
                )}
            </div>
        );
    } else if (isMatch && matchedSource) {
        tooltip = (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                <p className="font-bold border-b border-gray-600 pb-1 mb-1">Matched Source ({percentage}%)</p>
                <p className="italic">"{matchedSource}"</p>
            </div>
        );
    }

    return (
        <div className="group relative flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusConfig[status].color} ${statusConfig[status].textColor}`}>
                {label}
            </span>
            {job && status === TranslationStatus.InReview && (
                <BriefcaseIcon className="w-4 h-4 text-gray-400" />
            )}
            {tooltip}
        </div>
    );
};


const levenshteinDistance = (a: string, b: string): number => {
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    if (an === 0) return bn;
    if (bn === 0) return an;
    const matrix = Array(an + 1);
    for (let i = 0; i <= an; i++) {
        matrix[i] = Array(bn + 1);
        matrix[i][0] = i;
    }
    for (let j = 0; j <= bn; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= an; i++) {
        for (let j = 1; j <= bn; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1, // deletion
                matrix[i][j - 1] + 1, // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }
    return matrix[an][bn];
};

const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = (str1 || '').trim().toLowerCase();
    const s2 = (str2 || '').trim().toLowerCase();
    const maxLength = Math.max(s1.length, s2.length);
    if (maxLength === 0) return 100;
    const distance = levenshteinDistance(s1, s2);
    return Math.round((1 - distance / maxLength) * 100);
};

const countWords = (str: string): number => {
    if (!str || typeof str !== 'string') return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
};


const ProjectView: React.FC<ProjectViewProps> = ({ 
    project, 
    users,
    translationJobs,
    onBack, 
    onAddLanguage, 
    onDeleteLanguage,
    onAddTerm, 
    onUpdateTranslation, 
    onDeleteTerm, 
    onSuggestTranslation,
    onPreTranslate,
    onCreateTranslationJob,
    onUpdateTranslationStatus,
    onImportTranslations,
    onImportSourceTerms,
    onAddGlossaryTerm,
    onDeleteGlossaryTerm,
    onImportGlossary,
    onImportTM
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'settings'>('terms');
  const [selectedLang, setSelectedLang] = useState<string>(project.targetLanguages[0]?.code || '');
  
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [newLangCode, setNewLangCode] = useState('');
  const [langSearch, setLangSearch] = useState('');

  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [termKey, setTermKey] = useState('');
  const [termSourceString, setTermSourceString] = useState('');
  const [termContext, setTermContext] = useState('');

  const [suggesting, setSuggesting] = useState<string | null>(null);
  const [isPreTranslating, setIsPreTranslating] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [importLang, setImportLang] = useState<string>(project.targetLanguages[0]?.code || '');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'translations' | 'terms' | 'tm'>('translations');
  const [exportLang, setExportLang] = useState<string>(project.targetLanguages[0]?.code || '');

  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);
  const [glossarySource, setGlossarySource] = useState('');
  const [glossaryTarget, setGlossaryTarget] = useState('');
  const [glossaryDesc, setGlossaryDesc] = useState('');
  const [glossaryFile, setGlossaryFile] = useState<File | null>(null);

  const [focusedTermId, setFocusedTermId] = useState<string | null>(null);
  const [tmSuggestions, setTmSuggestions] = useState<{source: string, target: string, similarity: number}[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<TranslationStatus[]>([]);

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobSelection, setJobSelection] = useState<Record<string, boolean>>({});
  const [jobName, setJobName] = useState('');
  const [jobDueDate, setJobDueDate] = useState('');
  const [jobInstructions, setJobInstructions] = useState('');
  const [showJobCreatedPopup, setShowJobCreatedPopup] = useState(false);
  
  const vendors = useMemo(() => users.filter(u => u.role === 'vendor'), [users]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>(vendors[0]?.id || '');

  const availableLanguages = useMemo(() => {
    const existingLangCodes = new Set([
        project.sourceLanguage.code,
        ...project.targetLanguages.map(l => l.code)
    ]);
    return LANGUAGES.filter(lang => !existingLangCodes.has(lang.code));
  }, [project.sourceLanguage, project.targetLanguages]);

  const filteredAvailableLanguages = useMemo(() => {
      if (!langSearch) return availableLanguages;
      const lowercasedQuery = langSearch.toLowerCase();
      return availableLanguages.filter(lang => 
          lang.name.toLowerCase().includes(lowercasedQuery) || 
          lang.code.toLowerCase().includes(lowercasedQuery)
      );
  }, [availableLanguages, langSearch]);
  
  useEffect(() => {
    if (filteredAvailableLanguages.length > 0) {
        setNewLangCode(filteredAvailableLanguages[0].code);
    } else {
        setNewLangCode('');
    }
  }, [filteredAvailableLanguages]);

  const termsForJobCreation = useMemo(() => {
    if (!selectedLang) return [];
    const reviewableStatuses = [
        TranslationStatus.ManuallyTranslated,
        TranslationStatus.FuzzyMatch,
        TranslationStatus.TMMatch,
        TranslationStatus.MachineTranslated,
    ];
    return project.terms.filter(term => {
        const status = term.translations[selectedLang]?.status;
        return status && reviewableStatuses.includes(status);
    });
  }, [project.terms, selectedLang]);

  const jobSummary = useMemo(() => {
    const selectedIds = Object.keys(jobSelection).filter(id => jobSelection[id]);
    const selectedTerms = project.terms.filter(term => selectedIds.includes(term.id));
    
    const totalWords = selectedTerms.reduce((sum, term) => {
        const translationText = term.translations[selectedLang]?.text || '';
        return sum + countWords(translationText);
    }, 0);

    return {
        count: selectedIds.length,
        totalWords: totalWords
    };
  }, [jobSelection, project.terms, selectedLang]);

  const handleStatusFilterChange = (status: TranslationStatus) => {
    setStatusFilters(prev =>
        prev.includes(status)
            ? prev.filter(s => s !== status)
            : [...prev, status]
    );
  };

  const filterableStatuses = Object.values(TranslationStatus).filter(
    status => status !== TranslationStatus.FuzzyMatch && status !== TranslationStatus.TMMatch
  );

  const filteredTerms = useMemo(() => {
    let terms = project.terms;

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        terms = terms.filter(term =>
            term.key.toLowerCase().includes(lowercasedQuery) ||
            term.sourceString.toLowerCase().includes(lowercasedQuery)
        );
    }

    if (statusFilters.length > 0) {
        const effectiveFilters = new Set(statusFilters);

        // If 'Translated' filter is on, expand it to include TM and Fuzzy matches
        if (statusFilters.includes(TranslationStatus.ManuallyTranslated)) {
            effectiveFilters.add(TranslationStatus.FuzzyMatch);
            effectiveFilters.add(TranslationStatus.TMMatch);
        }

        terms = terms.filter(term => {
            const translationStatus = term.translations[selectedLang]?.status || TranslationStatus.Untranslated;
            return effectiveFilters.has(translationStatus);
        });
    }

    return terms;
  }, [project.terms, searchQuery, statusFilters, selectedLang]);


  const handleInputFocus = (term: Term) => {
    setFocusedTermId(term.id);
    if (!selectedLang || term.translations[selectedLang]?.text) {
        setTmSuggestions([]);
        return;
    }

    const projectTm = project.terms
      .filter(t => t.id !== term.id && t.translations[selectedLang]?.status === TranslationStatus.Approved && t.translations[selectedLang].text)
      .map(t => ({
        source: t.sourceString,
        target: t.translations[selectedLang].text,
      }));

    const importedTm = (project.translationMemory?.[selectedLang] || []).map(entry => ({
        source: entry.sourceText,
        target: entry.targetText,
    }));
    
    const allTmEntries = [...projectTm, ...importedTm];
    if (allTmEntries.length === 0) return;

    const suggestions = allTmEntries
      .map(entry => ({
        ...entry,
        similarity: calculateSimilarity(term.sourceString, entry.source),
      }))
      .filter(s => s.similarity >= 50)
      .sort((a, b) => b.similarity - a.similarity);
    
    const uniqueSuggestions = suggestions.reduce((acc: typeof suggestions, current) => {
        if (!acc.find(item => item.target === current.target)) {
            acc.push(current);
        }
        return acc;
    }, []);

    setTmSuggestions(uniqueSuggestions.slice(0, 3));
  };

  const languageStats = useMemo(() => {
    return project.targetLanguages.map(lang => {
      if (project.terms.length === 0) return { ...lang, approved: 0, inReview: 0, translated: 0 };
      
      const statusCounts = project.terms.reduce((acc, term) => {
        const status = term.translations[lang.code]?.status || TranslationStatus.Untranslated;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<TranslationStatus, number>);

      const total = project.terms.length;
      const approved = Math.round(((statusCounts[TranslationStatus.Approved] || 0) / total) * 100);
      const inReview = Math.round(((statusCounts[TranslationStatus.InReview] || 0) / total) * 100);
      
      const translatedCount = (statusCounts[TranslationStatus.ManuallyTranslated] || 0) + 
                              (statusCounts[TranslationStatus.TMMatch] || 0) +
                              (statusCounts[TranslationStatus.FuzzyMatch] || 0) +
                              (statusCounts[TranslationStatus.MachineTranslated] || 0);

      const translated = Math.round((translatedCount / total) * 100);
      
      return { ...lang, approved, inReview, translated };
    });
  }, [project.terms, project.targetLanguages]);

  const handleOpenLangModal = () => {
    setLangSearch('');
    setIsLangModalOpen(true);
  };

  const handleAddLanguage = () => {
    if (newLangCode) {
      const langInfo = LANGUAGES.find(l => l.code === newLangCode);
      if (langInfo) {
        onAddLanguage(project.id, langInfo.name, langInfo.code);
        if (!selectedLang) setSelectedLang(langInfo.code);
        setIsLangModalOpen(false);
      }
    }
  };

  const handleDeleteLanguageClick = (langCode: string, langName: string) => {
    if (window.confirm(`Are you sure you want to remove the '${langName}' language and all its associated translations? This action cannot be undone.`)) {
        onDeleteLanguage(project.id, langCode);

        if (selectedLang === langCode) {
            const newTargetLangs = project.targetLanguages.filter(l => l.code !== langCode);
            setSelectedLang(newTargetLangs[0]?.code || '');
        }
    }
  };

  const handleAddTerm = () => {
    if (termKey.trim() && termSourceString.trim()) {
      onAddTerm(project.id, termKey, termSourceString, termContext);
      setTermKey('');
      setTermSourceString('');
      setTermContext('');
      setIsTermModalOpen(false);
    }
  };

  const handleAddGlossary = () => {
    if(glossarySource.trim() && glossaryTarget.trim()) {
        onAddGlossaryTerm(project.id, glossarySource, glossaryTarget, glossaryDesc);
        setGlossarySource('');
        setGlossaryTarget('');
        setGlossaryDesc('');
    }
  }

  const handleSuggest = async (termId: string, langCode: string) => {
    const suggestionKey = `${termId}-${langCode}`;
    if (suggesting) return;
    setSuggesting(suggestionKey);
    try {
        await onSuggestTranslation(project.id, termId, langCode);
    } catch (error) {
        console.error("Failed to get translation suggestion:", error);
        alert('Could not get translation suggestion. Please check the console for details.');
    } finally {
        setSuggesting(null);
    }
  };

  const handlePreTranslate = async () => {
    if (isPreTranslating || !selectedLang) return;

    const untranslatedCount = project.terms.filter(t => !t.translations[selectedLang] || t.translations[selectedLang].status === TranslationStatus.Untranslated).length;
    if (untranslatedCount === 0) {
        alert(`All terms for this language are already translated or in review/approved.`);
        return;
    }
    
    const langName = project.targetLanguages.find(l => l.code === selectedLang)?.name || selectedLang;

    if (window.confirm(`This will pre-translate all ${untranslatedCount} untranslated terms for ${langName} using Translation Memory first, then Machine Translation for the rest. Do you want to continue?`)) {
        setIsPreTranslating(true);
        try {
            const { tmCount, mtCount } = await onPreTranslate(project.id, selectedLang);
            alert(`Pre-translation complete. Applied TM to ${tmCount} terms and MT to ${mtCount} terms.`);
        } catch (error) {
            console.error("Failed to pre-translate:", error);
            alert("An error occurred during pre-translation. Please check the console.");
        } finally {
            setIsPreTranslating(false);
        }
    }
  };

  const openCreateJobModal = () => {
    if (!selectedLang) {
        alert("Please select a language first.");
        return;
    }
    const initialSelection: Record<string, boolean> = {};
    termsForJobCreation.forEach(term => {
        initialSelection[term.id] = true;
    });
    setJobSelection(initialSelection);
    setJobName('');
    setJobDueDate('');
    setJobInstructions('');
    setIsJobModalOpen(true);
  };
  
  const handleCreateJob = () => {
      const selectedTermIds = Object.keys(jobSelection).filter(id => jobSelection[id]);
      if (selectedTermIds.length > 0 && selectedVendorId && jobName.trim()) {
          onCreateTranslationJob({
              name: jobName.trim(),
              projectId: project.id,
              langCode: selectedLang,
              vendorId: selectedVendorId,
              termIds: selectedTermIds,
              dueDate: jobDueDate || undefined,
              instructions: jobInstructions.trim() || undefined,
          });
          setShowJobCreatedPopup(true);
          setTimeout(() => setShowJobCreatedPopup(false), 3000);
      }
      setIsJobModalOpen(false);
      setJobSelection({});
  };


  const handleImportTranslations = () => {
    if (!importFile || !importLang) {
        alert("Please select a language and a file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
            try {
                onImportTranslations(project.id, importLang, content);
                setIsImportModalOpen(false);
                setImportFile(null);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Please check the file format.';
                alert(`Failed to import translations: ${message}`);
                console.error(error);
            }
        }
    };
    reader.readAsText(importFile);
  };

  const handleImportTerms = () => {
    if (!importFile) {
        alert("Please select a file.");
        return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
            try {
                onImportSourceTerms(project.id, content);
                setIsImportModalOpen(false);
                setImportFile(null);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Please check the file format.';
                alert(`Failed to import source terms: ${message}`);
                console.error(error);
            }
        }
    };
    reader.readAsText(importFile);
  };
  
  const handleImportTM = () => {
    if (!importFile || !importLang) {
      alert("Please select a language and a file.");
      return;
    }
    const reader = new FileReader();
    const fileName = importFile.name.toLowerCase();

    const processData = (data: any[]) => {
      const newEntries: Omit<TMEntry, 'id'>[] = data.map((row: any) => ({
        sourceText: String(row['Source Text'] || '').trim(),
        targetText: String(row['Target Text'] || '').trim(),
      })).filter(entry => entry.sourceText && entry.targetText);

      if (newEntries.length > 0) {
        onImportTM(project.id, importLang, newEntries);
        setIsImportModalOpen(false);
        setImportFile(null);
      } else {
        alert("No valid TM entries found in the file. Ensure you have 'Source Text' and 'Target Text' columns.");
      }
    };

    if (fileName.endsWith('.csv')) {
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
          if (lines.length < 2) throw new Error("CSV must have a header and at least one data row.");
          
          const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
          const sourceIndex = header.indexOf('source text');
          const targetIndex = header.indexOf('target text');
          if (sourceIndex === -1 || targetIndex === -1) throw new Error("CSV must contain 'Source Text' and 'Target Text' columns.");

          const jsonData = lines.slice(1).map(line => {
            const values = line.split(',');
            return {
              'Source Text': (values[sourceIndex] || '').trim().replace(/"/g, ''),
              'Target Text': (values[targetIndex] || '').trim().replace(/"/g, ''),
            };
          });
          processData(jsonData);
        } catch (error) {
          console.error("Error parsing CSV:", error);
          alert(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };
      reader.readAsText(importFile);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          processData(json);
        } catch (error) {
          console.error("Error parsing Excel:", error);
          alert("Failed to parse Excel file.");
        }
      };
      reader.readAsArrayBuffer(importFile);
    } else {
      alert("Unsupported file type. Please upload a CSV or Excel file.");
    }
  };


  const handleGlossaryImport = () => {
    if (!glossaryFile) {
      alert("Please select an Excel or CSV file.");
      return;
    }

    const reader = new FileReader();
    const fileName = glossaryFile.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                if (!text) {
                    alert("File is empty or could not be read.");
                    return;
                }
                const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
                
                if (lines.length < 2) {
                    alert("CSV file must have a header and at least one data row.");
                    return;
                }

                const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
                
                let sourceIndex = -1;
                let targetIndex = -1;
                let descIndex = -1;

                const standardSourceIndex = header.indexOf('source term');
                const standardTargetIndex = header.indexOf('target term');

                if (standardSourceIndex !== -1 && standardTargetIndex !== -1) {
                    sourceIndex = standardSourceIndex;
                    targetIndex = standardTargetIndex;
                    descIndex = header.indexOf('description');
                } else {
                    const projectSourceLangCode = project.sourceLanguage.code.toLowerCase();
                    const selectedTargetLangCode = selectedLang.toLowerCase();
                    const langCodeSourceIndex = header.indexOf(projectSourceLangCode);
                    const langCodeTargetIndex = header.indexOf(selectedTargetLangCode);

                    if (langCodeSourceIndex !== -1 && langCodeTargetIndex !== -1) {
                        sourceIndex = langCodeSourceIndex;
                        targetIndex = langCodeTargetIndex;
                    }
                }

                if (sourceIndex === -1 || targetIndex === -1) {
                    alert(`CSV format not recognized. Please use headers 'Source Term' & 'Target Term', or language codes matching project source ('${project.sourceLanguage.code}') and selected language ('${selectedLang}').`);
                    return;
                }

                const newTerms: Omit<GlossaryTerm, 'id'>[] = lines.slice(1).map(line => {
                    const values = line.split(',');
                    const sourceTerm = (values[sourceIndex] || '').trim().replace(/"/g, '');
                    const targetTerm = (values[targetIndex] || '').trim().replace(/"/g, '');
                    const description = descIndex > -1 ? (values[descIndex] || '').trim().replace(/"/g, '') : '';
                    return { sourceTerm, targetTerm, description };
                }).filter(term => term.sourceTerm && term.targetTerm);
                
                if (newTerms.length > 0) {
                    onImportGlossary(project.id, newTerms);
                    setGlossaryFile(null);
                } else {
                    alert("No valid glossary terms found in the file.");
                }

            } catch (error) {
                console.error("Error parsing CSV file:", error);
                alert("Failed to parse the CSV file. Please ensure it's a valid format.");
            }
        };
        reader.readAsText(glossaryFile);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            const newTerms: Omit<GlossaryTerm, 'id'>[] = json.map((row: any) => ({
              sourceTerm: String(row['Source Term'] || row[project.sourceLanguage.code] || '').trim(),
              targetTerm: String(row['Target Term'] || row[selectedLang] || '').trim(),
              description: String(row['Description'] || '').trim(),
            })).filter(term => term.sourceTerm && term.targetTerm);

            if (newTerms.length > 0) {
                onImportGlossary(project.id, newTerms);
                setGlossaryFile(null);
            } else {
                alert("No valid glossary terms found in the file. Ensure you have 'Source Term'/'Target Term' or matching language code columns.");
            }
          } catch (error) {
            console.error("Error parsing Excel file:", error);
            alert("Failed to parse the Excel file. Please ensure it's a valid format.");
          }
        };
        reader.readAsArrayBuffer(glossaryFile);
    } else {
        alert("Unsupported file type. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.");
    }
  };

  const handleExport = () => {
    if (!exportLang) {
        alert("Please select a language to export.");
        return;
    }
    const translations: Record<string, string> = {};
    project.terms.forEach(term => {
        const translationText = term.translations[exportLang]?.text;
        if (translationText) {
            translations[term.key] = translationText;
        }
    });

    const jsonString = JSON.stringify(translations, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}-${exportLang}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  };

  const highlightGlossaryTerms = (text: string) => {
    if (!project.glossary || project.glossary.length === 0) {
        return text;
    }
    const parts = text.split(new RegExp(`(${project.glossary.map(g => g.sourceTerm).join('|')})`, 'gi'));
    return parts.map((part, index) => {
        const glossaryMatch = project.glossary.find(g => g.sourceTerm.toLowerCase() === part.toLowerCase());
        if (glossaryMatch) {
            return (
                <strong key={index} className="bg-yellow-200 rounded px-1 py-0.5" title={`Glossary: ${glossaryMatch.targetTerm}`}>
                    {part}
                </strong>
            );
        }
        return part;
    });
  };

  return (
    <div className="p-8 text-slate-800">
      {showJobCreatedPopup && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg z-50 flex items-center gap-3">
          <CheckIcon className="w-6 h-6" />
          <span>Translation Job has been created and assigned.</span>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-accent mb-2 font-medium">
            <ChevronLeftIcon className="w-5 h-5" />
            All Projects
          </button>
          <h1 className="text-2xl font-bold text-primary">{project.name}</h1>
          <p className="text-gray-600">{project.description}</p>
        </div>
         <div className="flex items-center gap-2">
            <button onClick={() => setIsGlossaryModalOpen(true)} className="flex items-center gap-2 bg-white hover:bg-gray-100 border border-border-color text-gray-700 font-bold py-2 px-3 rounded-lg text-sm transition-colors">
                <BookOpenIcon className="w-4 h-4" />
                Glossary
            </button>
            <button onClick={handleOpenLangModal} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors">
                <PlusIcon className="w-4 h-4" />
                Add Language
            </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-border-color">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Languages & Progress</h2>
          <div className="space-y-4">
              {languageStats.length > 0 ? languageStats.map(lang => (
                  <div key={lang.code}>
                      <div className="flex justify-between items-center mb-1 text-sm font-medium text-gray-700">
                          <div className="flex items-center gap-2">
                            <span>{lang.name} ({lang.code})</span>
                            <button onClick={() => handleDeleteLanguageClick(lang.code, lang.name)} className="text-gray-400 hover:text-red-500 transition-colors" title={`Remove ${lang.name}`}>
                                <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="font-semibold">{lang.approved}% Approved</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 flex overflow-hidden">
                        <div className="bg-gray-800 h-2.5" title={`${lang.approved}% Approved`} style={{ width: `${lang.approved}%` }}></div>
                        <div className="bg-purple-500 h-2.5" title={`${lang.inReview}% In Review`} style={{ width: `${lang.inReview}%` }}></div>
                        <div className="bg-teal-500 h-2.5" title={`${lang.translated}% Translated`} style={{ width: `${lang.translated}%` }}></div>
                      </div>
                  </div>
              )) : <p className="text-gray-500 text-center py-4">No target languages added yet.</p>}
          </div>
      </div>

      <div className="border-b border-border-color">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {project.targetLanguages.map((lang) => (
            <button
                key={lang.code}
                onClick={() => {
                    setSelectedLang(lang.code);
                    setTmSuggestions([]);
                    setFocusedTermId(null);
                }}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base transition-colors ${
                selectedLang === lang.code
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                {lang.name}
            </button>
            ))}
        </nav>
       </div>

      <div className="bg-white rounded-lg shadow-sm border border-border-color mt-6">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-color gap-4">
            <h2 className="text-xl font-bold text-gray-900">Strings</h2>
            <div className="flex items-center gap-2">
                 <button
                    onClick={openCreateJobModal}
                    disabled={termsForJobCreation.length === 0 || !selectedLang}
                    className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <BriefcaseIcon className="w-5 h-5" />
                    Request Translation
                </button>
            </div>
        </div>
        <div className="p-4 flex justify-between items-center border-b border-border-color bg-header-bg">
             <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-600">Filter:</span>
                {filterableStatuses.map(status => (
                    <button
                        key={status}
                        onClick={() => handleStatusFilterChange(status)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors border ${
                            statusFilters.includes(status)
                                ? `${statusConfig[status].color.replace('bg-', 'bg-').replace('100', '300')} ${statusConfig[status].textColor} border-transparent`
                                : 'bg-white text-gray-700 hover:bg-gray-100 border-border-color'
                        }`}
                        aria-pressed={statusFilters.includes(status)}
                    >
                        {statusConfig[status].label}
                    </button>
                ))}
                {statusFilters.length > 0 && (
                    <button onClick={() => setStatusFilters([])} className="text-xs text-red-500 hover:underline font-medium">
                        Clear
                    </button>
                )}
            </div>
            <div className="relative w-full md:w-1/3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search strings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white text-gray-800 p-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
                    aria-label="Search terms"
                />
            </div>
        </div>
        
        <div className="p-4 border-b border-border-color flex justify-between items-center">
             <div className="flex items-center gap-2">
                <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 bg-white hover:bg-gray-100 border border-border-color text-gray-700 font-bold py-2 px-3 rounded-lg text-sm">
                    <UploadIcon className="w-4 h-4" /> Import
                </button>
                <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 bg-white hover:bg-gray-100 border border-border-color text-gray-700 font-bold py-2 px-3 rounded-lg text-sm">
                    <DownloadIcon className="w-4 h-4" /> Export
                </button>
                <button onClick={() => setIsTermModalOpen(true)} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-3 rounded-lg text-sm">
                    <PlusIcon className="w-4 h-4" /> Add String
                </button>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handlePreTranslate}
                    disabled={isPreTranslating || !selectedLang}
                    className="flex items-center gap-2 bg-white hover:bg-gray-100 border border-border-color text-gray-700 font-bold py-2 px-3 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-wait"
                >
                    {isPreTranslating ? <SpinnerIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                    {isPreTranslating ? 'Translating...' : 'Pre-translate'}
                </button>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-color">
            <thead className="bg-header-bg">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">Source ({project.sourceLanguage.code})</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                    Translation ({selectedLang || 'select language'})
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border-color">
              {filteredTerms.length > 0 && selectedLang ? (
                filteredTerms.map((term, index) => {
                  const translationEntry = term.translations[selectedLang];
                  const status = translationEntry?.status || TranslationStatus.Untranslated;
                  const text = translationEntry?.text || '';
                  const isLocked = status === TranslationStatus.InReview || status === TranslationStatus.Approved;

                  return (
                      <tr key={term.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 align-top">
                            <div className="text-sm font-medium text-gray-900 mb-1">{highlightGlossaryTerms(term.sourceString)}</div>
                            <div className="text-xs text-gray-500 mb-2">{highlightGlossaryTerms(term.context)}</div>
                            <div className="text-xs text-gray-400 font-mono">KEY: {term.key}</div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="relative">
                              <div className="flex items-center gap-2">
                                  <textarea
                                    rows={1}
                                    value={text}
                                    onChange={(e) => {
                                      const newText = e.target.value;
                                      const newStatus = newText.trim() ? TranslationStatus.ManuallyTranslated : TranslationStatus.Untranslated;
                                      onUpdateTranslation(project.id, term.id, selectedLang, newText, newStatus);
                                    }}
                                    onFocus={() => handleInputFocus(term)}
                                    onBlur={() => { setTimeout(() => setFocusedTermId(null), 150); }}
                                    readOnly={isLocked}
                                    className={`w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent resize-none ${isLocked ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                    placeholder="Translate here..."
                                  />
                                  {!isLocked && (
                                      <button 
                                          onClick={() => handleSuggest(term.id, selectedLang)} 
                                          disabled={!!suggesting}
                                          className="p-2 bg-accent hover:bg-accent-hover rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                          aria-label="Suggest Translation"
                                          title="Suggest Translation"
                                      >
                                          {suggesting === `${term.id}-${selectedLang}` ? (
                                              <SpinnerIcon className="w-5 h-5 text-white" />
                                          ) : (
                                              <SparklesIcon className="w-5 h-5 text-white" />
                                          )}
                                      </button>
                                  )}
                                  {status === TranslationStatus.InReview && (
                                      <div className="flex gap-1">
                                          <button onClick={() => onUpdateTranslationStatus(project.id, term.id, selectedLang, TranslationStatus.Approved)} className="p-2 bg-green-500 hover:bg-green-600 rounded-md transition-colors" title="Approve">
                                              <CheckIcon className="w-5 h-5 text-white" />
                                          </button>
                                      </div>
                                  )}
                              </div>
                               {focusedTermId === term.id && tmSuggestions.length > 0 && (
                                  <div className="absolute top-full mt-1 w-full max-w-md bg-white rounded-lg shadow-lg border border-border-color z-10 p-2 space-y-1">
                                      <h4 className="text-xs font-bold text-gray-500 px-2 pt-1">Suggestions from Translation Memory</h4>
                                      {tmSuggestions.map((suggestion, index) => (
                                          <div key={index} 
                                               className="p-2 rounded-md text-sm cursor-pointer hover:bg-violet-50"
                                               onMouseDown={(e) => e.preventDefault()}
                                               onClick={() => {
                                                  const newStatus = suggestion.similarity === 100 ? TranslationStatus.TMMatch : TranslationStatus.FuzzyMatch;
                                                  onUpdateTranslation(project.id, term.id, selectedLang, suggestion.target, newStatus, suggestion.similarity, suggestion.source);
                                                  setTmSuggestions([]);
                                                  setFocusedTermId(null);
                                              }}>
                                              <div className="flex justify-between items-center mb-1">
                                                  <p className="text-gray-500 text-xs italic truncate" title={suggestion.source}>
                                                      "{suggestion.source}"
                                                  </p>
                                                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full shrink-0 ml-2">{suggestion.similarity}%</span>
                                              </div>
                                              <p className="text-gray-900 font-semibold">{suggestion.target}</p>
                                          </div>
                                      ))}
                                  </div>
                               )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap align-top">
                          <StatusIndicator status={status} percentage={translationEntry?.matchPercentage} jobId={translationEntry?.jobId} jobs={translationJobs} matchedSource={translationEntry?.matchedSource} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                          <button onClick={() => onDeleteTerm(project.id, term.id)} className="text-gray-400 hover:text-red-500">
                              <TrashIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                  );
                })
              ) : (
                <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-500">
                        {project.terms.length === 0 ? 'No terms have been added to this project yet.' : !selectedLang ? 'Please select a language tab above to view translations.' : 'No terms match your search or filter criteria.'}
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} title="Add New Language">
        <div className="space-y-4">
            {availableLanguages.length > 0 ? (
                <>
                    <div>
                        <label htmlFor="language-search" className="block text-sm font-medium text-gray-700 mb-1">Search Language</label>
                        <input
                            type="text"
                            id="language-search"
                            value={langSearch}
                            onChange={(e) => setLangSearch(e.target.value)}
                            placeholder="e.g., French, fr"
                            className="w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto border rounded-md">
                        {filteredAvailableLanguages.length > 0 ? filteredAvailableLanguages.map(lang => (
                            <div
                                key={lang.code}
                                onClick={() => setNewLangCode(lang.code)}
                                className={`p-2 cursor-pointer hover:bg-blue-50 transition-colors ${newLangCode === lang.code ? 'bg-blue-100 text-accent font-semibold' : ''}`}
                            >
                                {lang.name} ({lang.code})
                            </div>
                        )) : <p className="text-sm text-gray-500 text-center p-4">No matching languages found.</p>}
                    </div>
                </>
            ) : (
                <p className="text-gray-500 text-center py-4">All available languages have been added to this project.</p>
            )}
            <button
                onClick={handleAddLanguage}
                disabled={!newLangCode}
                className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
                Add Language
            </button>
        </div>
      </Modal>

      <Modal isOpen={isTermModalOpen} onClose={() => setIsTermModalOpen(false)} title="Add New String">
        <div className="space-y-4">
          <input type="text" value={termKey} onChange={(e) => setTermKey(e.target.value)} placeholder="Unique Key (e.g., welcome_message)" className="w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent" />
          <textarea value={termSourceString} onChange={(e) => setTermSourceString(e.target.value)} placeholder="Source String (in English)" className="w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
          <textarea value={termContext} onChange={(e) => setTermContext(e.target.value)} placeholder="Context / Description (Optional)" className="w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
          <button onClick={handleAddTerm} className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">Add String</button>
        </div>
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Data">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Import Type</label>
            <select value={importType} onChange={(e) => setImportType(e.target.value as any)} className="w-full bg-gray-100 p-2 rounded-md border border-gray-300">
              <option value="translations">Translations (JSON)</option>
              <option value="terms">Source Terms (JSON)</option>
              <option value="tm">Translation Memory (CSV/XLSX)</option>
            </select>
          </div>
          {(importType === 'translations' || importType === 'tm') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select value={importLang} onChange={(e) => setImportLang(e.target.value)} className="w-full bg-gray-100 p-2 rounded-md border border-gray-300">
                {project.targetLanguages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input type="file" onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-accent hover:file:bg-blue-100" />
          </div>
          <button onClick={importType === 'translations' ? handleImportTranslations : importType === 'terms' ? handleImportTerms : handleImportTM} className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg">Import</button>
        </div>
      </Modal>
      
      <Modal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} title="Export Translations">
        <div className="space-y-4">
          <div>
            <label htmlFor="export-lang" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select id="export-lang" value={exportLang} onChange={(e) => setExportLang(e.target.value)} className="w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent">
              {project.targetLanguages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          <button onClick={handleExport} className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors">Export as JSON</button>
        </div>
      </Modal>

      <Modal isOpen={isGlossaryModalOpen} onClose={() => setIsGlossaryModalOpen(false)} title="Glossary">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Add New Term</h3>
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                <input type="text" value={glossarySource} onChange={e => setGlossarySource(e.target.value)} placeholder="Source Term" className="w-full bg-white p-2 rounded-md border"/>
                <input type="text" value={glossaryTarget} onChange={e => setGlossaryTarget(e.target.value)} placeholder="Target Term" className="w-full bg-white p-2 rounded-md border"/>
                <textarea value={glossaryDesc} onChange={e => setGlossaryDesc(e.target.value)} placeholder="Description (optional)" className="w-full bg-white p-2 rounded-md border h-16 resize-none"/>
                <button onClick={handleAddGlossary} className="w-full bg-accent text-white py-2 rounded-lg">Add Term</button>
            </div>
          </div>
          <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Import from File</h3>
              <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                  <p className="text-xs text-gray-500">Upload an Excel (.xlsx, .xls) or CSV file with columns 'Source Term', 'Target Term', 'Description' or with language codes as headers.</p>
                  <input type="file" accept=".csv, .xlsx, .xls" onChange={e => setGlossaryFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-accent hover:file:bg-blue-100"/>
                  <button onClick={handleGlossaryImport} className="w-full bg-accent text-white py-2 rounded-lg">Import Glossary</button>
              </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Current Terms</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {project.glossary.length > 0 ? project.glossary.map(term => (
                <div key={term.id} className="p-2 bg-white rounded-md border flex justify-between items-start">
                  <div>
                    <p><span className="font-bold">{term.sourceTerm}</span> → <span className="font-semibold">{term.targetTerm}</span></p>
                    <p className="text-xs text-gray-600">{term.description}</p>
                  </div>
                  <button onClick={() => onDeleteGlossaryTerm(project.id, term.id)} className="text-gray-400 hover:text-red-500 shrink-0 ml-2"><TrashIcon className="w-4 h-4"/></button>
                </div>
              )) : <p className="text-gray-500 text-center py-4">No glossary terms yet.</p>}
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} title="Create Translation Job">
        <div className="space-y-4">
            <input type="text" value={jobName} onChange={e => setJobName(e.target.value)} placeholder="Job Name" className="w-full bg-gray-100 p-2 rounded-md border" />
            <div>
                <label className="block text-sm font-medium">Assign Vendor</label>
                <select value={selectedVendorId} onChange={e => setSelectedVendorId(e.target.value)} className="w-full bg-gray-100 p-2 rounded-md border">
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium">Due Date (Optional)</label>
                <input type="date" value={jobDueDate} onChange={e => setJobDueDate(e.target.value)} className="w-full bg-gray-100 p-2 rounded-md border" />
            </div>
            <textarea value={jobInstructions} onChange={e => setJobInstructions(e.target.value)} placeholder="Instructions (Optional)" className="w-full bg-gray-100 p-2 rounded-md border h-20" />
            
            <div className="border-t pt-4">
                <h4 className="font-bold mb-2">Select Strings for this Job ({jobSummary.count} selected, {jobSummary.totalWords} words)</h4>
                <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
                    {termsForJobCreation.map(term => (
                        <div key={term.id} className="flex items-center gap-2 p-1 rounded hover:bg-gray-100">
                            <input type="checkbox" id={`job-term-${term.id}`} checked={!!jobSelection[term.id]} onChange={e => setJobSelection(prev => ({...prev, [term.id]: e.target.checked}))} />
                            <label htmlFor={`job-term-${term.id}`} className="text-sm truncate cursor-pointer flex-grow">{term.sourceString}</label>
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={handleCreateJob} className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg">Create Job</button>
        </div>
      </Modal>

    </div>
  );
};

export default ProjectView;
