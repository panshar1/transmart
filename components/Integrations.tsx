import React, { useState } from 'react';
import { GitBranchIcon, CurrencyDollarIcon, CheckIcon, GitHubIcon, GitLabIcon, BitbucketIcon } from './Icons';

const Integrations: React.FC = () => {
    // Business Tools State
    const [valueEdgeUrl, setValueEdgeUrl] = useState('');
    const [valueEdgeKey, setValueEdgeKey] = useState('');
    const [valueEdgeConnected, setValueEdgeConnected] = useState(false);
    
    const [financeUrl, setFinanceUrl] = useState('');
    const [financeKey, setFinanceKey] = useState('');
    const [financeConnected, setFinanceConnected] = useState(false);
    
    // Source Control State
    const [githubUrl, setGithubUrl] = useState('');
    const [githubKey, setGithubKey] = useState('');
    const [githubConnected, setGithubConnected] = useState(false);
    
    const [gitlabUrl, setGitlabUrl] = useState('');
    const [gitlabKey, setGitlabKey] = useState('');
    const [gitlabConnected, setGitlabConnected] = useState(false);

    const [bitbucketUser, setBitbucketUser] = useState('');
    const [bitbucketKey, setBitbucketKey] = useState('');
    const [bitbucketConnected, setBitbucketConnected] = useState(false);


    // Business Tools Handlers
    const handleConnectValueEdge = (e: React.FormEvent) => {
        e.preventDefault();
        if (valueEdgeUrl && valueEdgeKey) setValueEdgeConnected(true);
    };

    const handleConnectFinance = (e: React.FormEvent) => {
        e.preventDefault();
        if (financeUrl && financeKey) setFinanceConnected(true);
    };
    
    // Source Control Handlers
    const handleConnectGitHub = (e: React.FormEvent) => {
        e.preventDefault();
        if (githubUrl && githubKey) setGithubConnected(true);
    };

    const handleConnectGitLab = (e: React.FormEvent) => {
        e.preventDefault();
        if (gitlabUrl && gitlabKey) setGitlabConnected(true);
    };
    
    const handleConnectBitbucket = (e: React.FormEvent) => {
        e.preventDefault();
        if (bitbucketUser && bitbucketKey) setBitbucketConnected(true);
    };
    
    return (
        <div className="p-8">
             <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="bg-info-bg p-4 border-l-4 border-accent rounded-t-lg">
                    <h1 className="text-2xl font-bold text-primary">Integrations</h1>
                </div>

                <div className="p-6">
                    {/* Source Control Section */}
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6">Source Control</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {/* GitHub Card */}
                            <div className="bg-white border rounded-lg p-6 shadow-md">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-gray-100 p-3 rounded-full"><GitHubIcon className="w-8 h-8 text-gray-800"/></div>
                                    <div><h2 className="text-xl font-bold text-gray-900">GitHub</h2><p className="text-sm text-gray-500">Sync files from your GitHub repos.</p></div>
                                </div>
                                <form onSubmit={handleConnectGitHub} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Repository URL</label>
                                        <input type="text" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/user/repo" className="mt-1 w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent" disabled={githubConnected}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Personal Access Token</label>
                                        <input type="password" value={githubKey} onChange={e => setGithubKey(e.target.value)} placeholder="••••••••••••••••••••" className="mt-1 w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent" disabled={githubConnected}/>
                                    </div>
                                    <button type="submit" disabled={githubConnected} className="w-full flex justify-center items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {githubConnected && <CheckIcon className="w-5 h-5"/>}{githubConnected ? 'Connected' : 'Connect'}
                                    </button>
                                </form>
                            </div>
                            
                            {/* GitLab Card */}
                            <div className="bg-white border rounded-lg p-6 shadow-md">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2 rounded-full"><GitLabIcon className="w-10 h-10"/></div>
                                    <div><h2 className="text-xl font-bold text-gray-900">GitLab</h2><p className="text-sm text-gray-500">Sync files from your GitLab repos.</p></div>
                                </div>
                                <form onSubmit={handleConnectGitLab} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Instance URL</label>
                                        <input type="text" value={gitlabUrl} onChange={e => setGitlabUrl(e.target.value)} placeholder="https://gitlab.com" className="mt-1 w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent" disabled={gitlabConnected}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Personal Access Token</label>
                                        <input type="password" value={gitlabKey} onChange={e => setGitlabKey(e.target.value)} placeholder="••••••••••••••••••••" className="mt-1 w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent" disabled={gitlabConnected}/>
                                    </div>
                                    <button type="submit" disabled={gitlabConnected} className="w-full flex justify-center items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {gitlabConnected && <CheckIcon className="w-5 h-5"/>}{gitlabConnected ? 'Connected' : 'Connect'}
                                    </button>
                                </form>
                            </div>

                            {/* Bitbucket Card */}
                            <div className="bg-white border rounded-lg p-6 shadow-md">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-blue-800 p-3 rounded-full"><BitbucketIcon className="w-8 h-8 text-white"/></div>
                                    <div><h2 className="text-xl font-bold text-gray-900">Bitbucket</h2><p className="text-sm text-gray-500">Sync files from your Bitbucket repos.</p></div>
                                </div>
                                <form onSubmit={handleConnectBitbucket} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Username</label>
                                        <input type="text" value={bitbucketUser} onChange={e => setBitbucketUser(e.target.value)} placeholder="your-username" className="mt-1 w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent" disabled={bitbucketConnected}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">App Password</label>
                                        <input type="password" value={bitbucketKey} onChange={e => setBitbucketKey(e.target.value)} placeholder="••••••••••••••••••••" className="mt-1 w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent" disabled={bitbucketConnected}/>
                                    </div>
                                    <button type="submit" disabled={bitbucketConnected} className="w-full flex justify-center items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {bitbucketConnected && <CheckIcon className="w-5 h-5"/>}{bitbucketConnected ? 'Connected' : 'Connect'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Business Tools Section */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6">Business Tools</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {/* ValueEdge Card */}
                            <div className="bg-white border rounded-lg p-6 shadow-md">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-blue-100 p-3 rounded-full"><GitBranchIcon className="w-8 h-8 text-blue-600"/></div>
                                    <div><h2 className="text-xl font-bold text-gray-900">ValueEdge</h2><p className="text-sm text-gray-500">Sync translation jobs with your Agile planning tool.</p></div>
                                </div>
                                <form onSubmit={handleConnectValueEdge} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Instance URL</label>
                                        <input type="text" value={valueEdgeUrl} onChange={e => setValueEdgeUrl(e.target.value)} placeholder="https://valueedge.opentext.com" className="mt-1 w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent" disabled={valueEdgeConnected}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">API Key</label>
                                        <input type="password" value={valueEdgeKey} onChange={e => setValueEdgeKey(e.target.value)} placeholder="••••••••••••••••••••" className="mt-1 w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent" disabled={valueEdgeConnected}/>
                                    </div>
                                    <button type="submit" disabled={valueEdgeConnected} className="w-full flex justify-center items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {valueEdgeConnected && <CheckIcon className="w-5 h-5"/>}{valueEdgeConnected ? 'Connected' : 'Connect'}
                                    </button>
                                </form>
                            </div>

                            {/* Finance Tool Card */}
                            <div className="bg-white border rounded-lg p-6 shadow-md">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-green-100 p-3 rounded-full"><CurrencyDollarIcon className="w-8 h-8 text-green-600"/></div>
                                    <div><h2 className="text-xl font-bold text-gray-900">OpenText™ Finance</h2><p className="text-sm text-gray-500">Sync budget estimates and costs with your finance tool.</p></div>
                                </div>
                                <form onSubmit={handleConnectFinance} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">API Endpoint</label>
                                        <input type="text" value={financeUrl} onChange={e => setFinanceUrl(e.target.value)} placeholder="https://api.finance.opentext.com" className="mt-1 w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent" disabled={financeConnected}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Authentication Token</label>
                                        <input type="password" value={financeKey} onChange={e => setFinanceKey(e.target.value)} placeholder="••••••••••••••••••••" className="mt-1 w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent" disabled={financeConnected}/>
                                    </div>
                                    <button type="submit" disabled={financeConnected} className="w-full flex justify-center items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {financeConnected && <CheckIcon className="w-5 h-5"/>}{financeConnected ? 'Connected' : 'Connect'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Integrations;
