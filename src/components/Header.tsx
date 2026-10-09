import React from 'react';
import { Shield, Bell, PlusCircle, UserCheck, LogOut, QrCode } from 'lucide-react';
import type { User } from '../types';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  unreadNotificationCount: number;
  onOpenNotifications: () => void;
  onOpenPayModal: () => void;
  onOpenAddExpense: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  unreadNotificationCount,
  onOpenNotifications,
  onOpenPayModal,
  onOpenAddExpense,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-2.5 py-2.5 sm:px-4 sm:py-3 backdrop-blur-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Brand & Room Info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-indigo flex items-center justify-center text-white font-heading font-extrabold text-lg sm:text-xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/20 shrink-0">
            RS
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h1 className="font-heading font-bold text-sm sm:text-lg text-white tracking-tight truncate">GharKharcha</h1>
              <span className="hidden xs:inline-block text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20 shrink-0">
                6 Room
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">Sourav Admin Ledger</p>
          </div>
        </div>

        {/* Action Controls & Active Profile Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Pay Button */}
          <button
            onClick={onOpenPayModal}
            className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl gradient-emerald text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition"
            title="Pay Monthly Contribution ₹8,000"
          >
            <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">Pay ₹8k</span>
          </button>

          {/* Quick Add Expense Button */}
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold hover:bg-indigo-600/40 active:scale-95 transition"
            title="Add Room Expense"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden md:inline">Add Expense</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 sm:p-2 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/50 hover:bg-slate-700/80 transition"
            title="In-App Notifications"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Logged in User Pill & Logout */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/60">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-700 ring-1 ring-slate-600 shrink-0"
              />
              <span className="text-[11px] sm:text-xs font-semibold text-white max-w-[50px] sm:max-w-[70px] truncate">
                {currentUser.name}
              </span>
              {currentUser.role === 'admin' ? (
                <span title="Super Admin"><Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" /></span>
              ) : (
                <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-1.5 sm:p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 active:scale-95 transition flex items-center gap-1"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden lg:inline text-xs font-bold">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
