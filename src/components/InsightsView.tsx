import React, { useMemo } from 'react';
import { Expense, CurrencyCode } from '../types/expense';
import {
  calculateMonthTotal,
  calculateCategoryBreakdown,
  calculateBudgetMetrics,
  CATEGORIES,
} from '../utils/expenseLogic';
import { FormattedAmount } from './CurrencySymbol';
import {
  Layers,
  UtensilsCrossed,
  Compass,
  Coffee,
  ShoppingBag,
  Receipt,
  Sparkles,
  HeartPulse,
} from 'lucide-react';

interface InsightsViewProps {
  expenses: Expense[];
  currency: CurrencyCode;
  monthlyBudget: number;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  food: UtensilsCrossed,
  travel: Compass,
  coffee: Coffee,
  shopping: ShoppingBag,
  bills: Receipt,
  entertainment: Sparkles,
  health: HeartPulse,
  other: Layers,
};

export const InsightsView: React.FC<InsightsViewProps> = ({
  expenses,
  currency,
  monthlyBudget,
}) => {
  const now = new Date();
  const daysInCurrentMonth = now.getDate();

  const monthTotal = useMemo(() => calculateMonthTotal(expenses, now), [expenses, now]);
  const budgetMetrics = useMemo(() => calculateBudgetMetrics(monthTotal, monthlyBudget), [monthTotal, monthlyBudget]);
  const categoryBreakdown = useMemo(() => calculateCategoryBreakdown(expenses), [expenses]);

  const dailyAverage = useMemo(() => {
    return daysInCurrentMonth > 0 ? Math.round(monthTotal / daysInCurrentMonth) : 0;
  }, [monthTotal, daysInCurrentMonth]);

  const topCategory = categoryBreakdown[0] || null;

  // Last 7 days distribution
  const last7Days = useMemo(() => {
    const days: { label: string; dateStr: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const startOfDay = d.getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

      const dayTotal = expenses
        .filter((e) => e.timestamp >= startOfDay && e.timestamp < endOfDay)
        .reduce((sum, e) => sum + e.amount, 0);

      days.push({
        label: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dateStr: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
        total: dayTotal,
      });
    }
    return days;
  }, [expenses, now]);

  const max7DaySpend = useMemo(() => {
    const max = Math.max(...last7Days.map((d) => d.total));
    return max > 0 ? max : 1;
  }, [last7Days]);

  return (
    <div className="w-full pb-36 sm:pb-32">
      {/* Header */}
      <div className="mb-5">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#706F6A] dark:text-[#858580] font-medium">
          Analytics
        </span>
        <h1 className="text-2xl font-serif italic text-[#141312] dark:text-[#F4F2EF] mt-0.5">
          Spending Intelligence
        </h1>
        <p className="text-xs text-[#706F6A] dark:text-[#858580] mt-1">
          Monthly rhythm & category allocations
        </p>
      </div>

      {/* Primary KPI Card: Month Total & Budget Progress */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-[#121212]/70 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] mb-4 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-xs uppercase tracking-[0.15em] text-[#706F6A] dark:text-[#858580]">
              Month-to-Date
            </span>
            <div className="mt-0.5">
              <FormattedAmount
                amount={monthTotal}
                currency={currency}
                symbolSize={22}
                className="text-3xl sm:text-4xl font-serif font-bold text-[#141312] dark:text-[#F4F2EF]"
              />
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-[0.15em] text-[#706F6A] dark:text-[#858580]">
              Budget Cap
            </span>
            <div className="mt-1">
              <FormattedAmount
                amount={monthlyBudget}
                currency={currency}
                symbolSize={12}
                className="text-sm font-semibold text-[#706F6A] dark:text-[#858580]"
              />
            </div>
          </div>
        </div>

        {/* Minimalist Progress Line */}
        <div className="w-full h-1.5 bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden mt-3 mb-2">
          <div
            className={`h-full transition-all duration-300 ${
              budgetMetrics.isOver ? 'bg-red-500' : 'bg-[#9B7E48] dark:bg-[#D6C5A1]'
            }`}
            style={{ width: `${Math.min(100, budgetMetrics.percentUsed)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-[#706F6A] dark:text-[#858580]">
          <span>{budgetMetrics.percentUsed}% utilized</span>
          <span className="text-[#9B7E48] dark:text-[#D6C5A1] font-medium flex items-center gap-1">
            <FormattedAmount amount={budgetMetrics.remaining} currency={currency} symbolSize={10} />
            <span>remaining</span>
          </span>
        </div>
      </div>

      {/* Responsive Secondary Metrics Grid */}
      <div className="grid grid-cols-2 gap-3.5 mb-5">
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-[#121212]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
          <span className="text-[11px] uppercase tracking-[0.15em] text-[#706F6A] dark:text-[#858580] block mb-1">
            Daily Average
          </span>
          <FormattedAmount
            amount={dailyAverage}
            currency={currency}
            symbolSize={16}
            className="text-xl sm:text-2xl font-bold font-serif text-[#141312] dark:text-[#F4F2EF]"
          />
          <span className="text-[10px] text-[#706F6A] dark:text-[#858580] mt-1 block">
            Across {daysInCurrentMonth} days this month
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-[#121212]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
          <span className="text-[11px] uppercase tracking-[0.15em] text-[#706F6A] dark:text-[#858580] block mb-1">
            Top Category
          </span>
          <div className="text-xl sm:text-2xl font-bold font-serif text-[#141312] dark:text-[#F4F2EF] truncate">
            {topCategory ? topCategory.info.name : '—'}
          </div>
          <span className="text-[10px] text-[#9B7E48] dark:text-[#D6C5A1] mt-1 block font-medium">
            {topCategory ? `${topCategory.percentage}% of all expenses` : 'No activity'}
          </span>
        </div>
      </div>

      {/* Desktop Split / Mobile Stack: 7-Day Cadence & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 7-Day Rhythm Cadence */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-[#121212]/70 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.15em] text-[#706F6A] dark:text-[#858580] font-medium">
                7-Day Cadence
              </span>
              <span className="text-xs font-serif italic text-[#9B7E48] dark:text-[#D6C5A1]">
                Daily trend
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 items-end h-32 pt-2">
              {last7Days.map((d, idx) => {
                const heightPercent = Math.max(8, Math.round((d.total / max7DaySpend) * 100));
                const isToday = idx === 6;

                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <div className="w-full flex items-end justify-center h-24 mb-1.5">
                      <div
                        className={`w-full max-w-[28px] rounded-xl transition-all duration-300 ${
                          isToday
                            ? 'bg-[#9B7E48] dark:bg-[#D6C5A1] shadow-xs'
                            : d.total > 0
                            ? 'bg-[#D0CECB] dark:bg-white/[0.12] group-hover:bg-[#B5B3AD] dark:group-hover:bg-white/[0.2]'
                            : 'bg-black/[0.03] dark:bg-white/[0.04]'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-medium ${
                        isToday ? 'text-[#9B7E48] dark:text-[#D6C5A1] font-semibold' : 'text-[#706F6A] dark:text-[#858580]'
                      }`}
                    >
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Distribution Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-[#121212]/70 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-[0.15em] text-[#706F6A] dark:text-[#858580] font-medium">
              Allocation Breakdown
            </span>
            <span className="text-xs text-[#706F6A] dark:text-[#858580]">
              {categoryBreakdown.length} active
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-[#706F6A] dark:text-[#858580] text-center py-6">
              No expense records yet to analyze.
            </p>
          ) : (
            <div className="space-y-3.5">
              {categoryBreakdown.map((item) => {
                const Icon = CATEGORY_ICONS[item.category] || Layers;

                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#F4F0E6]/80 dark:bg-white/[0.06] backdrop-blur-md border border-black/[0.04] dark:border-white/[0.08] flex items-center justify-center text-[#9B7E48] dark:text-[#D6C5A1]">
                          <Icon size={13} />
                        </div>
                        <span className="font-medium text-[#141312] dark:text-[#F4F2EF]">{item.info.name}</span>
                        <span className="text-[#706F6A] dark:text-[#858580] text-[11px]">({item.count})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FormattedAmount
                          amount={item.total}
                          currency={currency}
                          symbolSize={12}
                          className="font-semibold text-[#141312] dark:text-[#F4F2EF]"
                        />
                        <span className="text-[11px] text-[#706F6A] dark:text-[#858580] tabular-nums w-8 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-1 bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#9B7E48] dark:bg-[#D6C5A1] rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
