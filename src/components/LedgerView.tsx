import React, { useState } from 'react';
import {
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Lock,
} from 'lucide-react';
import type { Transaction, AuditLog, User } from '../types';

interface LedgerViewProps {
  transactions: Transaction[];
  auditLogs: AuditLog[];
  members: User[];
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  transactions,
  auditLogs,
  members,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'TRANSACTIONS' | 'AUDIT'>('TRANSACTIONS');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white">Room Financial Ledger</h2>
          <p className="text-xs text-slate-400">Complete transaction timeline and immutable audit logs</p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveSubTab('TRANSACTIONS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'TRANSACTIONS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Transactions ({transactions.length})
          </button>

          <button
            onClick={() => setActiveSubTab('AUDIT')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'AUDIT'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3 h-3" /> Audit Log ({auditLogs.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'TRANSACTIONS' ? (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transaction title or member..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Type Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {['ALL', 'CONTRIBUTION', 'EXPENSE', 'REIMBURSEMENT'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    typeFilter === type
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {type === 'ALL' ? 'All Types' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-2.5">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-10 glass-panel rounded-2xl border border-slate-800">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h4 className="font-bold text-slate-300">No Transactions Found</h4>
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const member = members.find((m) => m.id === tx.member_id);
                const isInflow = tx.flow === 'IN';
                const isContrib = tx.type === 'CONTRIBUTION';
                const isReimb = tx.type === 'REIMBURSEMENT';

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-slate-800/80 hover:border-slate-700/80 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl border ${
                          isInflow
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : isReimb
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {isInflow ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">{tx.title}</h4>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                              isContrib
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : isReimb
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Member: <strong className="text-slate-300">{member?.name || 'Room'}</strong> • {tx.notes || 'Transaction ledger record'} • {tx.date}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-heading font-extrabold text-base ${
                          isInflow ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {isInflow ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        {isInflow ? 'Fund Deposit' : 'Fund Outflow'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Immutable Audit Log View */
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">Immutable Financial Audit Trail</h4>
              <p className="text-purple-300 mt-0.5">
                Every financial operation, edit, approval, and reimbursement is permanently logged.
                Audit logs cannot be modified or deleted by standard users.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl glass-panel border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{log.user_name}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-purple-300 font-medium">{log.action}</p>
                {log.new_value && (
                  <p className="text-[10px] font-mono text-slate-400 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800 mt-1">
                    Details: {log.new_value}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
