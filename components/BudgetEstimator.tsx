import React, { useState, useMemo } from 'react';
import type { Project, User } from '../types';
import { CurrencyDollarIcon } from './Icons';

interface BudgetEstimatorProps {
    projects: Project[];
    users: User[];
}

const countWords = (str: string): number => {
    if (!str || typeof str !== 'string') return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
};

const BudgetEstimator: React.FC<BudgetEstimatorProps> = ({ projects, users }) => {
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');

    const vendors = useMemo(() => users.filter(u => u.role === 'vendor' && u.status === 'Active'), [users]);
    const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);

    const languageWordCounts = useMemo(() => {
        if (!selectedProject) return [];
        return selectedProject.targetLanguages.map(lang => {
            const totalWords = selectedProject.terms.reduce((sum, term) => sum + countWords(term.sourceString), 0);
            return {
                code: lang.code,
                name: lang.name,
                wordCount: totalWords
            };
        });
    }, [selectedProject]);

    const totalWordsAllLanguages = languageWordCounts.reduce((sum, lang) => sum + lang.wordCount, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
    
    return (
        <div className="p-8">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="bg-info-bg p-4 border-l-4 border-accent rounded-t-lg flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-primary">Budget Estimator</h1>
                </div>

                <div className="p-6 space-y-8">
                    <div>
                        <label htmlFor="project-select" className="block text-sm font-bold text-gray-700 mb-2">1. Select a Project</label>
                        <select
                            id="project-select"
                            value={selectedProjectId}
                            onChange={e => setSelectedProjectId(e.target.value)}
                            className="w-full md:w-1/2 bg-gray-100 text-gray-800 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <option value="">-- Choose a Project --</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedProject && (
                        <>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">2. Word Count Summary</h2>
                                {languageWordCounts.length > 0 ? (
                                    <div className="overflow-x-auto border rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Source Words</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {languageWordCounts.map(lang => (
                                                    <tr key={lang.code}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lang.name} ({lang.code})</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{lang.wordCount.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-gray-100">
                                                <tr>
                                                    <td className="px-6 py-3 text-left text-sm font-bold text-gray-800">Total All Languages</td>
                                                    <td className="px-6 py-3 text-right text-sm font-bold text-gray-800">{totalWordsAllLanguages.toLocaleString()}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                ) : <p className="text-gray-500">This project has no target languages yet.</p> }
                            </div>

                             <div>
                                <h2 className="text-lg font-bold text-gray-800 mb-2">3. Cost Estimation per Vendor</h2>
                                {vendors.length > 0 ? (
                                    <div className="overflow-x-auto border rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (per word)</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Total Cost</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {vendors.map(vendor => {
                                                    const cost = totalWordsAllLanguages * (vendor.costPerWord || 0);
                                                    return (
                                                        <tr key={vendor.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(vendor.costPerWord || 0)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 text-right">{formatCurrency(cost)}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : <p className="text-gray-500">No active vendors found to create an estimate.</p> }
                            </div>
                        </>
                    )}

                    {!selectedProject && (
                        <div className="text-center py-20 text-gray-500">
                            <CurrencyDollarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300"/>
                            <h2 className="text-2xl font-semibold mb-2">Start by Selecting a Project</h2>
                            <p>Choose a project from the dropdown above to estimate translation costs.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BudgetEstimator;
