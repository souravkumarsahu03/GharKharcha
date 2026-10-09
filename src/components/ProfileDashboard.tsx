import React from 'react';
import {
  CheckCircle2,
  Clock,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import type { User, Contribution, Expense, ReimbursementPayment } from '../types';

interface ProfileDashboardProps {
  currentUser: User;
  contributions: Contribution[];
  expenses: Expense[];
  reimbursementPayments?: ReimbursementPayment[];
  onLogout?: () => void;
  onRefreshCloud?: () => void;
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  currentUser,
  contributions,
  expenses,
  onLogout,
  onRefreshCloud,
}) => {
  // My Contribution
  const myContrib = contributions.find((c) => c.member_id === currentUser.id);
  const isPaid = myContrib?.status === 'PAID';

  // My Expenses Submitted
  const myExpenses = expenses.filter((e) => e.paid_by === currentUser.id);
  const totalMyExpenses = myExpenses
    .filter((e) => e.approval_status === 'APPROVED')
    .reduce((sum, e) => sum + e.amount, 0);

  // My Pending Reimbursements
  const myPendingReimbursements = myExpenses
    .filter((e) => e.approval_status === 'APPROVED')
    .reduce((sum, e) => sum + Math.max(0, e.reimbursement_owed - e.reimbursement_paid), 0);

  // My Received Reimbursements
  const myReceivedReimbursements = myExpenses
    .filter((e) => e.approval_status === 'APPROVED')
    .reduce((sum, e) => sum + e.reimbursement_paid, 0);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Profile Info Banner */}
      <div className="rounded-3xl glass-panel-elevated p-6 border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full bg-slate-800 ring-4 ring-indigo-500/30 shadow-xl"
            />

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="font-heading font-extrabold text-2xl text-white">{currentUser.name}</h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}
                >
                  {currentUser.role === 'admin' ? 'Super Admin' : 'Room Member'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
              <p className="text-xs text-slate-400 font-medium">UPI: {currentUser.upi_id || 'Not set'}</p>
            </div>
          </div>

          {/* Action buttons (Logout & Refresh) */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onRefreshCloud && (
              <button
                onClick={onRefreshCloud}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-bold hover:bg-indigo-500/20 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Cloud</span>
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold hover:bg-rose-500/30 active:scale-95 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Deposit Status Card */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              {isPaid ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-heading font-bold text-white text-base">October 2026 Room Deposit</h4>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    isPaid
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {isPaid ? 'DEPOSIT PAID' : 'DEPOSIT PENDING'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isPaid
                  ? `Paid on ${myContrib?.paid_at ? new Date(myContrib.paid_at).toLocaleDateString('en-IN') : 'recently'} via ${myContrib?.payment_method || 'UPI'}`
                  : 'Due on 7th of every month into Sourav’s account'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Member Expense Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-medium">Expenses I Submitted</span>
          <h4 className="font-heading font-extrabold text-2xl text-white mt-1">
            ₹{totalMyExpenses.toLocaleString('en-IN')}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">{myExpenses.length} Total Submissions</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs text-amber-400 uppercase font-medium">Reimbursements Owed to Me</span>
          <h4 className="font-heading font-extrabold text-2xl text-amber-400 mt-1">
            ₹{myPendingReimbursements.toLocaleString('en-IN')}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Pending payout from Sourav</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800">
          <span className="text-xs text-emerald-400 uppercase font-medium">Reimbursements Received</span>
          <h4 className="font-heading font-extrabold text-2xl text-emerald-400 mt-1">
            ₹{myReceivedReimbursements.toLocaleString('en-IN')}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Settled by Treasurer</p>
        </div>
      </div>

      {/* List of Submitted Expenses by Member */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-lg text-white">Expenses Submitted by Me</h3>
        {myExpenses.length === 0 ? (
          <p className="text-xs text-slate-500 italic">You haven't submitted any room expenses yet.</p>
        ) : (
          myExpenses.map((e) => (
            <div key={e.id} className="p-3.5 rounded-2xl glass-panel border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white text-sm">{e.title}</span>
                <span className="font-bold text-indigo-300">₹{e.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {e.category} • {e.date}
                </span>
                <span
                  className={`font-semibold ${
                    e.approval_status === 'APPROVED'
                      ? 'text-emerald-400'
                      : e.approval_status === 'REJECTED'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  Status: {e.approval_status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Prominent Footer Logout Button */}
      {onLogout && (
        <div className="pt-4 flex justify-center">
          <button
            onClick={onLogout}
            className="w-full max-w-sm flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 active:scale-95 transition font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out of Account</span>
          </button>
        </div>
      )}
    </div>
  );
};
