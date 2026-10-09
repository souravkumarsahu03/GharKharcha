import React, { useState } from 'react';
import {
  Wallet,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  PiggyBank,
  PlusCircle,
  QrCode,
  ShieldCheck,
  XCircle,
  Eye,
  Lock,
} from 'lucide-react';
import type { FinancialSummary, User, Contribution, Expense, MonthlyCycle } from '../types';
import { MetricCard } from './MetricCard';

interface HomeDashboardProps {
  cycle: MonthlyCycle;
  summary: FinancialSummary;
  members: User[];
  contributions: Contribution[];
  expenses: Expense[];
  currentUser: User;
  onOpenPayModal: () => void;
  onOpenAddExpense: () => void;
  onApproveContribution: (contribId: string) => void;
  onRejectContribution: (contribId: string, reason: string) => void;
  onOpenReimburseModal?: (expenseId?: string) => void;
  onNavigateToTab?: (tab: any) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  cycle,
  summary,
  members,
  contributions,
  expenses,
  currentUser,
  onOpenPayModal,
  onOpenAddExpense,
  onApproveContribution,
  onRejectContribution,
}) => {
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  const isSouravAdmin = currentUser.role === 'admin';

  // My Contribution Status
  const myContrib = contributions.find((c) => c.member_id === currentUser.id);
  const isMyContribPaid = myContrib?.status === 'PAID';
  const isMyContribPartial = myContrib?.status === 'PARTIALLY_PAID';
  const isMyContribSubmitted = myContrib?.status === 'PENDING_APPROVAL';
  const isMyContribRejected = myContrib?.status === 'REJECTED';

  // Contributions pending Sourav's approval
  const pendingApprovals = contributions.filter((c) => c.status === 'PENDING_APPROVAL');

  // Owed reimbursements for member
  const getOwedForMember = (memberId: string): number => {
    return expenses
      .filter((e) => e.paid_by === memberId && e.approval_status === 'APPROVED')
      .reduce((sum, e) => sum + Math.max(0, e.reimbursement_owed - e.reimbursement_paid), 0);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Active Cycle Header Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-indigo p-6 text-white shadow-xl shadow-indigo-500/10 border border-indigo-400/20">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-md">
                Active Cycle
              </span>
              <span className="text-xs text-indigo-100 font-medium">Due: 7th of Every Month</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl mt-2 tracking-tight">
              {cycle.display_name}
            </h2>
            <p className="text-xs text-indigo-100 mt-1">
              ₹8,000 / member monthly room contribution into Super Admin Sourav's account
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isMyContribPaid && (
              <button
                onClick={onOpenPayModal}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 text-white text-xs font-extrabold shadow-lg hover:bg-emerald-400 active:scale-95 transition"
              >
                <QrCode className="w-4 h-4" />
                <span>{isMyContribPartial ? `Pay Remaining ₹${myContrib?.remaining_amount}` : 'Pay Room Contribution'}</span>
              </button>
            )}

            <button
              onClick={onOpenAddExpense}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-indigo-950 text-xs font-bold shadow-lg hover:bg-indigo-50 active:scale-95 transition"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>+ Add Room Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* MEMBER PERSONALIZED PAYMENT INTERFACE (FOR ALL USERS) */}
      <div className="rounded-3xl glass-panel-elevated p-5 border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white">
                My October Contribution (₹8,000 Target)
              </h3>
              <p className="text-xs text-slate-400">Personal monthly room payment status for {currentUser.name}</p>
            </div>
          </div>

          {/* Status Badge */}
          {isMyContribPaid && (
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-extrabold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> PAID FULL ✓
            </span>
          )}

          {isMyContribPartial && (
            <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-extrabold flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> PARTIAL (₹{myContrib?.amount} Paid)
            </span>
          )}

          {isMyContribSubmitted && (
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Awaiting Sourav's Approval ⏳
            </span>
          )}

          {!isMyContribPaid && !isMyContribPartial && !isMyContribSubmitted && (
            <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Deposit Pending
            </span>
          )}
        </div>

        {/* Action / Details Box */}
        {isMyContribPaid ? (
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between text-xs">
            <div className="space-y-1">
              <p className="font-bold text-emerald-300 text-sm">₹8,000 Contribution Verified & Received</p>
              <p className="text-slate-300">
                Paid via <strong>{myContrib?.payment_method}</strong> • Transaction UTR:{' '}
                <span className="font-mono text-emerald-400 font-bold">{myContrib?.transaction_id || 'N/A'}</span>
              </p>
            </div>
            {myContrib?.payment_screenshot_url && (
              <button
                onClick={() => setPreviewScreenshotUrl(myContrib.payment_screenshot_url!)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-semibold flex items-center gap-1 border border-emerald-500/30"
              >
                <Eye className="w-3.5 h-3.5" /> View Proof
              </button>
            )}
          </div>
        ) : isMyContribPartial ? (
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 text-xs">
              <p className="font-bold text-amber-300 text-sm">
                Partial Payment Received: ₹{myContrib?.amount.toLocaleString('en-IN')} / ₹8,000
              </p>
              <p className="text-slate-200">
                Remaining Balance Due:{' '}
                <strong className="text-amber-400 font-extrabold text-sm">
                  ₹{myContrib?.remaining_amount.toLocaleString('en-IN')}
                </strong>{' '}
                (Due in 15 days)
              </p>
              <p className="text-slate-400 text-[11px]">
                You will receive 3 automated reminder notifications during this 15-day period.
              </p>
            </div>
            <button
              onClick={onOpenPayModal}
              className="px-4 py-2.5 rounded-2xl gradient-emerald text-white text-xs font-extrabold shadow-lg shadow-emerald-500/20 hover:brightness-110 transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <QrCode className="w-4 h-4" />
              <span>Pay Remaining ₹{myContrib?.remaining_amount}</span>
            </button>
          </div>
        ) : isMyContribSubmitted ? (
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-2 text-xs">
            <div className="flex items-center justify-between text-amber-300 font-bold">
              <span>Payment Proof Submitted</span>
              <span className="text-[10px] text-slate-400">
                {myContrib?.submitted_at ? new Date(myContrib.submitted_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
            <p className="text-slate-300">
              Method: <strong>{myContrib?.payment_method}</strong> • UTR:{' '}
              <span className="font-mono text-amber-400">{myContrib?.transaction_id || 'N/A'}</span>
            </p>
            <p className="text-slate-400 text-[11px]">
              Sourav (Super Admin) will review your payment proof and approve it shortly.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-white text-sm">Deposit Room Contribution to Sourav</p>
              <p className="text-slate-400">
                Scan Sourav's PhonePe QR code or pay cash to submit payment proof for instant verification.
              </p>
            </div>
            <button
              onClick={onOpenPayModal}
              className="px-5 py-2.5 rounded-2xl gradient-emerald text-white text-xs font-extrabold shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 shrink-0"
            >
              <QrCode className="w-4 h-4" />
              <span>Pay ₹8,000 Now</span>
            </button>
          </div>
        )}

        {isMyContribRejected && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Payment Rejected by Sourav:</strong> {myContrib.rejection_reason || 'Invalid screenshot or transaction ID'}
            </div>
          </div>
        )}
      </div>

      {/* SUPER ADMIN SOURAV VERIFICATION QUEUE */}
      {isSouravAdmin && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Pending Contribution Payments to Verify</span>
              {pendingApprovals.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-extrabold border border-amber-500/30">
                  {pendingApprovals.length} Awaiting Approval
                </span>
              )}
            </h3>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="p-4 rounded-2xl glass-panel text-center text-xs text-slate-400 border border-slate-800">
              No pending contribution payments awaiting your verification.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((c) => {
                const member = members.find((m) => m.id === c.member_id);
                const payingAmount = (c as any).temp_submitting_amount || (c.amount > 0 ? c.amount : 8000);
                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl glass-panel border border-amber-500/30 bg-amber-950/10 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={member?.avatar} alt={member?.name} className="w-10 h-10 rounded-full bg-slate-800" />
                        <div>
                          <h4 className="font-bold text-base text-white">{member?.name}</h4>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Submitted ₹{payingAmount.toLocaleString('en-IN')} deposit via <strong>{c.payment_method}</strong>
                          </p>
                          <p className="text-[11px] font-mono text-amber-400 mt-0.5">
                            UTR / Tx ID: {c.transaction_id || 'CASH/HAND'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-heading font-extrabold text-xl text-emerald-400">
                          ₹{payingAmount.toLocaleString('en-IN')}
                        </span>
                        {c.payment_screenshot_url && (
                          <button
                            onClick={() => setPreviewScreenshotUrl(c.payment_screenshot_url!)}
                            className="block mt-1 text-[11px] font-semibold text-indigo-400 hover:underline"
                          >
                            View Screenshot
                          </button>
                        )}
                      </div>
                    </div>

                    {c.notes && <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2 rounded-xl">"{c.notes}"</p>}

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => onApproveContribution(c.id)}
                        className="flex-1 py-2.5 rounded-xl gradient-emerald text-white text-xs font-extrabold shadow-md hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Verify & Approve Payment
                      </button>
                      <button
                        onClick={() => onRejectContribution(c.id, 'Invalid transaction ID or screenshot')}
                        className="py-2.5 px-4 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold border border-rose-500/20 transition flex items-center justify-center gap-1"
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
      )}

      {/* Financial Core Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="Collected Fund"
          value={summary.total_collected}
          subtext={`${summary.paid_members_count}/${summary.total_members_count} members verified`}
          icon={Wallet}
          gradient="bg-emerald-500"
          iconColor="bg-emerald-500/10 text-emerald-400"
          badgeText={`Target ₹${summary.expected_contributions.toLocaleString('en-IN')}`}
        />

        <MetricCard
          title="Approved Expenses"
          value={summary.total_expenses_approved}
          subtext={`Sourav: ₹${summary.total_expenses_direct_treasurer.toLocaleString('en-IN')} | Members: ₹${summary.total_expenses_member_paid.toLocaleString('en-IN')}`}
          icon={TrendingDown}
          gradient="bg-indigo-500"
          iconColor="bg-indigo-500/10 text-indigo-400"
        />

        <MetricCard
          title="Pending Reimbursements"
          value={summary.pending_reimbursements}
          subtext={summary.pending_reimbursements > 0 ? "Owed to room members" : "All reimbursements settled"}
          icon={Clock}
          gradient="bg-amber-500"
          iconColor="bg-amber-500/10 text-amber-400"
        />

        <MetricCard
          title="Net Available Fund"
          value={summary.available_after_obligations}
          subtext={`Current fund ₹${summary.current_room_fund.toLocaleString('en-IN')} less obligations`}
          icon={PiggyBank}
          gradient="bg-purple-500"
          iconColor="bg-purple-500/10 text-purple-400"
        />
      </div>

      {/* MEMBER DEPOSIT STATUS GRID (ACCESSIBLE TO SOURAV & OVERVIEW FOR MEMBERS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">Room Members Status</h3>
            <p className="text-xs text-slate-400">Monthly ₹8,000 deposits & reimbursement balances</p>
          </div>
          {!isSouravAdmin && (
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
              <Lock className="w-3 h-3" /> Members Private Access Enforced
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {members.map((m) => {
            const contrib = contributions.find((c) => c.member_id === m.id);
            const owedAmount = getOwedForMember(m.id);
            const isPaid = contrib?.status === 'PAID';
            const isPartial = contrib?.status === 'PARTIALLY_PAID';
            const isSubmitted = contrib?.status === 'PENDING_APPROVAL';

            return (
              <div
                key={m.id}
                className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-slate-800/80 transition"
              >
                <div className="flex items-center gap-3">
                  <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full bg-slate-800" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{m.name}</h4>
                      {m.role === 'admin' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-extrabold border border-amber-500/20">
                          Super Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">UPI: {m.upi_id}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                      isPaid
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : isPartial
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : isSubmitted
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {isPaid
                      ? 'PAID FULL ✓'
                      : isPartial
                      ? `PARTIAL (₹${contrib?.amount})`
                      : isSubmitted
                      ? 'AWAITING APPROVAL'
                      : 'PENDING'}
                  </span>

                  <span className="text-[11px] text-slate-300">
                    Owed Reimbursement: <strong className={owedAmount > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>₹{owedAmount.toLocaleString('en-IN')}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Screenshot Preview Lightbox */}
      {previewScreenshotUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          onClick={() => setPreviewScreenshotUrl(null)}
        >
          <div className="relative max-w-lg w-full glass-panel-elevated rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white">Payment Screenshot Proof</h4>
              <button onClick={() => setPreviewScreenshotUrl(null)} className="p-1 text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-900 max-h-[70vh] flex items-center justify-center border border-slate-800">
              <img src={previewScreenshotUrl} alt="Payment proof" className="max-h-[65vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
