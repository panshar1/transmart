import React, { useState } from 'react';
import { TranslateIcon } from './Icons';
import type { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
  users: User[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user && password) {
        setError('');
        onLogin(user);
    } else {
        setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex bg-secondary">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/3 bg-primary items-center justify-center p-12 text-white relative flex-col text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent to-primary opacity-20"></div>
        <div className="z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl font-bold">TransSmart</span>
          </div>
          <p className="text-lg text-slate-300">
            Intelligent, streamlined, and collaborative translation management for the modern enterprise.
          </p>
        </div>
      </div>
      
      {/* Right Panel - Form */}
      <div className="w-full lg:w-2/3 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
            <div className="text-center mb-8 lg:hidden">
                <h1 className="text-3xl font-bold text-gray-800">TransSmart</h1>
            </div>
            <div className="bg-white rounded-xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <TranslateIcon className="w-12 h-12 text-accent mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                    <p className="text-gray-500 mt-1">Sign in to your account</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Email Address
                    </label>
                    <div className="mt-1">
                        <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g., kishore@example.com"
                        className="w-full bg-gray-100 text-gray-800 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent transition"
                        />
                    </div>
                    </div>

                    <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Password
                    </label>
                    <div className="mt-1">
                        <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="any password will work"
                        className="w-full bg-gray-100 text-gray-800 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent transition"
                        />
                    </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                    >
                        Sign In
                    </button>
                    </div>
                </form>
                <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
                    <p className="font-semibold text-center mb-3">Demo Accounts (any password works):</p>
                    <ul className="space-y-2 text-center">
                        <li><b>Admin:</b> <code className="bg-gray-100 px-2 py-1 rounded">kishore@example.com</code></li>
                        <li><b>LPM:</b> <code className="bg-gray-100 px-2 py-1 rounded">manohar@example.com</code></li>
                        <li><b>Vendor:</b> <code className="bg-gray-100 px-2 py-1 rounded">contact@depro.com</code></li>
                        <li><b>Translator:</b> <code className="bg-gray-100 px-2 py-1 rounded">helga.s@depro.com</code></li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;