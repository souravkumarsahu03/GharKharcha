import React from 'react';
import { RefreshCw, CheckCircle, Clock, ArrowUpRight, Sparkles } from 'lucide-react';
import type { Expense, User, ReimbursementPayment } from '../types';

interface ReimbursementsViewProps {
  expenses: Expense[];
  reimbursementPayments?: ReimbursementPayment[];
  members: User[];
  currentUser: User;
  onOpenReimburseModal: (expenseId?: string) => void;
}

export const ReimbursementsView: React.FC<ReimbursementsViewProps> = ({
  expenses,
  members,
  currentUser,
  onOpenReimburseModal,
}) => {
  const isTreasurer = currentUser.role === 'admin';

  const adminIds = members.filter((m) => m.role === 'admin').map((m) => m.id);

  // Approved expenses paid by members other than treasurer that have reimbursement owed
  const pendingReimbursementExpenses = expenses.filter(
    (e) =>
      e.approval_status === 'APPROVED' &&
      !adminIds.includes(e.paid_by) &&
      e.reimbursement_owed > e.reimbursement_paid
  );

  const completedReimbursementExpenses = expenses.filter(
    (e) =>
      e.approval_status === 'APPROVED' &&
      !adminIds.includes(e.paid_by) &&
      e.reimbursement_paid >= e.reimbursement_owed &&
      e.reimbursement_owed > 0
  );

  const totalPendingOwed = pendingReimbursementExpenses.reduce(
    (sum, e) => sum + (e.reimbursement_owed - e.reimbursement_paid),
    0
  );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white">Reimbursement Hub</h2>
          <p className="text-xs text-slate-400">Track money returned to members who paid room expenses</p>
        </div>

        {isTreasurer && (
          <button
            onClick={() => onOpenReimburseModal()}
            disabled={pendingReimbursementExpenses.length === 0}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-white text-xs font-bold shadow-lg transition ${
              pendingReimbursementExpenses.length > 0
                ? 'gradient-indigo hover:brightness-110 active:scale-95 shadow-indigo-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Process Reimbursement</span>
          </button>
        )}
      </div>

      {/* Summary Card */}
      <div className="rounded-3xl glass-panel p-5 border border-amber-500/20 bg-amber-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Total Pending Reimbursements
            </span>
            <h3 className="font-heading font-extrabold text-3xl text-white mt-0.5">
              ₹{totalPendingOwed.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {pendingReimbursementExpenses.length} approved member expense(s) awaiting treasurer payback
            </p>
          </div>
        </div>

        {totalPendingOwed === 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <Sparkles className="w-4 h-4" /> All Clear! No Pending Owed
          </div>
        )}
      </div>

      {/* Pending Reimbursements List */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-lg text-white">Pending Reimbursements</h3>

        {pendingReimbursementExpenses.length === 0 ? (
          <div className="text-center py-10 glass-panel rounded-2xl border border-slate-800">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-slate-300">No Pending Reimbursements</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              All member-paid expenses have been fully reimbursed by Treasurer Saurabh.
            </p>
          </div>
        ) : (
          pendingReimbursementExpenses.map((e) => {
            const paidMember = members.find((m) => m.id === e.paid_by);
            const remainingOwed = e.reimbursement_owed - e.reimbursement_paid;
            const isPartial = e.reimbursement_paid > 0;

            return (
              <div
                key={e.id}
                className="rounded-2xl glass-card p-4 border border-slate-800/90 space-y-3 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={paidMember?.avatar}
                      alt={paidMember?.name}
                      className="w-10 h-10 rounded-full bg-slate-800"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-white">{paidMember?.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isPartial
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {isPartial ? 'PARTIALLY REIMBURSED' : 'PENDING REIMBURSEMENT'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Expense: <strong className="text-slate-200">{e.title}</strong> ({e.category}) • {e.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-heading font-extrabold text-xl text-amber-400">
                      ₹{remainingOwed.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Total Owed: ₹{e.reimbursement_owed.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {isPartial && (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Already Paid to Member:</span>
                    <span className="font-bold text-emerald-400">
                      ₹{e.reimbursement_paid.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {/* Treasurer Reimburse Button */}
                {isTreasurer && (
                  <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                    <button
                      onClick={() => onOpenReimburseModal(e.id)}
                      className="px-3.5 py-1.5 rounded-xl gradient-indigo text-white text-xs font-bold hover:brightness-110 active:scale-95 transition flex items-center gap-1.5"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" /> Reimburse Member
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Completed Reimbursements History */}
      <div className="space-y-3 pt-4">
        <h3 className="font-heading font-bold text-lg text-white">Completed Reimbursements</h3>

        {completedReimbursementExpenses.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No completed reimbursements recorded yet.</p>
        ) : (
          completedReimbursementExpenses.map((e) => {
            const paidMember = members.find((m) => m.id === e.paid_by);

            return (
              <div
                key={e.id}
                className="flex items-center justify-between p-3.5 rounded-2xl glass-panel border border-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-white">{paidMember?.name}</h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        PAID
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Reimbursed for {e.title} ({e.category})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-heading font-bold text-sm text-emerald-400">
                    ₹{e.reimbursement_paid.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[9px] text-slate-500 mt-0.5">Fully Settled</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
