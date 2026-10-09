import React, { useState } from 'react';
import { PlusCircle, Upload, X, Camera, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import type { User, CategoryItem } from '../types';
import { uploadMediaFile } from '../lib/supabase';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  members: User[];
  categories: CategoryItem[];
  onSubmitExpense: (expenseData: {
    title: string;
    amount: number;
    category: string;
    description?: string;
    paid_by: string;
    date: string;
    payment_method: any;
    payment_screenshot_url?: string;
    receipt_url?: string;
    items?: { name: string; amount: number }[];
  }) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  members,
  categories,
  onSubmitExpense,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState('Groceries');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState(currentUser.id);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash' | 'Other'>('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  // Optional itemized breakdown
  const [items, setItems] = useState<{ name: string; amount: string }[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleScreenshotFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingScreenshot(true);
      try {
        const url = await uploadMediaFile(e.target.files[0], 'screenshots');
        setPaymentScreenshotUrl(url);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploadingScreenshot(false);
      }
    }
  };

  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingReceipt(true);
      try {
        const url = await uploadMediaFile(e.target.files[0], 'receipts');
        setReceiptUrl(url);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploadingReceipt(false);
      }
    }
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', amount: '' }]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: 'name' | 'amount', val: string) => {
    const updated = [...items];
    updated[idx][field] = val;
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const parsedItems = items
      .filter((it) => it.name.trim() && !isNaN(parseFloat(it.amount)))
      .map((it) => ({ name: it.name.trim(), amount: parseFloat(it.amount) }));

    onSubmitExpense({
      title,
      amount: parsedAmount,
      category,
      description,
      paid_by: paidBy,
      date,
      payment_method: paymentMethod,
      payment_screenshot_url: paymentScreenshotUrl || undefined,
      receipt_url: receiptUrl || undefined,
      items: parsedItems.length > 0 ? parsedItems : undefined,
    });

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1200);
  };

  const isPaidByTreasurer = paidBy === 'user-saurabh';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg glass-panel-elevated rounded-3xl p-5 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white">Add Room Expense</h3>
              <p className="text-xs text-slate-400">Submit a room expense paid from pocket</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {showSuccessToast ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-bold text-lg text-white">Expense Submitted Successfully!</h4>
            <p className="text-xs text-slate-300">
              {!isPaidByTreasurer
                ? `₹${amount} reimbursement requested. Submitted for Saurabh’s review.`
                : `₹${amount} room expense recorded directly into room ledger.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Expense Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Amount (INR)*
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-lg font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 350"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xl font-bold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Title & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Title / Item*</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Milk & Vegetables"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Category*</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Paid By */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Paid By (Person who paid from pocket)*</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.role === 'admin' ? '(Treasurer)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method & Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="UPI">UPI (GPay/PhonePe/CRED)</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Date*</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Vegetables, fruits, and bread from local store"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Attachments Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Payment Screenshot */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Payment Screenshot
                </label>
                <label className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-dashed border-slate-700 hover:border-indigo-500 cursor-pointer text-center text-xs text-slate-400">
                  <Camera className="w-5 h-5 text-indigo-400 mb-1" />
                  <span>{isUploadingScreenshot ? 'Uploading...' : paymentScreenshotUrl ? 'Uploaded ✓' : 'Upload Screenshot'}</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handleScreenshotFileChange} className="hidden" />
                </label>
              </div>

              {/* Bill / Receipt Photo */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Bill / Receipt Photo
                </label>
                <label className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-dashed border-slate-700 hover:border-emerald-500 cursor-pointer text-center text-xs text-slate-400">
                  <Upload className="w-5 h-5 text-emerald-400 mb-1" />
                  <span>{isUploadingReceipt ? 'Uploading...' : receiptUrl ? 'Uploaded ✓' : 'Upload Receipt Photo'}</span>
                  <input type="file" accept="image/*" onChange={handleReceiptFileChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Optional Itemized Breakdown Generator */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">
                  Purchased Items Breakdown (Optional)
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>

              {items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Item name (e.g. Milk)"
                    value={it.name}
                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={it.amount}
                    onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl gradient-emerald text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition"
              >
                Submit Room Expense
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
