import React, { useState } from 'react';
import { Expense, CategoryId, CurrencyCode } from '../types/expense';
import { CATEGORIES, formatTimeLabel, formatDateLabel } from '../utils/expenseLogic';
import { X, Trash2, Check, UtensilsCrossed, Compass, Coffee, ShoppingBag, Receipt, Sparkles, HeartPulse, Layers } from 'lucide-react';

interface TransactionModalProps {
  expense: Expense | null;
  currency: CurrencyCode;
  onClose: () => void;
  onUpdateExpense: (updated: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORY_ICONS: Record<CategoryId, React.ElementType> = {
  food: UtensilsCrossed,
  travel: Compass,
  coffee: Coffee,
  shopping: ShoppingBag,
  bills: Receipt,
  entertainment: Sparkles,
  health: HeartPulse,
  other: Layers,
};

export const TransactionModal: React.FC<TransactionModalProps> = ({
  expense,
  currency,
  onClose,
  onUpdateExpense,
  onDeleteExpense,
}) => {
  if (!expense) return null;

  const [amount, setAmount] = useState<number>(expense.amount);
  const [category, setCategory] = useState<CategoryId>(expense.category);
  const [note, setNote] = useState<string>(expense.note || '');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    onUpdateExpense({
      ...expense,
      amount,
      category,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    onDeleteExpense(expense.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 dark:bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white/90 dark:bg-[#141414]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] p-5 sm:p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08] mb-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#706F6A] dark:text-[#858580] font-medium">
              Entry Detail
            </span>
            <h2 id="modal-title" className="text-lg font-serif italic text-[#141312] dark:text-[#F4F2EF]">
              {formatDateLabel(expense.timestamp)} · {formatTimeLabel(expense.timestamp)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.15] text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Amount Field */}
          <div>
            <label htmlFor="tx-amount" className="block text-xs uppercase tracking-[0.15em] text-[#706F6A] dark:text-[#858580] mb-1.5 font-medium">
              Amount ({currency})
            </label>
            <div className="relative">
              <input
                id="tx-amount"
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full bg-[#F4F0E6]/80 dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.1] focus:border-[#9B7E48] dark:focus:border-[#D6C5A1] rounded-2xl px-4 py-3 text-xl font-semibold tabular-nums text-[#141312] dark:text-[#F4F2EF] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-[#706F6A] dark:text-[#858580] mb-1.5 font-medium">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id];
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F2EFE6] dark:bg-white/[0.14] border-[#9B7E48] dark:border-[#D6C5A1] text-[#9B7E48] dark:text-[#D6C5A1] font-semibold shadow-xs'
                        : 'bg-white/60 dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.08] text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF]'
                    }`}
                  >
                    <Icon size={16} className="mb-1" />
                    <span className="truncate text-[10px]">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label htmlFor="tx-note" className="block text-xs uppercase tracking-[0.15em] text-[#706F6A] dark:text-[#858580] mb-1.5 font-medium">
              Note (Optional)
            </label>
            <input
              id="tx-note"
              type="text"
              placeholder="e.g. Single origin espresso, Airport taxi"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={80}
              className="w-full bg-[#F4F0E6]/80 dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.1] focus:border-[#9B7E48] dark:focus:border-[#D6C5A1] rounded-2xl px-3.5 py-2.5 text-sm text-[#141312] dark:text-[#F4F2EF] placeholder-[#8E8D87] outline-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-2 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-300 text-xs font-medium cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-2 text-xs text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-red-500/15 dark:hover:bg-red-500/20 text-[#706F6A] dark:text-[#858580] hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Delete transaction"
              >
                <Trash2 size={16} />
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] text-xs font-medium text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-[#9B7E48] hover:bg-[#8A6E3B] text-white dark:bg-[#D6C5A1] dark:hover:bg-[#E2D4B6] dark:text-[#080808] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check size={14} />
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
