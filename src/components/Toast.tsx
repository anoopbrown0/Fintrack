import React, { useEffect, useState } from 'react';
import { Expense, CurrencyCode } from '../types/expense';
import { CATEGORIES } from '../utils/expenseLogic';
import { FormattedAmount } from './CurrencySymbol';
import { RotateCcw, X, CheckCircle2 } from 'lucide-react';

interface ToastProps {
  lastExpense: Expense | null;
  currency: CurrencyCode;
  onUndo: () => void;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  lastExpense,
  currency,
  onUndo,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lastExpense) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastExpense, onDismiss]);

  if (!lastExpense || !visible) return null;

  const catInfo = CATEGORIES.find((c) => c.id === lastExpense.category);

  return (
    <aside
      aria-label="Notifications"
      className="fixed bottom-20 inset-x-4 max-w-sm mx-auto z-50 flex items-center justify-between p-3.5 rounded-2xl bg-white/95 dark:bg-[#141414]/95 backdrop-blur-md border border-[#9B7E48]/50 dark:border-[#D6C5A1]/50 text-[#141312] dark:text-[#F4F2EF] shadow-2xl animate-in slide-in-from-bottom-4 duration-200 transition-colors"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
        <div className="min-w-0 text-xs font-medium flex items-center gap-1 truncate">
          <span>Logged</span>
          <FormattedAmount
            amount={lastExpense.amount}
            currency={currency}
            symbolSize={11}
            className="text-[#9B7E48] dark:text-[#D6C5A1] font-bold"
          />
          <span className="truncate">for {catInfo?.name || lastExpense.category}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <button
          type="button"
          onClick={() => {
            onUndo();
            setVisible(false);
          }}
          className="px-2.5 py-1 rounded-lg bg-[#F4F0E6] dark:bg-[#222220] hover:bg-[#EAE4D5] dark:hover:bg-[#2C2C28] text-xs font-semibold text-[#9B7E48] dark:text-[#D6C5A1] border border-[#9B7E48]/30 dark:border-[#D6C5A1]/30 flex items-center gap-1 cursor-pointer transition-colors"
          aria-label="Undo this expense entry"
        >
          <RotateCcw size={11} />
          <span>Undo</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            onDismiss();
          }}
          className="text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] p-1 cursor-pointer"
          aria-label="Dismiss toast"
        >
          <X size={14} />
        </button>
      </div>
    </aside>
  );
};
