import React, { useState } from 'react';
import {
  PlusCircle,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Receipt as ReceiptIcon,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import type { Expense, User, CategoryItem } from '../types';

interface ExpensesViewProps {
  expenses: Expense[];
  categories: CategoryItem[];
  members: User[];
  currentUser: User;
  onOpenAddExpense: () => void;
  onApproveExpense: (expenseId: string) => void;
  onRejectExpense: (expenseId: string, reason: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  categories,
  members,
  currentUser,
  onOpenAddExpense,
  onApproveExpense,
  onRejectExpense,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<{ url: string; title: string } | null>(null);
  const [rejectingExpenseId, setRejectingExpenseId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const isTreasurer = currentUser.role === 'admin';

  // Filter logic
  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'PENDING' && e.approval_status === 'PENDING') ||
      (selectedStatus === 'APPROVED' && e.approval_status === 'APPROVED') ||
      (selectedStatus === 'REJECTED' && e.approval_status === 'REJECTED');
    return matchesCat && matchesStatus;
  });

  const handleConfirmReject = (expenseId: string) => {
    if (!rejectionReason.trim()) return;
    onRejectExpense(expenseId, rejectionReason);
    setRejectingExpenseId(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-white">Room Expenses</h2>
          <p className="text-xs text-slate-400">All submitted room purchases, receipts & approval statuses</p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl gradient-emerald text-white text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Room Expense</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedStatus === st
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Expenses' : st}
            </button>
          ))}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
              selectedCategory === 'ALL'
                ? 'bg-slate-200 text-slate-900 font-bold border-white'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
                selectedCategory === c.name
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-2xl border border-slate-800">
            <Tag className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-300">No Expenses Found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your category or approval filter.
            </p>
          </div>
        ) : (
          filteredExpenses.map((e) => {
            const paidMember = members.find((m) => m.id === e.paid_by);
            const isExpanded = expandedExpenseId === e.id;
            const isPending = e.approval_status === 'PENDING';
            const isApproved = e.approval_status === 'APPROVED';
            const isRejected = e.approval_status === 'REJECTED';

            return (
              <div
                key={e.id}
                className="rounded-2xl glass-card border border-slate-800/90 overflow-hidden transition"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 border border-slate-700">
                          {e.category}
                        </span>

                        {/* Approval Status Badge */}
                        {isApproved && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {isPending && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-white tracking-tight">{e.title}</h3>
                      {e.description && <p className="text-xs text-slate-300">{e.description}</p>}
                    </div>

                    <div className="text-right">
                      <span className="font-heading font-extrabold text-xl text-white">
                        ₹{e.amount.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{e.date}</p>
                    </div>
                  </div>

                  {/* Submitter & Payment Method Details */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2">
                      <img src={paidMember?.avatar} alt={paidMember?.name} className="w-5 h-5 rounded-full" />
                      <span className="text-slate-300 font-medium">
                        Paid by <strong className="text-white">{paidMember?.name}</strong> via{' '}
                        <strong className="text-indigo-300">{e.payment_method}</strong>
                      </span>
                    </div>

                    {/* Attachments Preview Buttons */}
                    <div className="flex items-center gap-1.5">
                      {e.payment_screenshot_url && (
                        <button
                          onClick={() =>
                            setPreviewMediaUrl({
                              url: e.payment_screenshot_url!,
                              title: `Payment Screenshot (${e.title})`,
                            })
                          }
                          className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-[10px] font-semibold flex items-center gap-1 border border-indigo-500/20"
                        >
                          <ImageIcon className="w-3 h-3" /> Screenshot
                        </button>
                      )}

                      {e.receipt_url && (
                        <button
                          onClick={() =>
                            setPreviewMediaUrl({
                              url: e.receipt_url!,
                              title: `Receipt / Bill Photo (${e.title})`,
                            })
                          }
                          className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-semibold flex items-center gap-1 border border-emerald-500/20"
                        >
                          <ReceiptIcon className="w-3 h-3" /> Receipt
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Item Breakdown Expander */}
                  {e.items && e.items.length > 0 && (
                    <div>
                      <button
                        onClick={() => setExpandedExpenseId(isExpanded ? null : e.id)}
                        className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 pt-1"
                      >
                        <span>
                          {isExpanded ? 'Hide' : 'View'} Purchased Items ({e.items.length})
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                          {e.items.map((it) => (
                            <div key={it.id} className="flex items-center justify-between text-xs">
                              <span className="text-slate-300">• {it.name}</span>
                              <span className="font-semibold text-slate-200">
                                ₹{it.amount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rejection Reason Display if Rejected */}
                  {isRejected && e.rejection_reason && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                      <div>
                        <strong className="font-bold">Rejection Reason:</strong> {e.rejection_reason}
                      </div>
                    </div>
                  )}

                  {/* Admin Approval Actions */}
                  {isTreasurer && isPending && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => onApproveExpense(e.id)}
                        className="flex-1 py-2 rounded-xl gradient-emerald text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve Expense
                      </button>

                      <button
                        onClick={() => setRejectingExpenseId(e.id)}
                        className="flex-1 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold border border-rose-500/20 active:scale-95 transition flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal Prompt */}
      {rejectingExpenseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm glass-panel-elevated rounded-3xl p-5 space-y-4">
            <h3 className="font-heading font-bold text-lg text-white">Reject Room Expense</h3>
            <p className="text-xs text-slate-300">Please provide a reason for rejecting this expense:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Duplicate receipt or personal purchase..."
              className="w-full h-24 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRejectingExpenseId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmReject(rejectingExpenseId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Receipt/Screenshot Media */}
      {previewMediaUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <div className="relative max-w-lg w-full glass-panel-elevated rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white">{previewMediaUrl.title}</h4>
              <button
                onClick={() => setPreviewMediaUrl(null)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-900 max-h-[70vh] flex items-center justify-center border border-slate-800">
              <img
                src={previewMediaUrl.url}
                alt="Uploaded proof"
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
