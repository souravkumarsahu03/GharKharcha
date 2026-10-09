import React, { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import type { User } from '../types';

interface LoginPageProps {
  members: User[];
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ members, onLogin }) => {
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = nameInput.trim().toLowerCase();
    const trimmedPass = passwordInput.trim();

    const foundUser = members.find(
      (m) => m.name.toLowerCase() === trimmedName && m.phone === trimmedPass
    );

    if (foundUser) {
      onLogin(foundUser);
    } else {
      setErrorMessage('Invalid User ID (Name) or Password (Mobile Number). Please check and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl gradient-indigo flex items-center justify-center text-white font-heading font-extrabold text-3xl shadow-xl shadow-indigo-500/20 mx-auto ring-1 ring-white/20">
            RS
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-white tracking-tight">RoomSplit</h1>
          <p className="text-xs text-slate-400 font-medium">Shared Room Financial Ledger & Monthly Contributions</p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-3xl glass-panel-elevated p-6 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <LogIn className="w-5 h-5 text-indigo-400" />
            <h2 className="font-heading font-bold text-lg text-white">Sign In to Room Account</h2>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                User ID (Your Name)*
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Sourav or Suraj or Mahesh"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                Password (Your Mobile Number)*
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl gradient-indigo text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Room</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
