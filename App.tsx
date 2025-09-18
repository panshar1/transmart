import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { Project, Term, GlossaryTerm, TMEntry, TranslationEntry, User, TranslationJob } from './types';
import { TranslationStatus, TranslationJobStatus } from './types';
import { UserIcon, UserGroupIcon, CurrencyDollarIcon, GitBranchIcon, ProjectIcon } from './components/Icons';
import ProjectList from './components/ProjectList';
import ProjectView from './components/ProjectView';
import LoginPage from './components/LoginPage';
import VendorDashboard from './components/VendorDashboard';
import UserManagement from './components/UserManagement';
import BudgetEstimator from './components/BudgetEstimator';
import Integrations from './components/Integrations';
import Dashboard from './components/Dashboard';

const initialUsers: User[] = [
    // Team Roles
    { id: 'user-kishore', email: 'kishore@example.com', name: 'Kishore', role: 'admin', status: 'Active', avatarUrl: `https://i.pravatar.cc/150?u=kishore` },
    { id: 'user-manohar', email: 'manohar@example.com', name: 'Manohar', role: 'lpm', status: 'Active', avatarUrl: `https://i.pravatar.cc/150?u=manohar` },
    
    // Vendor Agencies
    { id: 'vendor-depro', email: 'contact@depro.com', name: 'Depro™', role: 'vendor', status: 'Active', avatarUrl: `https://i.pravatar.cc/150?u=depro`, costPerWord: 0.12 },
    { id: 'vendor-pactera', email: 'contact@pactera.com', name: 'Pactera', role: 'vendor', status: 'Active', avatarUrl: `https://i.pravatar.cc/150?u=pactera`, costPerWord: 0.15 },
    { id: 'vendor-welocalize', email: 'contact@welocalize.com', name: 'Welocalize', role: 'vendor', status: 'Active', avatarUrl: `https://i.pravatar.cc/150?u=welocalize`, costPerWord: 0.14 },

    // Translators for Depro
    { id: 'translator-1-de', email: 'helga.s@depro.com', name: 'Helga Schmidt', role: 'translator', status: 'Active', agencyId: 'vendor-depro', avatarUrl: `https://i.pravatar.cc/150?u=helga` },
    { id: 'translator-1-fr', email: 'pierre.l@depro.com', name: 'Pierre Laurent', role: 'translator', status: 'Active', agencyId: 'vendor-depro', avatarUrl: `https://i.pravatar.cc/150?u=pierre` },
    
    // Translators for Pactera
    { id: 'translator-2-es', email: 'maria.g@pactera.com', name: 'Maria Garcia', role: 'translator', status: 'Active', agencyId: 'vendor-pactera', avatarUrl: `https://i.pravatar.cc/150?u=maria` },
    { id: 'translator-2-pt', email: 'joao.s@pactera.com', name: 'João Silva', role: 'translator', status: 'Invited', agencyId: 'vendor-pactera', avatarUrl: `https://i.pravatar.cc/150?u=joao` },
    
    // Translators for Welocalize
    { id: 'translator-3-ja', email: 'yuki.t@welocalize.com', name: 'Yuki Tanaka', role: 'translator', status: 'Active', agencyId: 'vendor-welocalize', avatarUrl: `https://i.pravatar.cc/150?u=yuki` },

    // Generic demo accounts
    { id: 'user-admin-demo', email: 'admin@example.com', name: 'Demo Admin', role: 'admin', status: 'Active', avatarUrl: `https://i.pravatar.cc/150?u=admin@example.com` },
    { id: 'user-vendor-demo', email: 'vendor@example.com', name: 'Demo Vendor', role: 'vendor', status: 'Active', avatarUrl: `https://i.pravatar.cc/150?u=vendor@example.com`, costPerWord: 0.10 },
    { id: 'user-translator-demo', email: 'translator@example.com', name: 'Demo Translator', role: 'translator', agencyId: 'user-vendor-demo', status: 'Active', avatarUrl: `https://i.pravatar.cc/150?u=translator@example.com` },
];


