import React, { useState, useMemo } from 'react';
import { Expense, CategoryId, CurrencyCode } from '../types/expense';
import {
  CATEGORIES,
  formatTimeLabel,
  groupExpensesByDate,
  filterExpenses,
} from '../utils/expenseLogic';
import { FormattedAmount } from './CurrencySymbol';
import {
  Search,
  UtensilsCrossed,
  Compass,
  Coffee,
  ShoppingBag,
  Receipt,
  Sparkles,
  HeartPulse,
  Layers,
  ChevronRight,
  Calendar,
  Trash2,
} from 'lucide-react';

interface HistoryViewProps {
  expenses: Expense[];
  currency: CurrencyCode;
  onSelectExpense: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
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

type PeriodType = 'all' | 'today' | 'week' | 'month';

export const HistoryView: React.FC<HistoryViewProps> = ({
  expenses,
  currency,
  onSelectExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('all');

  const filteredExpenses = useMemo(() => {
    return filterExpenses(expenses, searchQuery, selectedCategory, selectedPeriod);
  }, [expenses, searchQuery, selectedCategory, selectedPeriod]);

  const grouped = useMemo(() => {
    return groupExpensesByDate(filteredExpenses);
  }, [filteredExpenses]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  return (
    <div className="w-full pb-36 sm:pb-32">
      {/* Page Title */}
      <div className="mb-5">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#706F6A] dark:text-[#858580] font-medium">
          Ledger
        </span>
        <h1 className="text-2xl font-serif italic text-[#141312] dark:text-[#F4F2EF] mt-0.5">
          Transaction Timeline
        </h1>
        <div className="text-xs text-[#706F6A] dark:text-[#858580] mt-1 flex items-center gap-1.5">
          <span>{filteredExpenses.length} entries recorded</span>
          <span aria-hidden="true">·</span>
          <span>Total</span>
          <FormattedAmount
            amount={totalFilteredAmount}
            currency={currency}
            symbolSize={11}
            className="text-[#9B7E48] dark:text-[#D6C5A1] font-semibold"
          />
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3 mb-6">
        {/* Glassmorphic Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#706F6A] dark:text-[#858580]" />
          <input
            type="text"
            placeholder="Search notes, categories, amounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/70 dark:bg-[#121212]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] focus:border-[#9B7E48] dark:focus:border-[#D6C5A1] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#141312] dark:text-[#F4F2EF] placeholder-[#8E8D87] outline-none transition-all shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {(['all', 'today', 'week', 'month'] as PeriodType[]).map((period) => {
            const isActive = selectedPeriod === period;
            const labels: Record<PeriodType, string> = {
              all: 'All Time',
              today: 'Today',
              week: 'This Week',
              month: 'This Month',
            };
            return (
              <button
                key={period}
                type="button"
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer backdrop-blur-xl ${
                  isActive
                    ? 'bg-[#F2EFE6]/90 dark:bg-white/[0.14] text-[#9B7E48] dark:text-[#D6C5A1] border border-[#9B7E48]/40 dark:border-[#D6C5A1]/40 font-semibold shadow-xs'
                    : 'bg-white/60 dark:bg-[#121212]/60 text-[#706F6A] dark:text-[#858580] border border-black/[0.05] dark:border-white/[0.08] hover:text-[#141312] dark:hover:text-[#F4F2EF]'
                }`}
              >
                {labels[period]}
              </button>
            );
          })}
        </div>

        {/* Category Horizontal Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#9B7E48] dark:bg-[#D6C5A1] text-white dark:text-[#080808] font-semibold shadow-xs'
                : 'bg-white/60 dark:bg-[#121212]/60 text-[#706F6A] dark:text-[#858580] border border-black/[0.05] dark:border-white/[0.08] hover:text-[#141312] dark:hover:text-[#F4F2EF]'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#9B7E48] dark:bg-[#D6C5A1] text-white dark:text-[#080808] font-semibold shadow-xs'
                    : 'bg-white/60 dark:bg-[#121212]/60 text-[#706F6A] dark:text-[#858580] border border-black/[0.05] dark:border-white/[0.08] hover:text-[#141312] dark:hover:text-[#F4F2EF]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grouped Timeline with Glassmorphism */}
      {grouped.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white/60 dark:bg-[#111111]/60 backdrop-blur-xl border border-black/[0.05] dark:border-white/[0.08] text-center my-6 shadow-xs">
          <Calendar size={28} className="mx-auto text-[#706F6A] dark:text-[#858580] mb-2 opacity-60" />
          <p className="font-serif italic text-lg text-[#141312] dark:text-[#F4F2EF] mb-1">
            No entries found
          </p>
          <p className="text-xs text-[#706F6A] dark:text-[#858580]">
            Adjust your filters or record an expense from the Home wheel.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.dateKey} className="space-y-2">
              {/* Date Group Header */}
              <div className="flex items-center justify-between px-1.5 py-1">
                <span className="text-xs font-serif italic text-[#9B7E48] dark:text-[#D6C5A1] font-medium">
                  {group.label}
                </span>
                <FormattedAmount
                  amount={group.total}
                  currency={currency}
                  symbolSize={11}
                  className="text-xs text-[#706F6A] dark:text-[#858580] font-medium"
                />
              </div>

              {/* Group Items */}
              <div className="space-y-2">
                {group.items.map((item) => {
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
                      aria-label={`View details for ${catInfo?.name || item.category}`}
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

                      <div className="flex items-center gap-2 shrink-0">
                        <FormattedAmount
                          amount={item.amount}
                          currency={currency}
                          symbolSize={14}
                          className="text-base font-semibold text-[#141312] dark:text-[#F4F2EF]"
                        />

                        {/* Quick Delete */}
                        {onDeleteExpense && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteExpense(item.id);
                            }}
                            className="w-8 h-8 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] hover:bg-red-500/15 dark:hover:bg-red-500/20 text-[#706F6A] dark:text-[#858580] hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                            aria-label={`Delete ${catInfo?.name || item.category} expense`}
                            title="Quick delete expense"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}

                        <ChevronRight size={15} className="text-[#706F6A] dark:text-[#858580] group-hover:text-[#141312] dark:group-hover:text-[#F4F2EF] transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
