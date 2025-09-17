import React, { useState, useMemo, useEffect } from 'react';
import type { Project, User, Term, TranslationJob, GlossaryTerm } from '../types';
import { TranslationStatus, TranslationJobStatus } from '../types';
import { CheckIcon, BriefcaseIcon, ChevronLeftIcon, BookOpenIcon, DatabaseIcon, UserIcon, EyeIcon, CalendarIcon, DocumentTextIcon, SearchIcon, TranslateIcon } from './Icons';

interface VendorDashboardProps {
    projects: Project[];
    jobs: TranslationJob[];
    currentUser: User;
    users: User[];
    onUpdateTranslation: (projectId: string, termId: string, langCode: string, translation: string, status: TranslationStatus) => void;
    onCompleteJob: (jobId: string) => void;
    onAssignTranslator: (jobId: string, translatorId: string) => void;
}

interface JobDetails extends TranslationJob {
    projectName: string;
    langName: string;
    terms: Term[];
    glossary: GlossaryTerm[];
    translationMemory: { source: string, target: string }[];
    wordCount: number;
    progress: {
        completed: number;
        total: number;
    }
}

const countWords = (str: string): number => {
    if (!str || typeof str !== 'string') return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
};

const calculateSimilarity = (str1: string, str2: string): number => {
    if (!str1 || !str2) return 0;
    const set1 = new Set(str1.toLowerCase().split(/\s+/));
    const set2 = new Set(str2.toLowerCase().split(/\s+/));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    if (union.size === 0) return 100;
    return Math.round((intersection.size / union.size) * 100);
};

