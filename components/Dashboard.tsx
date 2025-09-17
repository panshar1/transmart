import React, { useMemo } from 'react';
import type { Project, User, TranslationJob } from '../types';
import { TranslationStatus, TranslationJobStatus } from '../types';
import { ProjectIcon, TranslateIcon, BriefcaseIcon, CurrencyDollarIcon } from './Icons';

interface DashboardProps {
    projects: Project[];
    users: User[];
    jobs: TranslationJob[];
}

const countWords = (str: string): number => {
    if (!str || typeof str !== 'string') return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
};

const Dashboard: React.FC<DashboardProps> = ({ projects, users, jobs }) => {

    const stats = useMemo(() => {
        const totalProjects = projects.length;
        const totalStrings = projects.reduce((sum, p) => sum + p.terms.length, 0);
        
        const allTargetLangs = new Set<string>();
        let totalPossibleTranslations = 0;
        let totalApprovedTranslations = 0;

        projects.forEach(p => {
            p.targetLanguages.forEach(l => allTargetLangs.add(l.name));
            totalPossibleTranslations += p.terms.length * p.targetLanguages.length;
            p.terms.forEach(term => {
                Object.values(term.translations).forEach(trans => {
                    if (trans.status === TranslationStatus.Approved) {
                        totalApprovedTranslations++;
                    }
                });
            });
        });
        
        const overallProgress = totalPossibleTranslations > 0 ? (totalApprovedTranslations / totalPossibleTranslations) * 100 : 0;

        return {
            totalProjects,
            totalLanguages: allTargetLangs.size,
            totalStrings,
            overallProgress,
        };
    }, [projects]);

    const projectsByGroup = useMemo(() => {
        const groups = projects.reduce((acc, p) => {
            const group = p.productGroup || 'Uncategorized';
            acc[group] = (acc[group] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(groups).sort((a, b) => b[1] - a[1]);
    }, [projects]);

    const languageProgress = useMemo(() => {
        // FIX: Add `code` to the langData object type to ensure it's available for the `key` prop in the map.
        const langData: Record<string, { name: string, total: number, approved: number, code: string }> = {};
        projects.forEach(p => {
            p.targetLanguages.forEach(lang => {
                if (!langData[lang.code]) {
                    langData[lang.code] = { name: lang.name, total: 0, approved: 0, code: lang.code };
                }
                langData[lang.code].total += p.terms.length;
                p.terms.forEach(term => {
                    const translation = term.translations[lang.code];
                    if (translation && translation.status === TranslationStatus.Approved) {
                        langData[lang.code].approved++;
                    }
                });
            });
        });
        return Object.values(langData)
            .map(data => ({ ...data, percentage: data.total > 0 ? (data.approved / data.total) * 100 : 0 }))
            .sort((a, b) => b.percentage - a.percentage);
    }, [projects]);
    
    const activeJobs = useMemo(() => {
        return jobs
            .filter(j => j.status === TranslationJobStatus.InProgress)
            .map(job => {
                const project = projects.find(p => p.id === job.projectId);
                const vendor = users.find(u => u.id === job.vendorId);
                return {
                    ...job,
                    projectName: project?.name || 'Unknown',
                    langName: project?.targetLanguages.find(l => l.code === job.langCode)?.name || job.langCode,
                    vendorName: vendor?.name || 'Unknown',
                };
            })
            .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
    }, [jobs, projects, users]);

    const budget = useMemo(() => {
        const vendors = users.filter(u => u.role === 'vendor' && typeof u.costPerWord === 'number');
        if (vendors.length === 0) return { avgCost: 0, totalCost: 0 };
        
        const avgCost = vendors.reduce((sum, v) => sum + (v.costPerWord || 0), 0) / vendors.length;
        const totalWords = projects.reduce((sum, p) => {
            const projectWords = p.terms.reduce((termSum, term) => termSum + countWords(term.sourceString), 0);
            return sum + (projectWords * p.targetLanguages.length);
        }, 0);

        return { avgCost, totalCost: totalWords * avgCost };
    }, [projects, users]);

    return (
        <div className="p-8 space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-border-color flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full"><ProjectIcon className="w-6 h-6 text-blue-600" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Projects</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-border-color flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-full"><TranslateIcon className="w-6 h-6 text-green-600" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Languages</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalLanguages}</p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-border-color flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 rounded-full"><BriefcaseIcon className="w-6 h-6 text-indigo-600" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Strings</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalStrings.toLocaleString()}</p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-border-color flex items-center gap-4">
                    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-rose-100 flex items-center justify-center">
                         <span className="text-lg font-bold text-rose-600">{stats.overallProgress.toFixed(0)}%</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Overall Progress</p>
                        <p className="text-sm text-gray-500">Approved Translations</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-border-color">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Projects by Product Group</h2>
                    <div className="space-y-3">
                        {projectsByGroup.map(([group, count]) => (
                             <div key={group} className="text-sm">
                                <div className="flex justify-between mb-1">
                                    <span className="font-medium text-gray-700">{group}</span>
                                    <span className="font-semibold text-gray-500">{count} {count > 1 ? 'projects' : 'project'}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-accent h-2.5 rounded-full" style={{ width: `${(count / projects.length) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-border-color">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Language Progress (% Approved)</h2>
                    <div className="space-y-4">
                        {languageProgress.map(lang => (
                             <div key={lang.code} className="grid grid-cols-4 items-center gap-2 text-sm">
                                <span className="font-medium text-gray-700 truncate col-span-1">{lang.name}</span>
                                <div className="w-full bg-gray-200 rounded-full h-4 col-span-2">
                                    <div className="bg-green-500 h-4 rounded-full text-white text-xs flex items-center justify-center" style={{ width: `${lang.percentage}%` }}>
                                        {lang.percentage > 15 && `${lang.percentage.toFixed(0)}%`}
                                    </div>
                                </div>
                                <span className="text-right font-semibold text-gray-500">{lang.approved.toLocaleString()}/{lang.total.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Jobs & Budget */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-border-color">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Active Jobs</h2>
                    <div className="space-y-3">
                        {activeJobs.length > 0 ? activeJobs.map(job => (
                             <div key={job.id} className="p-3 bg-gray-50 rounded-md border-l-4 border-accent">
                                <p className="font-bold text-gray-800">{job.name}</p>
                                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                    <span>{job.projectName} ({job.langName})</span>
                                    <span className="font-semibold">{job.vendorName}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center py-8 text-gray-500">No active jobs found.</p>
                        )}
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-border-color">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Budget Overview</h2>
                     <div className="flex flex-col items-center justify-center h-full text-center">
                        <CurrencyDollarIcon className="w-16 h-16 text-green-500 mb-2"/>
                        <p className="text-4xl font-extrabold text-gray-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(budget.totalCost)}</p>
                        <p className="text-sm font-medium text-gray-500 mt-1">Estimated Total Cost</p>
                        <p className="text-xs text-gray-400 mt-4">Based on an average rate of {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 3 }).format(budget.avgCost)}/word across all vendors.</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
