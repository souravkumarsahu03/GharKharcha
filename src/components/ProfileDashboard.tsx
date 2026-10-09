import React from 'react';
import {
  CheckCircle2,
  Clock,
} from 'lucide-react';
import type { User, Contribution, Expense, ReimbursementPayment } from '../types';

interface ProfileDashboardProps {
  currentUser: User;
  contributions: Contribution[];
  expenses: Expense[];
  reimbursementPayments?: ReimbursementPayment[];
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  currentUser,
  contributions,
  expenses,
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
                {currentUser.role === 'admin' ? 'Admin / Treasurer' : 'Room Member'}
              </span>
            </div>

            <p className="text-xs text-slate-300">
              UPI: <strong className="text-indigo-300">{currentUser.upi_id}</strong> • Phone:{' '}
              <strong className="text-slate-200">{currentUser.phone}</strong>
            </p>
            <p className="text-xs text-slate-400">{currentUser.email}</p>
          </div>
        </div>
      </div>

      {/* Contribution Status Banner */}
      <div className="space-y-2">
        <h3 className="font-heading font-bold text-lg text-white">My Monthly Contribution</h3>
        <div className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              {isPaid ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white">₹8,000 / month</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
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
                  : 'Due on 7th of every month into Saurabh’s account'}
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
          <p className="text-[11px] text-slate-400 mt-0.5">{myExpenses.length} total submissions</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-amber-500/20 bg-amber-950/10">
          <span className="text-xs text-amber-400 uppercase font-medium">Reimbursements Owed to Me</span>
          <h4 className="font-heading font-extrabold text-2xl text-amber-400 mt-1">
            ₹{myPendingReimbursements.toLocaleString('en-IN')}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Pending payback from Treasurer</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-emerald-500/20 bg-emerald-950/10">
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
    </div>
  );
};