const VendorDashboard: React.FC<VendorDashboardProps> = ({ projects, jobs, currentUser, users, onUpdateTranslation, onCompleteJob, onAssignTranslator }) => {
    
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [activeTermId, setActiveTermId] = useState<string | null>(null);
    const [editableTranslations, setEditableTranslations] = useState<Record<string, string>>({});
    const [activeHelperTab, setActiveHelperTab] = useState<'tm' | 'glossary' | 'info'>('tm');

    // Filters for vendor manager
    const [filterStatus, setFilterStatus] = useState<'all' | 'unassigned' | 'assigned'>('all');
    const [filterTranslator, setFilterTranslator] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    const myTranslators = useMemo(() => {
        if (currentUser.role !== 'vendor') return [];
        return users.filter(u => u.role === 'translator' && u.agencyId === currentUser.id);
    }, [users, currentUser]);

    const vendorJobs = useMemo(() => {
        const relevantJobs = currentUser.role === 'vendor' 
            ? jobs.filter(job => job.vendorId === currentUser.id)
            : jobs.filter(job => job.translatorId === currentUser.id);

        return relevantJobs
            .filter(job => job.status === TranslationJobStatus.InProgress)
            .map(job => {
                const project = projectMap.get(job.projectId);
                if (!project) return null;
                
                const termMap = new Map(project.terms.map(t => [t.id, t]));
                const jobTerms = job.termIds.map(id => termMap.get(id)).filter((t): t is Term => !!t);
                
                const completedCount = jobTerms.filter(t => t.translations[job.langCode]?.status === TranslationStatus.Approved).length;

                const projectTm = project.terms
                    .filter(t => t.translations[job.langCode]?.status === TranslationStatus.Approved && t.translations[job.langCode].text)
                    .map(t => ({ source: t.sourceString, target: t.translations[job.langCode].text }));
                
                const importedTm = (project.translationMemory?.[job.langCode] || []).map(entry => ({ source: entry.sourceText, target: entry.targetText }));

                const wordCount = jobTerms.reduce((sum, term) => sum + countWords(term.sourceString), 0);

                return {
                    ...job,
                    projectName: project.name,
                    langName: project.targetLanguages.find(l => l.code === job.langCode)?.name || job.langCode,
                    terms: jobTerms,
                    glossary: project.glossary,
                    translationMemory: [...projectTm, ...importedTm],
                    wordCount,
                    progress: { completed: completedCount, total: jobTerms.length }
                };
            })
            .filter((j): j is JobDetails => !!j)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [jobs, currentUser, projectMap]);

    const filteredVendorJobs = useMemo(() => {
        return vendorJobs.filter(job => {
            if (filterStatus === 'unassigned' && job.translatorId) return false;
            if (filterStatus === 'assigned' && !job.translatorId) return false;
            if (filterTranslator !== 'all' && job.translatorId !== filterTranslator) return false;
            if (searchQuery) {
                const lowerQuery = searchQuery.toLowerCase();
                if (!job.name.toLowerCase().includes(lowerQuery) && !job.projectName.toLowerCase().includes(lowerQuery)) {
                    return false;
                }
            }
            return true;
        });
    }, [vendorJobs, filterStatus, filterTranslator, searchQuery]);


    const selectedJob = useMemo(() => vendorJobs.find(job => job.id === selectedJobId) || null, [selectedJobId, vendorJobs]);
    const activeTerm = useMemo(() => selectedJob?.terms.find(t => t.id === activeTermId) || null, [selectedJob, activeTermId]);

    useEffect(() => {
        if (selectedJob && currentUser.role === 'translator') {
            const firstUnapprovedTerm = selectedJob.terms.find(term => term.translations[selectedJob.langCode]?.status !== TranslationStatus.Approved);
            setActiveTermId(firstUnapprovedTerm?.id || selectedJob.terms[0]?.id || null);
            
            const initialEdits: Record<string, string> = {};
            selectedJob.terms.forEach(term => {
                const translation = term.translations[selectedJob.langCode];
                initialEdits[`${term.id}-${selectedJob.langCode}`] = translation?.text || '';
            });
            setEditableTranslations(initialEdits);
        } else {
            setActiveTermId(null);
        }
    }, [selectedJob, currentUser.role]);

    const tmSuggestions = useMemo(() => {
        if (!activeTerm || !selectedJob) return [];
        const allSuggestions = selectedJob.translationMemory
          .map(entry => ({
            source: entry.source,
            target: entry.target,
            similarity: calculateSimilarity(activeTerm.sourceString, entry.source),
          }))
          .filter(s => s.similarity >= 50)
          .sort((a, b) => b.similarity - a.similarity);
        
        return allSuggestions.reduce((acc: typeof allSuggestions, current) => {
            if (!acc.find(item => item.target === current.target)) acc.push(current);
            return acc;
        }, []).slice(0, 3);
    }, [activeTerm, selectedJob]);

    const handleTranslationChange = (termId: string, langCode: string, newText: string) => {
        setEditableTranslations(prev => ({ ...prev, [`${termId}-${langCode}`]: newText }));
    };

    const handleSubmit = (term: Term, job: JobDetails) => {
        const newText = editableTranslations[`${term.id}-${job.langCode}`];
        if (newText.trim() === '') return;
        onUpdateTranslation(job.projectId, term.id, job.langCode, newText, TranslationStatus.Approved);
    };

    const highlightGlossaryTerms = useMemo(() => {
        if (!selectedJob || !activeTerm || selectedJob.glossary.length === 0) return (text: string) => text;
        const glossaryRegex = new RegExp(`(${selectedJob.glossary.map(g => g.sourceTerm).join('|')})`, 'gi');
        return (text: string) => {
            if (!text) return '';
            const parts = text.split(glossaryRegex);
            return parts.map((part, index) => {
                const match = selectedJob.glossary.find(g => g.sourceTerm.toLowerCase() === part.toLowerCase());
                if (match) return <strong key={index} className="bg-yellow-200" title={`Glossary: ${match.targetTerm}`}>{part}</strong>;
                return part;
            });
        };
    }, [selectedJob, activeTerm]);
    
    // Agency Manager View
    if (currentUser.role === 'vendor') {
        const unassignedCount = vendorJobs.filter(j => !j.translatorId).length;
        return (
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Agency Job Dashboard</h1>
                        <p className="text-sm text-gray-500">Assign and monitor incoming jobs for your team.</p>
                    </div>
                    {unassignedCount > 0 && 
                        <div className="bg-rose-100 text-rose-700 font-bold py-2 px-4 rounded-lg text-sm">
                            {unassignedCount} Job{unassignedCount > 1 ? 's' : ''} Require Assignment
                        </div>
                    }
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border mb-6 flex flex-wrap items-center gap-4">
                    <div className="relative flex-grow min-w-[200px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-gray-400" /></div>
                        <input type="text" placeholder="Search by job or project..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white text-gray-800 p-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="bg-white text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent">
                        <option value="all">All Statuses</option>
                        <option value="unassigned">Unassigned</option>
                        <option value="assigned">Assigned</option>
                    </select>
                    <select value={filterTranslator} onChange={e => setFilterTranslator(e.target.value)} className="bg-white text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent">
                        <option value="all">All Translators</option>
                        {myTranslators.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                {filteredVendorJobs.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <BriefcaseIcon className="w-16 h-16 mx-auto mb-4 text-gray-300"/>
                        <h2 className="text-2xl font-semibold mb-2">No Jobs Found</h2>
                        <p>No jobs match your current filters. Try adjusting your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredVendorJobs.map(job => {
                             const progressPercent = job.progress.total > 0 ? (job.progress.completed / job.progress.total) * 100 : 0;
                             const translator = job.translatorId ? userMap.get(job.translatorId) : null;
                             return (
                                <div key={job.id} className="bg-white rounded-lg shadow-sm border border-border-color p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="mb-3">
                                            <span className="text-xs font-bold uppercase text-gray-400">{job.projectName}</span>
                                            <h3 className="text-lg font-bold text-gray-800">{job.name}</h3>
                                        </div>
                                        <div className="space-y-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-2"><TranslateIcon className="w-5 h-5 text-gray-400"/><span className="font-semibold">{job.langName}</span></div>
                                            <div className="flex items-center gap-2"><DocumentTextIcon className="w-5 h-5 text-gray-400"/><span>{job.wordCount.toLocaleString()} words</span></div>
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-5 h-5 text-gray-400"/>
                                                {job.dueDate ? <span className={`${new Date(job.dueDate) < new Date() ? 'text-red-500 font-bold' : ''}`}>{new Date(job.dueDate).toLocaleDateString()}</span> : <span className="text-gray-400">No due date</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="mb-2">
                                            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1"><span>Progress</span><span>{job.progress.completed}/{job.progress.total}</span></div>
                                            <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-accent h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div></div>
                                        </div>
                                        <div>
                                            <label htmlFor={`assign-${job.id}`} className="text-xs font-bold text-gray-500">ASSIGNED TO</label>
                                            <select id={`assign-${job.id}`} value={job.translatorId || ''} onChange={(e) => onAssignTranslator(job.id, e.target.value)} className="mt-1 w-full p-2 text-sm rounded-md border border-gray-300 focus:ring-accent bg-gray-50">
                                                <option value="">-- Unassigned --</option>
                                                {myTranslators.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                )}
            </div>
        );
    }
    
    // Translator Workbench View
    if (!selectedJob) {
        return (
            <div className="p-8">
                 <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">My Translation Jobs</h1>
                    <p className="text-sm text-gray-500">Here are the jobs currently assigned to you.</p>
                </div>
                {vendorJobs.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <CheckIcon className="w-16 h-16 mx-auto mb-4 text-gray-300"/>
                        <h2 className="text-2xl font-semibold mb-2">All Caught Up!</h2>
                        <p>You have no pending translation jobs.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {vendorJobs.map(job => {
                            const progressPercent = job.progress.total > 0 ? (job.progress.completed / job.progress.total) * 100 : 0;
                            return (
                                <div key={job.id} className="bg-white rounded-lg shadow-sm border border-border-color p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="mb-3">
                                            <span className="text-xs font-bold uppercase text-gray-400">{job.projectName}</span>
                                            <h3 className="text-lg font-bold text-gray-800">{job.name}</h3>
                                        </div>
                                        <div className="space-y-3 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center gap-2"><TranslateIcon className="w-5 h-5 text-gray-400"/><span className="font-semibold">{job.langName}</span></div>
                                            <div className="flex items-center gap-2"><DocumentTextIcon className="w-5 h-5 text-gray-400"/><span>{job.wordCount.toLocaleString()} words</span></div>
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-5 h-5 text-gray-400"/>
                                                {job.dueDate ? <span className={`${new Date(job.dueDate) < new Date() ? 'text-red-500 font-bold' : ''}`}>{new Date(job.dueDate).toLocaleDateString()}</span> : <span className="text-gray-400">No due date</span>}
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1"><span>Progress</span><span>{job.progress.completed}/{job.progress.total}</span></div>
                                            <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-accent h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div></div>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedJobId(job.id)} className="mt-4 w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-3 rounded-lg text-sm">
                                        <EyeIcon className="w-4 h-4"/> Open Workbench
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        );
    }
    
    const isJobComplete = selectedJob.progress.completed === selectedJob.progress.total;
    return (
        <div className="p-8 flex flex-col h-[calc(100vh-100px)]">
            <button onClick={() => setSelectedJobId(null)} className="flex items-center gap-2 text-gray-600 hover:text-accent mb-4 font-medium">
                <ChevronLeftIcon className="w-5 h-5" /> Back to All Jobs
            </button>
            <div className="bg-white rounded-t-lg shadow-sm border border-border-color border-b-0 p-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-primary">{selectedJob.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>Project: <strong>{selectedJob.projectName}</strong></span>
                        <span>Language: <strong>{selectedJob.langName}</strong></span>
                        {selectedJob.dueDate && <span className={`font-bold ${new Date(selectedJob.dueDate) < new Date() ? 'text-red-500' : 'text-gray-700'}`}>Due: {new Date(selectedJob.dueDate).toLocaleDateString()}</span>}
                    </div>
                </div>
                <button onClick={() => { onCompleteJob(selectedJob.id); setSelectedJobId(null); }} disabled={!isJobComplete} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                    <CheckIcon className="w-5 h-5"/> Mark Job as Complete
                </button>
            </div>
            <div className="flex-grow flex bg-white rounded-b-lg shadow-sm border border-border-color min-h-0">
                <div className="w-1/3 border-r border-border-color flex flex-col">
                    <div className="p-3 border-b border-border-color text-sm font-bold text-gray-600">{selectedJob.progress.completed} / {selectedJob.progress.total} Completed</div>
                    <div className="overflow-y-auto">
                        {selectedJob.terms.map(term => {
                            const isApproved = term.translations[selectedJob.langCode]?.status === TranslationStatus.Approved;
                            return (
                                <div key={term.id} onClick={() => setActiveTermId(term.id)} className={`p-3 cursor-pointer border-l-4 ${term.id === activeTermId ? 'border-accent bg-blue-50' : isApproved ? 'border-green-500' : 'border-transparent'} hover:bg-gray-50 border-b border-border-color`}>
                                    <p className={`text-sm font-medium truncate ${term.id === activeTermId ? 'text-accent' : ''}`}>{term.sourceString}</p>
                                    <span className={`text-xs font-bold ${isApproved ? 'text-green-700' : 'text-gray-500'}`}>{isApproved ? 'Submitted' : 'Pending'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="w-2/3 flex flex-col p-4">
                    {activeTerm ? (
                        <>
                            <div className="flex-grow flex flex-col min-h-0">
                                <div className="p-4 bg-gray-50 rounded-lg border border-border-color">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Source ({selectedJob.langCode})</label>
                                    <p className="text-lg font-medium text-gray-900 mt-1">{highlightGlossaryTerms(activeTerm.sourceString)}</p>
                                    {activeTerm.context && <p className="text-sm text-gray-600 mt-1">{highlightGlossaryTerms(activeTerm.context)}</p>}
                                    <p className="text-xs text-gray-400 mt-2 font-mono">KEY: {activeTerm.key}</p>
                                </div>
                                <textarea
                                    value={editableTranslations[`${activeTerm.id}-${selectedJob.langCode}`] || ''}
                                    onChange={e => handleTranslationChange(activeTerm.id, selectedJob.langCode, e.target.value)}
                                    readOnly={activeTerm.translations[selectedJob.langCode]?.status === TranslationStatus.Approved}
                                    className="w-full text-lg p-4 rounded-lg border border-border-color focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-200 mt-4 flex-grow resize-none"
                                    placeholder="Enter your translation here..."
                                    disabled={activeTerm.translations[selectedJob.langCode]?.status === TranslationStatus.Approved}
                                />
                                {activeTerm.translations[selectedJob.langCode]?.status !== TranslationStatus.Approved ? (
                                     <button onClick={() => handleSubmit(activeTerm, selectedJob)} className="mt-4 self-end flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">
                                        <CheckIcon className="w-5 h-5" /> Submit
                                    </button>
                                ) : (
                                    <div className="mt-4 self-end p-2 text-sm font-bold bg-green-100 text-green-800 rounded-md">Translation Submitted</div>
                                )}
                            </div>
                            <div className="border-t border-border-color mt-4 pt-4">
                                <div className="border-b border-border-color mb-2"><nav className="-mb-px flex space-x-4">
                                        <button onClick={() => setActiveHelperTab('tm')} className={`group inline-flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${activeHelperTab === 'tm' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><DatabaseIcon className="w-5 h-5"/> TM</button>
                                        <button onClick={() => setActiveHelperTab('glossary')} className={`group inline-flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${activeHelperTab === 'glossary' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><BookOpenIcon className="w-5 h-5"/> Glossary</button>
                                        <button onClick={() => setActiveHelperTab('info')} className={`group inline-flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${activeHelperTab === 'info' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><BriefcaseIcon className="w-5 h-5"/> Job Info</button>
                                </nav></div>
                                <div className="h-32 overflow-y-auto p-1">
                                    {activeHelperTab === 'tm' && (tmSuggestions.length > 0 ? <div className="space-y-2">{tmSuggestions.map((s, i) => <div key={i} className="p-2 rounded-md hover:bg-violet-50"><div className="flex justify-between items-start"><p className="font-medium pr-2">{s.target}</p><span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full shrink-0">{s.similarity}%</span></div><p className="text-xs text-gray-500 mt-1 truncate" title={`Source: "${s.source}"`}>{s.source}</p></div>)}</div> : <p className="text-center pt-4">No TM suggestions.</p>)}
                                    {activeHelperTab === 'glossary' && (selectedJob.glossary.length > 0 ? <div className="space-y-2">{selectedJob.glossary.map(g => <div key={g.id} className="p-2 bg-gray-50 rounded-md"><p><strong>{g.sourceTerm}</strong> → {g.targetTerm}</p>{g.description && <p className="text-xs text-gray-500">{g.description}</p>}</div>)}</div> : <p className="text-center pt-4">No glossary terms.</p>)}
                                    {activeHelperTab === 'info' && (selectedJob.instructions ? <div className="p-2 bg-blue-50 border-l-4 border-blue-400 text-blue-800 text-sm"><p className="whitespace-pre-wrap">{selectedJob.instructions}</p></div> : <p className="text-center pt-4">No instructions.</p>)}
                                </div>
                            </div>
                        </>
                    ) : ( <div className="flex-grow flex items-center justify-center text-gray-500"><p>Select a string to begin.</p></div> )}
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
