import React from 'react';
import { Expense, CategoryId, CurrencyCode } from '../types/expense';
import { formatTimeLabel, CATEGORIES } from '../utils/expenseLogic';
import { FormattedAmount } from './CurrencySymbol';
import {
  UtensilsCrossed,
  Compass,
  Coffee,
  ShoppingBag,
  Receipt,
  Sparkles,
  HeartPulse,
  Layers,
  ChevronRight,
  RotateCcw,
  Trash2,
} from 'lucide-react';

interface RecentExpensesProps {
  expenses: Expense[];
  currency: CurrencyCode;
  onSelectExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onUndoLastExpense?: () => void;
  canUndo?: boolean;
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

export const RecentExpenses: React.FC<RecentExpensesProps> = ({
  expenses,
  currency,
  onSelectExpense,
  onDeleteExpense,
  onUndoLastExpense,
  canUndo,
}) => {
  const recentItems = expenses.slice(0, 5);

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs uppercase tracking-[0.2em] text-[#706F6A] dark:text-[#858580] font-medium">
          Recent Activity
        </span>

        {canUndo && onUndoLastExpense && (
          <button
            type="button"
            onClick={onUndoLastExpense}
            className="inline-flex items-center gap-1.5 text-xs text-[#9B7E48] dark:text-[#D6C5A1] hover:text-[#8A6E3B] dark:hover:text-[#E2D4B6] transition-colors cursor-pointer px-2.5 py-1 rounded-full bg-white/50 dark:bg-white/[0.04] backdrop-blur-md border border-[#9B7E48]/30 dark:border-[#D6C5A1]/20 hover:border-[#9B7E48]/50 dark:hover:border-[#D6C5A1]/40"
            aria-label="Undo last recorded expense"
          >
            <RotateCcw size={12} />
            <span>Undo Last</span>
          </button>
        )}
      </div>

      {recentItems.length === 0 ? (
        <div className="p-6 rounded-2xl bg-white/60 dark:bg-[#111111]/60 backdrop-blur-xl border border-black/[0.05] dark:border-white/[0.08] text-center shadow-xs">
          <p className="font-editorial italic text-lg text-[#141312] dark:text-[#F4F2EF] mb-1">
            Silence in the ledger.
          </p>
          <p className="text-xs text-[#706F6A] dark:text-[#858580]">
            Scroll the amount wheel above to capture your first expense.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentItems.map((item) => {
            const Icon = CATEGORY_ICONS[item.category] || Layers;
            const catInfo = CATEGORIES.find((c) => c.id === item.category);

            return (
              <div
                key={item.id}
                onClick={() => onSelectExpense(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectExpense(item);
                  }
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/70 dark:bg-[#121212]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] hover:border-[#9B7E48]/30 dark:hover:border-white/[0.18] hover:bg-white/90 dark:hover:bg-[#161616]/80 transition-all text-left cursor-pointer group min-h-[58px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                aria-label={`View details for ${catInfo?.name || item.category} expense`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#F4F0E6]/80 dark:bg-white/[0.06] backdrop-blur-md border border-black/[0.04] dark:border-white/[0.08] flex items-center justify-center text-[#9B7E48] dark:text-[#D6C5A1] shrink-0 group-hover:scale-105 transition-transform">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#141312] dark:text-[#F4F2EF] truncate">
                      {catInfo?.name || item.category}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#706F6A] dark:text-[#858580]">
                      <span>{formatTimeLabel(item.timestamp)}</span>
                      {item.note && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[130px] sm:max-w-[200px] text-[#555] dark:text-[#A0A09B]">{item.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Zone: Price + Quick Delete Button + Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <FormattedAmount
                    amount={item.amount}
                    currency={currency}
                    symbolSize={14}
                    className="text-base font-semibold text-[#141312] dark:text-[#F4F2EF]"
                  />

                  {/* Quick Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteExpense(item.id);
                    }}
                    className="w-8 h-8 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] hover:bg-red-500/15 dark:hover:bg-red-500/20 text-[#706F6A] dark:text-[#858580] hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    aria-label={`Delete ${catInfo?.name || item.category} expense of ${item.amount}`}
                    title="Quick delete expense"
                  >
                    <Trash2 size={14} />
                  </button>

                  <ChevronRight size={15} className="text-[#706F6A] dark:text-[#858580] group-hover:text-[#141312] dark:group-hover:text-[#F4F2EF] transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