const initialJobs: TranslationJob[] = [
    {
        id: 'job-1',
        name: 'LRP Docs - French CTA',
        projectId: 'proj-1',
        langCode: 'fr',
        vendorId: 'vendor-depro',
        translatorId: 'translator-1-fr',
        termIds: ['term-cta'],
        status: TranslationJobStatus.InProgress,
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Please review the call-to-action button text for the French documentation portal. Ensure it is concise and compelling.'
    },
    {
        id: 'job-2',
        name: 'LRP Docs - German Copyright',
        projectId: 'proj-1',
        langCode: 'de',
        vendorId: 'vendor-depro',
        translatorId: 'translator-1-de',
        termIds: ['term-copyright'],
        status: TranslationJobStatus.InProgress,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'job-3',
        name: 'SMAX Login Button (DE)',
        projectId: 'proj-2',
        langCode: 'de',
        vendorId: 'vendor-depro',
        termIds: ['term-3'],
        status: TranslationJobStatus.InProgress,
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'job-4',
        name: 'ValueEdge Slogan (PT)',
        projectId: 'proj-3',
        langCode: 'pt',
        vendorId: 'vendor-pactera',
        termIds: ['term-slogan'],
        status: TranslationJobStatus.InProgress,
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'job-5',
        name: 'SMAX Settings (JA)',
        projectId: 'proj-2',
        langCode: 'ja',
        vendorId: 'vendor-welocalize',
        translatorId: 'translator-3-ja',
        termIds: ['term-settings'],
        status: TranslationJobStatus.InProgress,
        createdAt: new Date().toISOString(),
    }
];


