import React, { useState } from 'react';
import {
  PlusCircle,
  FileDown,
  Play,
  Database,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  Wallet,
} from 'lucide-react';
import type { FinancialSummary, Expense, User, MonthlyCycle, Contribution, Transaction } from '../types';
import { generatePDFReport, generateCSVReport, generateExcelReport } from '../lib/reports';

interface AdminDashboardProps {
  cycle: MonthlyCycle;
  summary: FinancialSummary;
  expenses: Expense[];
  members: User[];
  contributions: Contribution[];
  transactions: Transaction[];
  onOpenAddExpense: () => void;
  onOpenRecordContribution: () => void;
  onOpenReimburseModal: () => void;
  onOpenTestScenario: () => void;
  onApproveExpense: (expenseId: string) => void;
  onRejectExpense: (expenseId: string, reason: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  cycle,
  summary,
  expenses,
  members,
  contributions,
  transactions,
  onOpenAddExpense,
  onOpenRecordContribution,
  onOpenReimburseModal,
  onOpenTestScenario,
  onApproveExpense,
  onRejectExpense,
}) => {
  const [showSqlSchemaModal, setShowSqlSchemaModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const pendingApprovals = expenses.filter((e) => e.approval_status === 'PENDING');

  const handleCopySql = () => {
    fetch('/schema.sql')
      .then((res) => res.text())
      .then((sql) => {
        navigator.clipboard.writeText(sql);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2000);
      });
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Admin Header Banner */}
      <div className="rounded-3xl gradient-amber p-6 text-slate-950 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-400">
                Super Admin Panel
              </span>
              <span className="text-xs font-bold text-slate-900">Sourav (Treasurer)</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl mt-2 tracking-tight text-slate-950">
              Financial Administration
            </h2>
            <p className="text-xs text-slate-900 mt-1 font-medium">
              Manage room fund, verify member ₹8,000 deposits, approve expenses & issue reimbursements
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenTestScenario}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-900 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current text-purple-400" />
              <span>Run Verification Suite</span>
            </button>

            <button
              onClick={() => setShowSqlSchemaModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-950/20 text-slate-950 border border-slate-950/30 text-xs font-bold hover:bg-slate-950/30 transition"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Supabase Schema</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenRecordContribution}
          className="p-3.5 rounded-2xl glass-card border border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-500/40 text-left space-y-1 transition"
        >
          <Wallet className="w-5 h-5 text-emerald-400" />
          <h4 className="font-bold text-xs text-white">Record Deposit</h4>
          <p className="text-[10px] text-slate-400">Log member contribution</p>
        </button>

        <button
          onClick={onOpenAddExpense}
          className="p-3.5 rounded-2xl glass-card border border-indigo-500/20 bg-indigo-950/10 hover:border-indigo-500/40 text-left space-y-1 transition"
        >
          <PlusCircle className="w-5 h-5 text-indigo-400" />
          <h4 className="font-bold text-xs text-white">Add Expense</h4>
          <p className="text-[10px] text-slate-400">Record room purchase</p>
        </button>

        <button
          onClick={onOpenReimburseModal}
          className="p-3.5 rounded-2xl glass-card border border-amber-500/20 bg-amber-950/10 hover:border-amber-500/40 text-left space-y-1 transition"
        >
          <RefreshCw className="w-5 h-5 text-amber-400" />
          <h4 className="font-bold text-xs text-white">Reimburse</h4>
          <p className="text-[10px] text-slate-400">Pay back member</p>
        </button>

        <button
          onClick={() => generatePDFReport(cycle, summary, members, contributions, expenses, transactions)}
          className="p-3.5 rounded-2xl glass-card border border-purple-500/20 bg-purple-950/10 hover:border-purple-500/40 text-left space-y-1 transition"
        >
          <FileDown className="w-5 h-5 text-purple-400" />
          <h4 className="font-bold text-xs text-white">PDF Report</h4>
          <p className="text-[10px] text-slate-400">Download statement</p>
        </button>
      </div>

      {/* Expenses Awaiting Approval Box */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
            <span>Expenses Awaiting Approval</span>
            {pendingApprovals.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                {pendingApprovals.length} Pending
              </span>
            )}
          </h3>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="p-5 rounded-2xl glass-panel text-center text-xs text-slate-400 border border-slate-800">
            No expenses awaiting approval at this time.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map((e) => {
              const paidMember = members.find((m) => m.id === e.paid_by);
              return (
                <div
                  key={e.id}
                  className="p-4 rounded-2xl glass-panel border border-amber-500/30 bg-amber-950/10 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {e.category}
                      </span>
                      <h4 className="font-bold text-base text-white mt-1">{e.title}</h4>
                      <p className="text-xs text-slate-300">
                        Submitted by <strong className="text-white">{paidMember?.name}</strong> • Paid via{' '}
                        {e.payment_method} • {e.date}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-heading font-extrabold text-xl text-amber-400">
                        ₹{e.amount.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Reimbursement requested: ₹{e.reimbursement_owed.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => onApproveExpense(e.id)}
                      className="flex-1 py-2 rounded-xl gradient-emerald text-white text-xs font-bold hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => onRejectExpense(e.id, 'Rejected by admin Sourav')}
                      className="flex-1 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold border border-rose-500/20 transition flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export Reports Buttons */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <h4 className="font-bold text-sm text-white">Export Real-Time Monthly Statement</h4>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => generatePDFReport(cycle, summary, members, contributions, expenses, transactions)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition"
          >
            Export PDF Report
          </button>

          <button
            onClick={() => generateCSVReport(cycle, summary, members, contributions, expenses)}
            className="px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition"
          >
            Export CSV
          </button>

          <button
            onClick={() => generateExcelReport(cycle, summary, members, contributions, expenses, transactions)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition"
          >
            Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Supabase Schema Modal */}
      {showSqlSchemaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl glass-panel-elevated rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-white">Supabase SQL Migration Schema</h3>
              <button
                onClick={() => setShowSqlSchemaModal(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Run this complete SQL script in your Supabase SQL Editor for PostgreSQL tables with Sourav Super Admin permissions:
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 h-48 overflow-y-auto text-[11px] font-mono text-slate-300">
              <pre className="whitespace-pre-wrap">
                {`-- RoomSplit Supabase Migration (Sourav Super Admin)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL DEFAULT 'Bachelor Room',
  monthly_contribution NUMERIC(10,2) NOT NULL DEFAULT 8000.00,
  treasurer_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="/schema.sql"
                download="schema.sql"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500"
              >
                Download schema.sql
              </a>
              <button
                onClick={handleCopySql}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
