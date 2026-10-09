import React, { useState } from 'react';
import { Wallet, X, Camera, CheckCircle2 } from 'lucide-react';
import type { User, Contribution } from '../types';
import { uploadMediaFile } from '../lib/supabase';

interface RecordContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: User[];
  defaultMemberId?: string;
  contributions?: Contribution[];
  onRecordContribution: (
    memberId: string,
    amount: number,
    paymentMethod: any,
    transactionId?: string,
    paymentScreenshotUrl?: string,
    notes?: string
  ) => void;
}

export const RecordContributionModal: React.FC<RecordContributionModalProps> = ({
  isOpen,
  onClose,
  members,
  defaultMemberId,
  onRecordContribution,
}) => {
  const [memberId, setMemberId] = useState(defaultMemberId || members[0]?.id || '');
  const [amount, setAmount] = useState<string>('8000');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash' | 'Other'>('UPI');
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!isOpen) return null;

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
    const parsedAmount = parseFloat(amount);
    if (!memberId || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onRecordContribution(
      memberId,
      parsedAmount,
      paymentMethod,
      transactionId || undefined,
      paymentScreenshotUrl || undefined,
      notes || undefined
    );

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1200);
  };

  const selectedMember = members.find((m) => m.id === memberId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel-elevated rounded-3xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white">Record Member Deposit</h3>
              <p className="text-xs text-slate-400">Log monthly ₹8,000 contribution deposit</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {showSuccessToast ? (
          <div className="py-10 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-bold text-lg text-white">Deposit Recorded!</h4>
            <p className="text-xs text-slate-300">
              {selectedMember?.name} marked as <strong className="text-emerald-400">PAID</strong>. Total room fund updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Room Member*</label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.role === 'admin' ? '(Treasurer)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Contribution Amount (INR)*</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-base font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-lg font-bold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="UPI">UPI (GPay / PhonePe / CRED)</option>
                  <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Transaction ID (Optional)</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. UPI/98129038/MAHESH"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Upload Payment Screenshot</label>
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 border border-dashed border-slate-700 hover:border-emerald-500 cursor-pointer text-xs text-slate-400">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>{isUploading ? 'Uploading...' : paymentScreenshotUrl ? 'Screenshot Uploaded ✓' : 'Upload Screenshot'}</span>
                <input type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Deposited directly to Saurabh SBI account"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl gradient-emerald text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition"
            >
              Confirm & Record Deposit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