const initialProjects: Project[] = [
    {
        id: 'proj-1',
        name: 'LRP Documentation',
        productGroup: 'ADM',
        description: 'Translating LoadRunner Professional documentation into French, Spanish, and German.',
        sourceLanguage: { name: 'English', code: 'en' },
        targetLanguages: [
            { name: 'French', code: 'fr' },
            { name: 'Spanish', code: 'es' },
            { name: 'German', code: 'de' },
        ],
        terms: [
            { id: 'term-1', key: 'welcome_message', sourceString: 'Welcome to LRP!', context: 'The main greeting on the documentation portal', createdAt: new Date().toISOString(), translations: { 
                fr: { text: 'Bienvenue à LRP!', status: TranslationStatus.Approved }, 
                es: { text: '¡Bienvenido a LRP!', status: TranslationStatus.Approved },
                de: { text: 'Willkommen bei LRP!', status: TranslationStatus.Approved }
            } },
            { id: 'term-2', key: 'about_lrp', sourceString: 'About LRP', context: 'Navigation link to the about page', createdAt: new Date().toISOString(), translations: { 
                fr: { text: 'À propos de LRP', status: TranslationStatus.ManuallyTranslated }, 
                es: { text: '', status: TranslationStatus.Untranslated },
                de: { text: '', status: TranslationStatus.Untranslated }
            } },
            { id: 'term-cta', key: 'cta_button', sourceString: 'Download Now', context: 'Call to action button on landing page', createdAt: new Date().toISOString(), translations: { 
                fr: { text: 'Télécharger maintenant', status: TranslationStatus.InReview, jobId: 'job-1' }, 
                es: { text: 'Descargar ahora', status: TranslationStatus.ManuallyTranslated },
                de: { text: '', status: TranslationStatus.Untranslated }
            } },
            { id: 'term-copyright', key: 'footer_copyright', sourceString: '© 2024 opentext™. All rights reserved.', context: 'Copyright notice in the footer', createdAt: new Date().toISOString(), translations: {
                fr: { text: '© 2024 opentext™. Tous les droits sont réservés.', status: TranslationStatus.ManuallyTranslated },
                es: { text: '', status: TranslationStatus.Untranslated },
                de: { text: '© 2024 opentext™. Alle Rechte vorbehalten.', status: TranslationStatus.InReview, jobId: 'job-2' }
            }},
        ],
        glossary: [
            { id: 'gloss-1', sourceTerm: 'LRP', targetTerm: 'LRP', description: 'LoadRunner Professional. Do not translate.'},
            { id: 'gloss-2', sourceTerm: 'VuGen', targetTerm: 'VuGen', description: 'Virtual User Generator. Do not translate.'}
        ],
        translationMemory: {
            'fr': [ {id: 'tm-fr-1', sourceText: 'Discover our powerful features.', targetText: 'Découvrez nos fonctionnalités puissantes.'} ],
        },
        createdAt: new Date().toISOString(),
    },
    {
        id: 'proj-2',
        name: 'SMAX Service Portal',
        productGroup: 'ITOM',
        description: 'UI strings for the SMAX (Service Management Automation X) portal.',
        sourceLanguage: { name: 'English', code: 'en' },
        targetLanguages: [
            { name: 'German', code: 'de' },
            { name: 'Japanese', code: 'ja' },
        ],
        terms: [
            { id: 'term-3', key: 'login_button', sourceString: 'Log In', context: 'Button to log in to SMAX', createdAt: new Date().toISOString(), translations: { 
                de: { text: 'Anmelden', status: TranslationStatus.InReview, jobId: 'job-3' },
                ja: { text: 'ログイン', status: TranslationStatus.Approved }
            } },
            { id: 'term-settings', key: 'settings_title', sourceString: 'Portal Settings', context: 'Title of the settings screen', createdAt: new Date().toISOString(), translations: {
                de: { text: 'Portaleinstellungen', status: TranslationStatus.Approved },
                ja: { text: 'ポータル設定', status: TranslationStatus.InReview, jobId: 'job-5' }
            }},
            { id: 'term-network-error', key: 'error_message_network', sourceString: 'Network connection failed. Please try again.', context: 'Error message when the portal cannot connect to the server', createdAt: new Date().toISOString(), translations: {
                de: { text: 'Netzwerkverbindung fehlgeschlagen. Bitte versuchen Sie es erneut.', status: TranslationStatus.ManuallyTranslated },
                ja: { text: '', status: TranslationStatus.Untranslated }
            }},
        ],
        glossary: [
            { id: 'gloss-3', sourceTerm: 'SMAX', targetTerm: 'SMAX', description: 'Service Management Automation X. Do not translate.' }
        ],
        translationMemory: {
            'de': [ { id: 'tm-de-1', sourceText: 'Enter your username', targetText: 'Geben Sie Ihren Benutzamen ein' } ]
        },
        createdAt: new Date().toISOString(),
    },
    {
        id: 'proj-3',
        name: 'ValueEdge Marketing',
        productGroup: 'ADM',
        description: 'Slogans and ad copy for the upcoming ValueEdge platform campaign.',
        sourceLanguage: { name: 'English', code: 'en' },
        targetLanguages: [
            { name: 'Italian', code: 'it' },
            { name: 'Portuguese', code: 'pt' },
        ],
        terms: [
            { id: 'term-slogan', key: 'slogan_main', sourceString: 'The Future of Value Stream Management.', context: 'Main ValueEdge slogan', createdAt: new Date().toISOString(), translations: { 
                it: { text: 'Il Futuro del Value Stream Management.', status: TranslationStatus.Approved },
                pt: { text: 'O Futuro da Gestão do Fluxo de Valor.', status: TranslationStatus.InReview, jobId: 'job-4' }
            } },
            { id: 'term-ad-headline', key: 'ad_headline', sourceString: 'Integrate, Automate, and Accelerate.', context: 'Headline for social media ads', createdAt: new Date().toISOString(), translations: { 
                it: { text: 'Integra, Automatizza e Accelera.', status: TranslationStatus.ManuallyTranslated },
                pt: { text: '', status: TranslationStatus.Untranslated }
            } },
        ],
        glossary: [
            { id: 'gloss-4', sourceTerm: 'ValueEdge', targetTerm: 'ValueEdge', description: 'Platform name. Do not translate.'}
        ],
        translationMemory: {},
        createdAt: new Date().toISOString(),
    },
    {
        id: 'proj-4',
        name: 'SiteScope UI',
        productGroup: 'ITOM',
        description: 'UI strings for the SiteScope monitoring solution.',
        sourceLanguage: { name: 'English', code: 'en' },
        targetLanguages: [
            { name: 'Korean', code: 'ko' },
        ],
        terms: [
            { id: 'term-ss-1', key: 'dashboard_title', sourceString: 'Operations Dashboard', context: 'Main dashboard title', createdAt: new Date().toISOString(), translations: { 
                ko: { text: '운영 대시보드', status: TranslationStatus.Approved },
            } },
            { id: 'term-ss-2', key: 'add_monitor', sourceString: 'Add New Monitor', context: 'Button to add a new performance monitor', createdAt: new Date().toISOString(), translations: { 
                ko: { text: '', status: TranslationStatus.Untranslated },
            } },
        ],
        glossary: [
            { id: 'gloss-5', sourceTerm: 'SiteScope', targetTerm: 'SiteScope', description: 'Product name. Do not translate.'},
        ],
        translationMemory: {},
        createdAt: new Date().toISOString(),
    },
    {
        id: 'proj-5',
        name: 'Digital Lab (UFT Mobile)',
        productGroup: 'ADM',
        description: 'Localizing UI for Digital Lab, formerly UFT Mobile.',
        sourceLanguage: { name: 'English', code: 'en' },
        targetLanguages: [
            { name: 'Chinese (Simplified)', code: 'zh-CN' }
        ],
        terms: [
            { id: 'term-dl-1', key: 'device_lab', sourceString: 'Device Lab', context: 'Main screen title', createdAt: new Date().toISOString(), translations: {
                'zh-CN': { text: '设备实验室', status: TranslationStatus.Approved }
            } },
            { id: 'term-dl-2', key: 'upload_app', sourceString: 'Upload Application', context: 'Button to upload a mobile app package', createdAt: new Date().toISOString(), translations: {
                'zh-CN': { text: '上传应用程序', status: TranslationStatus.ManuallyTranslated }
            } },
        ],
        glossary: [
            { id: 'gloss-6', sourceTerm: 'Digital Lab', targetTerm: 'Digital Lab', description: 'Product name, do not translate.'},
            { id: 'gloss-7', sourceTerm: 'UFT', targetTerm: 'UFT', description: 'Unified Functional Testing, do not translate.'},
        ],
        translationMemory: {},
        createdAt: new Date().toISOString(),
    }
];

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
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
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

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [translationJobs, setTranslationJobs] = useState<TranslationJob[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'projects' | 'users' | 'budget' | 'integrations'>('dashboard');

    // Fetch all data from backend on mount
        useEffect(() => {
            // Fetch projects
            fetch('http://localhost:3001/api/projects')
                .then(res => res.json())
                .then(data => setProjects(data));
            // Fetch jobs
            fetch('http://localhost:3001/api/jobs')
                .then(res => res.json())
                .then(data => setTranslationJobs(data));
            // Fetch users
            fetch('http://localhost:3001/api/users')
                .then(res => res.json())
                .then(data => setUsers(data));
        }, []);
  
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedProjectId(null);
  };

  const handleAddProject = useCallback((name: string, description: string, productGroup: string) => {
        const newProject = {
            name,
            description,
            productGroup,
            sourceLanguage: { name: 'English', code: 'en' },
            targetLanguages: [],
            terms: [],
            glossary: [],
            translationMemory: {},
        };
        fetch('http://localhost:3001/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProject)
        })
            .then(res => res.json())
            .then(project => setProjects(prev => [...prev, project]));
    }, []);

  const handleDeleteProject = useCallback((projectId: string) => {
        fetch(`http://localhost:3001/api/projects/${projectId}`, {
            method: 'DELETE'
        }).then(() => {
            setProjects(prev => prev.filter(p => p.id !== projectId));
            if (selectedProjectId === projectId) {
                setSelectedProjectId(null);
            }
        });
    }, [selectedProjectId]);

  const handleAddLanguage = useCallback((projectId: string, name: string, code: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId && !p.targetLanguages.some(l => l.code === code)) {
        return { ...p, targetLanguages: [...p.targetLanguages, { name, code }] };
      }
      return p;
    }));
  }, []);

  const handleDeleteLanguage = useCallback((projectId: string, langCode: string) => {
    setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
            const updatedTargetLanguages = p.targetLanguages.filter(lang => lang.code !== langCode);
            const updatedTerms = p.terms.map(term => {
                const newTranslations = { ...term.translations };
                if (langCode in newTranslations) {
                    delete newTranslations[langCode];
                }
                return { ...term, translations: newTranslations };
            });
            const updatedTM = { ...p.translationMemory };
            delete updatedTM[langCode];

            return { 
                ...p, 
                targetLanguages: updatedTargetLanguages,
                terms: updatedTerms,
                translationMemory: updatedTM,
            };
        }
        return p;
    }));
  }, []);

  const handleAddTerm = useCallback((projectId: string, key: string, sourceString: string, context: string) => {
    const newTerm: Term = {
      id: `term-${Date.now()}`,
      key,
      sourceString,
      context,
      createdAt: new Date().toISOString(),
      translations: {},
    };
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, terms: [...p.terms, newTerm] };
      }
      return p;
    }));
  }, []);

  const handleUpdateTranslation = useCallback((projectId: string, termId: string, langCode: string, translationText: string, newStatus: TranslationStatus, matchPercentage?: number, matchedSource?: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updatedTerms = p.terms.map(t => {
          if (t.id === termId) {
            const newTranslation: TranslationEntry = {
              text: translationText,
              status: newStatus,
            };
            if ((newStatus === TranslationStatus.TMMatch || newStatus === TranslationStatus.FuzzyMatch) && matchPercentage !== undefined) {
              newTranslation.matchPercentage = matchPercentage;
              newTranslation.matchedSource = matchedSource;
            }
            const currentTranslation = t.translations[langCode];
            if(currentTranslation?.jobId) {
                newTranslation.jobId = currentTranslation.jobId;
            }

            return {
              ...t,
              translations: {
                ...t.translations,
                [langCode]: newTranslation,
              },
            };
          }
          return t;
        });
        return { ...p, terms: updatedTerms };
      }
      return p;
    }));
  }, []);

  const handleSuggestTranslation = useCallback(async (projectId: string, termId: string, langCode: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error("Project not found");

    const term = project.terms.find(t => t.id === termId);
    if (!term) throw new Error("Term not found");

    const sourceLanguage = project.sourceLanguage;
    const targetLanguage = project.targetLanguages.find(l => l.code === langCode);
    if (!targetLanguage) throw new Error("Target language not found");

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Translate the following term from ${sourceLanguage.name} to ${targetLanguage.name}.\nTerm: "${term.sourceString}"\nContext: "${term.context || 'No context provided.'}"\n\nProvide ONLY the translated text, without any explanation, introductory phrases, or quotation marks.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const translation = response.text.trim();

        if (translation) {
            handleUpdateTranslation(projectId, termId, langCode, translation, TranslationStatus.MachineTranslated);
        } else {
            throw new Error("Received an empty translation suggestion.");
        }
    } catch (error) {
        console.error("Error fetching translation from Gemini API:", error);
        throw error;
    }
  }, [projects, handleUpdateTranslation]);

  const handlePreTranslate = useCallback(async (projectId: string, langCode: string): Promise<{ tmCount: number, mtCount: number }> => {
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error("Project not found");
    
    const sourceLanguage = project.sourceLanguage;
    const targetLanguage = project.targetLanguages.find(l => l.code === langCode);
    if (!targetLanguage) throw new Error("Target language not found");

    // 1. Get TM data
    const tmSource: { sourceText: string; targetText: string }[] = [];
    const highQualityStatuses: TranslationStatus[] = [
      TranslationStatus.Approved,
      TranslationStatus.ManuallyTranslated,
      TranslationStatus.TMMatch
    ];
    project.terms.forEach(term => {
      const translation = term.translations[langCode];
      if (translation?.text && highQualityStatuses.includes(translation.status)) {
        tmSource.push({ sourceText: term.sourceString, targetText: translation.text });
      }
    });
    const importedTM = project.translationMemory?.[langCode] || [];
    tmSource.push(...importedTM.map(tm => ({ sourceText: tm.sourceText, targetText: tm.targetText })));
    
    // 2. Identify terms to translate and split between TM and MT
    const untranslatedTerms = project.terms.filter(term => {
      const translation = term.translations[langCode];
      return !translation || translation.status === TranslationStatus.Untranslated;
    });

    const tmUpdates: { termId: string; translation: TranslationEntry }[] = [];
    const termsForMT: Term[] = [];

    if (tmSource.length > 0) {
        untranslatedTerms.forEach(term => {
            let bestMatch: { target: string; similarity: number; source: string; } | null = null;
            for (const tmEntry of tmSource) {
                const similarity = calculateSimilarity(term.sourceString, tmEntry.sourceText);
                if (similarity >= 70 && (!bestMatch || similarity > bestMatch.similarity)) {
                bestMatch = { target: tmEntry.targetText, similarity, source: tmEntry.sourceText };
                }
            }
            if (bestMatch) {
                const newStatus = bestMatch.similarity === 100 ? TranslationStatus.TMMatch : TranslationStatus.FuzzyMatch;
                tmUpdates.push({
                    termId: term.id,
                    translation: { text: bestMatch.target, status: newStatus, matchPercentage: bestMatch.similarity, matchedSource: bestMatch.source }
                });
            } else {
                termsForMT.push(term);
            }
        });
    } else {
        termsForMT.push(...untranslatedTerms);
    }
    
    // 3. Perform Machine Translation
    const mtUpdates: { termId: string; translation: TranslationEntry }[] = [];
    if (termsForMT.length > 0) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const translationPromises = termsForMT.map(term => {
            const prompt = `Translate the following term from ${sourceLanguage.name} to ${targetLanguage.name}.\nTerm: "${term.sourceString}"\nContext: "${term.context || 'No context provided.'}"\n\nProvide ONLY the translated text, without any explanation, introductory phrases, or quotation marks.`;
            return ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            }).then(response => ({
                termId: term.id,
                translationText: response.text.trim()
            })).catch(error => {
                console.error(`Failed to translate term ID ${term.id}:`, error);
                return { termId: term.id, translationText: null };
            });
        });
        const mtResults = await Promise.all(translationPromises);
        mtResults.forEach(({ termId, translationText }) => {
            if (translationText) {
                mtUpdates.push({
                    termId,
                    translation: { text: translationText, status: TranslationStatus.MachineTranslated }
                });
            }
        });
    }

    // 4. Update state
    if (tmUpdates.length > 0 || mtUpdates.length > 0) {
        const allUpdates = [...tmUpdates, ...mtUpdates];
        setProjects(prevProjects => prevProjects.map(p => {
            if (p.id === projectId) {
                const termsMap = new Map(p.terms.map(t => [t.id, t]));
                allUpdates.forEach(update => {
                    const termToUpdate = termsMap.get(update.termId);
                    if (termToUpdate) {
                        const updatedTerm = {
                            ...termToUpdate,
                            translations: { ...termToUpdate.translations, [langCode]: update.translation }
                        };
                        termsMap.set(update.termId, updatedTerm);
                    }
                });
                return { ...p, terms: Array.from(termsMap.values()) };
            }
            return p;
        }));
    }

    return { tmCount: tmUpdates.length, mtCount: mtUpdates.length };

}, [projects]);


  const handleDeleteTerm = useCallback((projectId: string, termId: string) => {
    setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
            return { ...p, terms: p.terms.filter(t => t.id !== termId) };
        }
        return p;
    }));
  }, []);

  const handleCreateTranslationJob = useCallback((jobDetails: Omit<TranslationJob, 'id' | 'createdAt' | 'status'>) => {
      const newJob: TranslationJob = {
          ...jobDetails,
          id: `job-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: TranslationJobStatus.InProgress,
      };
      
      setTranslationJobs(prev => [...prev, newJob]);

      const termIdSet = new Set(jobDetails.termIds);
      setProjects(prev => prev.map(p => {
          if (p.id === jobDetails.projectId) {
              const updatedTerms = p.terms.map(t => {
                  if (termIdSet.has(t.id)) {
                      const translation = t.translations[jobDetails.langCode];
                      if (translation) {
                          return { ...t, translations: { ...t.translations, [jobDetails.langCode]: { ...translation, status: TranslationStatus.InReview, jobId: newJob.id }}};
                      }
                  }
                  return t;
              });
              return { ...p, terms: updatedTerms };
          }
          return p;
      }));
  }, []);

  const handleUpdateTranslationStatus = useCallback((projectId: string, termId: string, langCode: string, status: TranslationStatus) => {
      setProjects(prev => prev.map(p => {
          if (p.id === projectId) {
              const updatedTerms = p.terms.map(t => {
                  if (t.id === termId) {
                      const translation = t.translations[langCode];
                      if (translation) {
                         const newTranslation = { ...translation, status };
                         if (translation.jobId) { newTranslation.jobId = translation.jobId; }
                         return { ...t, translations: { ...t.translations, [langCode]: newTranslation }};
                      }
                  }
                  return t;
              });
              return { ...p, terms: updatedTerms };
          }
          return p;
      }));
  }, []);

    const handleCompleteJob = useCallback((jobId: string) => {
        setTranslationJobs(prev => prev.map(job => 
            job.id === jobId ? { ...job, status: TranslationJobStatus.Completed } : job
        ));
    }, []);

    const handleAssignTranslator = useCallback((jobId: string, translatorId: string) => {
        setTranslationJobs(prev => prev.map(job =>
            job.id === jobId ? { ...job, translatorId } : job
        ));
    }, []);

  const handleImportTranslations = useCallback((projectId: string, langCode: string, jsonContent: string) => {
    setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
            const importedData = JSON.parse(jsonContent);
            if (typeof importedData !== 'object' || importedData === null || Array.isArray(importedData)) {
                throw new Error("Imported JSON must be a key-value object.");
            }

            const updatedTerms = p.terms.map(term => {
                if (Object.prototype.hasOwnProperty.call(importedData, term.key)) {
                    const translationText = importedData[term.key];
                    if (typeof translationText !== 'string') { return term; }

                    const currentTranslation = term.translations[langCode];
                    const currentStatus = currentTranslation?.status;
                    
                    const newStatus = (currentStatus === TranslationStatus.InReview || currentStatus === TranslationStatus.Approved)
                        ? currentStatus
                        : TranslationStatus.ManuallyTranslated;

                    return {
                        ...term,
                        translations: { ...term.translations, [langCode]: { text: translationText, status: newStatus } }
                    };
                }
                return term;
            });

            const existingKeys = new Set(p.terms.map(t => t.key));
            const newTerms: Term[] = [];

            for (const termKey in importedData) {
                if (Object.prototype.hasOwnProperty.call(importedData, termKey) && !existingKeys.has(termKey)) {
                    const translationText = importedData[termKey];
                    if (typeof translationText !== 'string') continue;
                    newTerms.push({
                        id: `term-${Date.now()}-${termKey.replace(/\s/g, '_')}`, key: termKey, sourceString: termKey, context: 'Imported via file', createdAt: new Date().toISOString(),
                        translations: { [langCode]: { text: translationText, status: TranslationStatus.ManuallyTranslated, }, },
                    });
                }
            }
            return { ...p, terms: [...updatedTerms, ...newTerms] };
        }
        return p;
    }));
  }, []);

  const handleImportSourceTerms = useCallback((projectId: string, jsonContent: string) => {
    setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
            let importedData;
            try { importedData = JSON.parse(jsonContent); } catch (e) { throw new Error("Invalid JSON file."); }
            if (!Array.isArray(importedData)) { throw new Error("Imported JSON must be an array of term objects."); }

            const existingKeys = new Set(p.terms.map(t => t.key));
            const newTerms: Term[] = [];

            for (const item of importedData) {
                if (typeof item !== 'object' || item === null || !item.key || !item.sourceString || typeof item.key !== 'string' || typeof item.sourceString !== 'string') continue;
                if (existingKeys.has(item.key)) continue;

                newTerms.push({
                    id: `term-${Date.now()}-${item.key.replace(/\s/g, '_')}-${newTerms.length}`, key: item.key, sourceString: item.sourceString,
                    context: typeof item.context === 'string' ? item.context : '', createdAt: new Date().toISOString(), translations: {},
                });
                existingKeys.add(item.key);
            }
            if (newTerms.length > 0) { alert(`${newTerms.length} new terms were imported successfully.`); } else { alert("No new terms were imported."); }
            return { ...p, terms: [...p.terms, ...newTerms] };
        }
        return p;
    }));
  }, []);

  const handleAddGlossaryTerm = useCallback((projectId: string, sourceTerm: string, targetTerm: string, description: string) => {
      const newGlossaryTerm: GlossaryTerm = {
          id: `gloss-${Date.now()}`, sourceTerm, targetTerm, description
      };
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, glossary: [...p.glossary, newGlossaryTerm]} : p));
  }, []);
  
  const handleDeleteGlossaryTerm = useCallback((projectId: string, termId: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, glossary: p.glossary.filter(g => g.id !== termId) } : p));
  }, []);

  const handleImportGlossary = useCallback((projectId: string, importedTerms: Omit<GlossaryTerm, 'id'>[]) => {
    setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
            const existingSourceTerms = new Set(p.glossary.map(g => g.sourceTerm.toLowerCase()));
            const newTerms: GlossaryTerm[] = [];
            importedTerms.forEach((term, index) => {
                if (term.sourceTerm && !existingSourceTerms.has(term.sourceTerm.toLowerCase())) {
                    newTerms.push({ ...term, id: `gloss-${Date.now()}-${index}` });
                    existingSourceTerms.add(term.sourceTerm.toLowerCase());
                }
            });
            if (newTerms.length > 0) alert(`${newTerms.length} new glossary terms imported successfully.`);
            else alert("No new glossary terms were imported.");
            return { ...p, glossary: [...p.glossary, ...newTerms] };
        }
        return p;
    }));
  }, []);

  const handleImportTM = useCallback((projectId: string, langCode: string, importedEntries: Omit<TMEntry, 'id'>[]) => {
    setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
            const currentTM = p.translationMemory?.[langCode] || [];
            const existingEntries = new Set(currentTM.map(e => `${e.sourceText.toLowerCase()}|||${e.targetText.toLowerCase()}`));
            const newEntries: TMEntry[] = [];
            importedEntries.forEach((entry, index) => {
                if (entry.sourceText && entry.targetText && !existingEntries.has(`${entry.sourceText.toLowerCase()}|||${entry.targetText.toLowerCase()}`)) {
                    newEntries.push({ ...entry, id: `tm-${Date.now()}-${index}` });
                    existingEntries.add(`${entry.sourceText.toLowerCase()}|||${entry.targetText.toLowerCase()}`);
                }
            });
            if (newEntries.length > 0) alert(`${newEntries.length} new TM entries imported.`);
            else alert("No new TM entries were imported.");
            const updatedTMForLang = [...currentTM, ...newEntries];
            const updatedTranslationMemory = { ...p.translationMemory, [langCode]: updatedTMForLang };
            return { ...p, translationMemory: updatedTranslationMemory };
        }
        return p;
    }));
  }, []);
  
  const handleAddUser = useCallback((name: string, email: string, role: User['role'], costPerWord?: number, agencyId?: string) => {
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          alert('A user with this email already exists.');
          return;
      }
      const newUser: User = {
          id: `user-${Date.now()}`, name, email, role, status: 'Invited', avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
      };
      if (role === 'vendor' && costPerWord) { newUser.costPerWord = costPerWord; }
      if (role === 'translator' && agencyId) { newUser.agencyId = agencyId; }
      setUsers(prev => [...prev, newUser]);
  }, [users]);

  const handleDeleteUser = useCallback((userId: string) => {
      if (currentUser?.id === userId) {
          alert("You cannot delete your own account.");
          return;
      }
      setUsers(prev => prev.filter(u => u.id !== userId));
  }, [currentUser]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const isAdminView = currentUser?.role === 'admin' || currentUser?.role === 'lpm';
  
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="min-h-screen bg-secondary text-gray-800">
      <header className="header-bar shadow-sm sticky top-0 z-20">
        <div className="p-3 flex items-baseline max-w-screen-2xl mx-auto">
            <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold">TransSmart</span>
            </div>
            {isAdminView && (
                <nav className="hidden md:flex items-baseline gap-4 ml-8">
                    <button onClick={() => { setCurrentView('dashboard'); setSelectedProjectId(null); }} className={`uppercase tracking-wider font-bold text-sm px-3 py-2 transition-all duration-200 border-b-4 ${currentView === 'dashboard' ? 'border-white' : 'border-transparent hover:border-white/50'}`}>
                        HOME
                    </button>
                    <button onClick={() => { setCurrentView('projects'); setSelectedProjectId(null); }} className={`uppercase tracking-wider font-bold text-sm px-3 py-2 transition-all duration-200 border-b-4 ${currentView === 'projects' ? 'border-white' : 'border-transparent hover:border-white/50'}`}>
                        Projects
                    </button>
                    <button onClick={() => setCurrentView('users')} className={`uppercase tracking-wider font-bold text-sm px-3 py-2 transition-all duration-200 border-b-4 ${currentView === 'users' ? 'border-white' : 'border-transparent hover:border-white/50'}`}>
                        Team
                    </button>
                    <button onClick={() => setCurrentView('budget')} className={`uppercase tracking-wider font-bold text-sm px-3 py-2 transition-all duration-200 border-b-4 ${currentView === 'budget' ? 'border-white' : 'border-transparent hover:border-white/50'}`}>
                        Budget
                    </button>
                    <button onClick={() => setCurrentView('integrations')} className={`uppercase tracking-wider font-bold text-sm px-3 py-2 transition-all duration-200 border-b-4 ${currentView === 'integrations' ? 'border-white' : 'border-transparent hover:border-white/50'}`}>
                        Integrations
                    </button>
                </nav>
            )}
            <div className="flex-grow" />
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 hover:bg-white/10 p-2 rounded-lg transition-colors"
                    aria-label="Log out"
                    title="Log out"
                >
                    <UserIcon className="w-6 h-6"/>
                    <span className="font-semibold text-sm">{currentUser.name}</span>
                </button>
            </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto">
        {isAdminView ? (
          <>
            {currentView === 'dashboard' && ( <Dashboard projects={projects} users={users} jobs={translationJobs} />)}
            {currentView === 'projects' && (
              <>
                {selectedProject ? (
                  <ProjectView
                    project={selectedProject}
                    users={users}
                    translationJobs={translationJobs}
                    onBack={() => setSelectedProjectId(null)}
                    onAddLanguage={handleAddLanguage}
                    onDeleteLanguage={handleDeleteLanguage}
                    onAddTerm={handleAddTerm}
                    onUpdateTranslation={handleUpdateTranslation}
                    onDeleteTerm={handleDeleteTerm}
                    onSuggestTranslation={handleSuggestTranslation}
                    onPreTranslate={handlePreTranslate}
                    onCreateTranslationJob={handleCreateTranslationJob}
                    onUpdateTranslationStatus={handleUpdateTranslationStatus}
                    onImportTranslations={handleImportTranslations}
                    onImportSourceTerms={handleImportSourceTerms}
                    onAddGlossaryTerm={handleAddGlossaryTerm}
                    onDeleteGlossaryTerm={handleDeleteGlossaryTerm}
                    onImportGlossary={handleImportGlossary}
                    onImportTM={handleImportTM}
                  />
                ) : (
                  <ProjectList 
                    projects={projects} 
                    onSelectProject={setSelectedProjectId} 
                    onAddProject={handleAddProject}
                    onDeleteProject={handleDeleteProject}
                  />
                )}
              </>
            )}
            {currentView === 'users' && (
                <UserManagement
                    users={users}
                    onAddUser={handleAddUser}
                    onDeleteUser={handleDeleteUser}
                />
            )}
            {currentView === 'budget' && ( <BudgetEstimator projects={projects} users={users} /> )}
            {currentView === 'integrations' && ( <Integrations /> )}
          </>
        ) : (
          <VendorDashboard
            projects={projects}
            jobs={translationJobs}
            currentUser={currentUser}
            users={users}
            onUpdateTranslation={handleUpdateTranslation}
            onCompleteJob={handleCompleteJob}
            onAssignTranslator={handleAssignTranslator}
          />
        )}
      </main>
    </div>
  );
};

export default App;