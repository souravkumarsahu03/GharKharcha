import React from 'react';
import { Home, Receipt, RefreshCw, FileText, User, ShieldCheck } from 'lucide-react';
import type { MemberRole } from '../types';

export type TabType = 'HOME' | 'EXPENSES' | 'REIMBURSEMENTS' | 'LEDGER' | 'PROFILE' | 'ADMIN';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userRole: MemberRole;
  pendingApprovalsCount: number;
  pendingReimbursementsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  pendingApprovalsCount,
  pendingReimbursementsCount,
}) => {
  const tabs = [
    { id: 'HOME' as TabType, label: 'Home', icon: Home },
    { id: 'EXPENSES' as TabType, label: 'Expenses', icon: Receipt, badge: pendingApprovalsCount },
    { id: 'REIMBURSEMENTS' as TabType, label: 'Reimburse', icon: RefreshCw, badge: pendingReimbursementsCount },
    { id: 'LEDGER' as TabType, label: 'Ledger', icon: FileText },
    { id: 'PROFILE' as TabType, label: 'My View', icon: User },
    ...(userRole === 'admin'
      ? [{ id: 'ADMIN' as TabType, label: 'Admin', icon: ShieldCheck, isHighlight: true }]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-800/80 px-2 py-1.5 pb-safe shadow-2xl backdrop-blur-xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? tab.isHighlight
                    ? 'text-amber-400 bg-amber-500/10 font-bold scale-105'
                    : 'text-indigo-400 bg-indigo-500/10 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold px-1 flex items-center justify-center ring-2 ring-slate-900">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">{tab.label}</span>
              {isActive && (
                <span className={`w-1 h-1 rounded-full mt-0.5 ${tab.isHighlight ? 'bg-amber-400' : 'bg-indigo-400'}`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
