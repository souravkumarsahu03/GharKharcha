import React, { useState, useEffect } from 'react';
import { RefreshCw, X, Camera, Sparkles, Banknote } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Expense, User } from '../types';
import { uploadMediaFile } from '../lib/supabase';

interface ReimburseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  members: User[];
  defaultExpenseId?: string;
  onRecordReimbursement: (
    expenseId: string,
    paidAmount: number,
    paymentMethod: any,
    transactionId?: string,
    paymentScreenshotUrl?: string,
    notes?: string
  ) => void;
}

export const ReimburseModal: React.FC<ReimburseModalProps> = ({
  isOpen,
  onClose,
  expenses,
  members,
  defaultExpenseId,
  onRecordReimbursement,
}) => {
  // Identify Admin User IDs (Sourav) so direct admin spends aren't treated as member reimbursements
  const adminIds = members.filter((m) => m.role === 'admin').map((m) => m.id);

  // Filter approved expenses paid by members that are owed money
  const reimbursableExpenses = expenses.filter(
    (e) =>
      e.approval_status === 'APPROVED' &&
      !adminIds.includes(e.paid_by) &&
      e.reimbursement_owed > e.reimbursement_paid
  );

  const [selectedExpenseId, setSelectedExpenseId] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash' | 'Other'>('UPI');
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Synchronize selected expense and default payment amount when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      const validExpenseId =
        defaultExpenseId && reimbursableExpenses.some((e) => e.id === defaultExpenseId)
          ? defaultExpenseId
          : reimbursableExpenses[0]?.id || '';

      setSelectedExpenseId(validExpenseId);

      const targetExp = expenses.find((e) => e.id === validExpenseId);
      if (targetExp) {
        setPaidAmount((targetExp.reimbursement_owed - targetExp.reimbursement_paid).toString());
      } else {
        setPaidAmount('0');
      }

      setTransactionId('');
      setPaymentScreenshotUrl('');
      setNotes('');
    }
  }, [isOpen, defaultExpenseId, expenses]);

  if (!isOpen) return null;

  const isCash = paymentMethod === 'Cash';
  const selectedExpense = expenses.find((e) => e.id === selectedExpenseId);
  const selectedMember = members.find((m) => m.id === selectedExpense?.paid_by);
  const remainingOwed = selectedExpense
    ? Math.max(0, selectedExpense.reimbursement_owed - selectedExpense.reimbursement_paid)
    : 0;

  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const url = await uploadMediaFile(e.target.files[0], 'screenshots');
        setPaymentScreenshotUrl(url);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(paidAmount);
    if (!selectedExpenseId || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onRecordReimbursement(
      selectedExpenseId,
      parsedAmount,
      paymentMethod,
      isCash ? undefined : (transactionId || undefined),
      isCash ? undefined : (paymentScreenshotUrl || undefined),
      notes || undefined
    );

    // Trigger celebration confetti animation
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md glass-panel-elevated rounded-3xl p-5 my-8 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white">Reimburse Room Member</h3>
              <p className="text-xs text-slate-400">Pay back member for verified room expenses</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {showSuccessToast ? (
          <div className="py-10 text-center space-y-3">
            <Sparkles className="w-14 h-14 text-amber-400 mx-auto animate-bounce" />
            <h4 className="font-heading font-bold text-xl text-white">Reimbursement Recorded!</h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              ₹{parseFloat(paidAmount).toLocaleString('en-IN')} successfully reimbursed to{' '}
              <strong className="text-amber-400">{selectedMember?.name}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Select Pending Expense*</label>
              <select
                value={selectedExpenseId}
                onChange={(e) => {
                  const targetId = e.target.value;
                  setSelectedExpenseId(targetId);
                  const exp = expenses.find((ex) => ex.id === targetId);
                  if (exp) {
                    setPaidAmount((exp.reimbursement_owed - exp.reimbursement_paid).toString());
                  }
                }}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
              >
                {reimbursableExpenses.length === 0 ? (
                  <option value="">No pending member reimbursements</option>
                ) : (
                  reimbursableExpenses.map((ex) => {
                    const m = members.find((mb) => mb.id === ex.paid_by);
                    const rem = ex.reimbursement_owed - ex.reimbursement_paid;
                    return (
                      <option key={ex.id} value={ex.id}>
                        {m?.name} — {ex.title} (₹{rem.toLocaleString('en-IN')} remaining)
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            {selectedExpense && (
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Expense Title & Category:</span>
                  <span className="font-bold text-white">{selectedExpense.title} ({selectedExpense.category})</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Member Spend:</span>
                  <span className="font-bold text-white">₹{selectedExpense.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Already Reimbursed:</span>
                  <span className="font-bold text-emerald-400">₹{selectedExpense.reimbursement_paid.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-200 pt-1.5 border-t border-slate-800 font-bold">
                  <span>Remaining Owed:</span>
                  <span className="text-amber-400 font-extrabold text-sm">₹{remainingOwed.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Amount to Pay (INR)*</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-base font-bold text-amber-400">₹</span>
                  <input
                    type="number"
                    step="1"
                    required
                    min="1"
                    max={remainingOwed > 0 ? remainingOwed : undefined}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-lg font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                {parseFloat(paidAmount) < remainingOwed && (
                  <p className="text-[10px] text-amber-400 mt-1 font-semibold">
                    Partial reimbursement: Remaining ₹{(remainingOwed - (parseFloat(paidAmount) || 0)).toLocaleString('en-IN')} will stay pending.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Payment Method*</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="UPI">UPI (PhonePe / GPay / Paytm / CRED)</option>
                  <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                  <option value="Cash">Hand Cash Paid to Member</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {!isCash ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Transaction ID / UTR Number</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. UPI/4910283921/REIMB"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Upload Reimbursement Proof (Optional)</label>
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 border border-dashed border-slate-700 hover:border-amber-500 cursor-pointer text-xs text-slate-400 transition">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>{isUploading ? 'Uploading Proof...' : paymentScreenshotUrl ? 'Proof Uploaded ✓' : 'Upload Screenshot'}</span>
                    <input type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
                  </label>
                </div>
              </>
            ) : (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-300">
                <Banknote className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Cash reimbursement: Hand cash returned directly to member. No UTR needed.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Notes / Remarks (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Returned cash / transferred via GPay"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedExpenseId}
              className={`w-full py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-lg transition ${
                selectedExpenseId
                  ? 'gradient-indigo hover:brightness-110 active:scale-95 shadow-indigo-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Confirm Reimbursement Payment
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
