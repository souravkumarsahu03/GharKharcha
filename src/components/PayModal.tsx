import React, { useState, useEffect } from 'react';
import { QrCode, X, Camera, Copy, Check, CheckCircle2, Banknote, Edit3, AlertTriangle } from 'lucide-react';
import type { User, Contribution } from '../types';
import { uploadMediaFile } from '../lib/supabase';

interface PayModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
  contribution?: Contribution;
  onSubmitPaymentProof: (
    amount: number,
    paymentMethod: any,
    transactionId?: string,
    paymentScreenshotUrl?: string,
    notes?: string
  ) => void;
}

export const PayModal: React.FC<PayModalProps> = ({
  isOpen,
  onClose,
  contribution,
  onSubmitPaymentProof,
}) => {
  const defaultAmountToPay = contribution
    ? (contribution.remaining_amount > 0 ? contribution.remaining_amount : 8000)
    : 8000;

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [amountInput, setAmountInput] = useState<string>(defaultAmountToPay.toString());
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash' | 'Other'>('UPI');
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Sync amount input when modal opens or contribution changes
  useEffect(() => {
    if (isOpen) {
      const initialAmount = contribution
        ? (contribution.remaining_amount > 0 ? contribution.remaining_amount : 8000)
        : 8000;
      setAmountInput(initialAmount.toString());
      setTransactionId('');
      setPaymentScreenshotUrl('');
      setNotes('');
    }
  }, [isOpen, contribution]);

  if (!isOpen) return null;

  const isCash = paymentMethod === 'Cash';
  const parsedAmount = parseFloat(amountInput) || 0;
  const targetTotal = 8000;
  const remainingCalculated = Math.max(0, targetTotal - parsedAmount);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('sourav.treasurer@upi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

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
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSubmitPaymentProof(
      parsedAmount,
      paymentMethod,
      isCash ? undefined : (transactionId || undefined),
      isCash ? undefined : (paymentScreenshotUrl || undefined),
      notes || undefined
    );

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg glass-panel-elevated rounded-3xl p-5 my-8 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white">Pay Room Contribution</h3>
              <p className="text-xs text-slate-400">Scan Sourav’s QR or give cash/transfer to room fund</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {showSuccessToast ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-heading font-bold text-xl text-white">Payment Proof Submitted!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Your ₹{parseFloat(amountInput).toLocaleString('en-IN')} payment has been sent to{' '}
              <strong className="text-emerald-400">Sourav (Super Admin)</strong> for verification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sourav's PhonePe QR Display Box (Show for non-cash or reference) */}
            {!isCash ? (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center space-y-3 text-center">
                <div className="relative p-2 rounded-2xl bg-white shadow-xl ring-4 ring-indigo-500/20">
                  <img
                    src="/sourav_qr.png"
                    alt="Sourav PhonePe QR Code"
                    className="w-44 h-44 object-contain rounded-xl"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Super Admin / Treasurer</p>
                  <h4 className="font-heading font-extrabold text-base text-white">Sourav</h4>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-xs font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-emerald-400 font-bold">
                      sourav.treasurer@upi
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-center gap-3 text-xs text-amber-300">
                <Banknote className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold text-white text-sm">Hand Cash Selected</p>
                  <p className="text-slate-300 mt-0.5">
                    No Transaction ID or screenshot proof required for cash payments given directly to Sourav.
                  </p>
                </div>
              </div>
            )}

            {/* Editable Amount & Payment Method Grid */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1">
                      <span>Contribution Amount (INR)*</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> Editable
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-lg font-extrabold text-emerald-400">₹</span>
                    <input
                      type="number"
                      step="1"
                      required
                      min="1"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      placeholder="e.g. 2000 or 8000"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border-2 border-emerald-500/50 text-xl font-black text-white focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Payment Method*</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="UPI">UPI (PhonePe / GPay / Paytm / CRED)</option>
                    <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                    <option value="Cash">Hand Cash to Sourav</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Quick Amount Preset Chips */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Quick Select Amount:</p>
                <div className="flex flex-wrap gap-2">
                  {[2000, 3000, 4000, 5000, 8000].map((amt) => {
                    const isSelected = parsedAmount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmountInput(amt.toString())}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105 ring-2 ring-emerald-300'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                        }`}
                      >
                        <span>₹{amt.toLocaleString('en-IN')}</span>
                        {amt === 8000 && <span className="text-[10px] opacity-80">(Full)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Partial vs Full Payment Guidance Box */}
              {parsedAmount < 8000 && parsedAmount > 0 ? (
                <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Partial Payment Mode Active</span>
                  </div>
                  <p>
                    You are paying <strong className="text-white">₹{parsedAmount.toLocaleString('en-IN')}</strong> now.
                  </p>
                  <p className="text-slate-300">
                    Remaining <strong className="text-amber-400 font-extrabold text-sm">₹{remainingCalculated.toLocaleString('en-IN')}</strong> will be due in next <strong className="text-white">10-15 days</strong>.
                  </p>
                  <p className="text-[11px] text-amber-400/90 font-medium pt-0.5">
                    🔔 You and Admin (Sourav) will automatically receive 3 reminder notifications (every 5 days) for the remaining balance.
                  </p>
                </div>
              ) : parsedAmount >= 8000 ? (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full monthly room contribution of ₹{parsedAmount.toLocaleString('en-IN')} selected.</span>
                </div>
              ) : null}
            </div>

            {/* Show Transaction ID & Screenshot Uploader ONLY if NOT Cash */}
            {!isCash && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Transaction ID / UTR Number*
                  </label>
                  <input
                    type="text"
                    required={!isCash}
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. UPI/3910283901/SURAJ"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Upload Payment Screenshot*
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900 border border-dashed border-slate-700 hover:border-emerald-500 cursor-pointer text-xs text-slate-300 transition">
                    <Camera className="w-5 h-5 text-emerald-400" />
                    <span>
                      {isUploading
                        ? 'Uploading Proof...'
                        : paymentScreenshotUrl
                        ? 'Screenshot Uploaded ✓'
                        : 'Upload Payment Screenshot'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
                  </label>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Notes / Remarks (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Partial payment ₹3000 now, remaining ₹5000 next week"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl gradient-emerald text-white font-extrabold text-sm shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition"
              >
                Submit Payment Proof to Sourav
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
