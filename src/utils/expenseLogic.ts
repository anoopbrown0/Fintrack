import { CategoryId, CategoryInfo, CurrencyCode, CurrencyConfig, Expense } from '../types/expense';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'Food', iconName: 'Utensils', tagline: 'Dining & provisions' },
  { id: 'travel', name: 'Travel', iconName: 'Compass', tagline: 'Transit & flights' },
  { id: 'coffee', name: 'Coffee', iconName: 'Coffee', tagline: 'Roasts & cafés' },
  { id: 'shopping', name: 'Shopping', iconName: 'ShoppingBag', tagline: 'Apparel & goods' },
  { id: 'bills', name: 'Bills', iconName: 'Receipt', tagline: 'Utilities & services' },
  { id: 'entertainment', name: 'Entertainment', iconName: 'Sparkles', tagline: 'Leisure & culture' },
  { id: 'health', name: 'Health', iconName: 'HeartPulse', tagline: 'Wellness & care' },
  { id: 'other', name: 'Other', iconName: 'Layers', tagline: 'Miscellaneous' },
];

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToInr: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToInr: 83.5 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToInr: 90.2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToInr: 105.4 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToInr: 0.55 },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateToInr: 22.7 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateToInr: 61.2 },
};

export function getCurrencySymbol(code: CurrencyCode = 'INR'): string {
  return CURRENCIES[code]?.symbol || '₹';
}

/**
 * Format numbers cleanly with currency symbol and commas
 */
export function formatCurrency(amount: number, code: CurrencyCode = 'INR'): string {
  const symbol = getCurrencySymbol(code);
  const rounded = Math.round(amount);
  
  if (code === 'INR') {
    // Format according to Indian numbering system: ₹1,50,000
    return `${symbol}${rounded.toLocaleString('en-IN')}`;
  }
  return `${symbol}${rounded.toLocaleString('en-US')}`;
}

/**
 * Calculate total spending for today
 */
export function calculateTodayTotal(expenses: Expense[], refDate: Date = new Date()): number {
  const startOfDay = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate()).getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

  return expenses
    .filter((e) => e.timestamp >= startOfDay && e.timestamp < endOfDay)
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Calculate total spending for the current month
 */
export function calculateMonthTotal(expenses: Expense[], refDate: Date = new Date()): number {
  const startOfMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 1).getTime();
  const nextMonth = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1).getTime();

  return expenses
    .filter((e) => e.timestamp >= startOfMonth && e.timestamp < nextMonth)
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Calculate budget metrics (remaining, percentage used, savings percentage)
 */
export function calculateBudgetMetrics(
  monthTotal: number,
  monthlyBudget: number
): {
  remaining: number;
  percentUsed: number;
  percentSaved: number;
  isOver: boolean;
} {
  const safeBudget = Math.max(1, monthlyBudget);
  const remaining = Math.max(0, safeBudget - monthTotal);
  const percentUsed = Math.min(100, Math.round((monthTotal / safeBudget) * 100));
  const percentSaved = Math.max(0, 100 - percentUsed);
  const isOver = monthTotal > safeBudget;

  return {
    remaining,
    percentUsed,
    percentSaved,
    isOver,
  };
}

/**
 * Format friendly date label (Today, Yesterday, Mon Oct 23, etc.)
 */
export function formatDateLabel(timestamp: number, refDate: Date = new Date()): string {
  const date = new Date(timestamp);
  const today = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.round((today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTimeLabel(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export interface DateGroupedExpenses {
  label: string;
  dateKey: string;
  items: Expense[];
  total: number;
}

/**
 * Group expenses by date for timeline views
 */
export function groupExpensesByDate(expenses: Expense[], refDate: Date = new Date()): DateGroupedExpenses[] {
  const groups: Record<string, { label: string; dateKey: string; items: Expense[]; total: number }> = {};

  const sorted = [...expenses].sort((a, b) => b.timestamp - a.timestamp);

  for (const exp of sorted) {
    const d = new Date(exp.timestamp);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const label = formatDateLabel(exp.timestamp, refDate);

    if (!groups[dateKey]) {
      groups[dateKey] = {
        label,
        dateKey,
        items: [],
        total: 0,
      };
    }
    groups[dateKey].items.push(exp);
    groups[dateKey].total += exp.amount;
  }

  return Object.values(groups);
}

export interface CategorySummary {
  category: CategoryId;
  info: CategoryInfo;
  total: number;
  percentage: number;
  count: number;
}

/**
 * Calculate spending breakdown across categories
 */
export function calculateCategoryBreakdown(expenses: Expense[]): CategorySummary[] {
  const totals: Record<CategoryId, { total: number; count: number }> = {
    food: { total: 0, count: 0 },
    travel: { total: 0, count: 0 },
    coffee: { total: 0, count: 0 },
    shopping: { total: 0, count: 0 },
    bills: { total: 0, count: 0 },
    entertainment: { total: 0, count: 0 },
    health: { total: 0, count: 0 },
    other: { total: 0, count: 0 },
  };

  let grandTotal = 0;
  for (const exp of expenses) {
    if (totals[exp.category]) {
      totals[exp.category].total += exp.amount;
      totals[exp.category].count += 1;
      grandTotal += exp.amount;
    }
  }

  return CATEGORIES.map((cat) => {
    const data = totals[cat.id];
    const percentage = grandTotal > 0 ? Math.round((data.total / grandTotal) * 100) : 0;
    return {
      category: cat.id,
      info: cat,
      total: data.total,
      percentage,
      count: data.count,
    };
  }).filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
}

/**
 * Filter expenses by query, category, and date period
 */
export function filterExpenses(
  expenses: Expense[],
  query: string,
  categoryFilter: string,
  period: 'all' | 'today' | 'week' | 'month',
  refDate: Date = new Date()
): Expense[] {
  const q = query.trim().toLowerCase();
  const now = refDate.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  return expenses.filter((e) => {
    // Category match
    if (categoryFilter && categoryFilter !== 'all' && e.category !== categoryFilter) {
      return false;
    }

    // Period match
    if (period === 'today') {
      const startOfDay = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate()).getTime();
      if (e.timestamp < startOfDay || e.timestamp >= startOfDay + dayMs) return false;
    } else if (period === 'week') {
      const oneWeekAgo = now - 7 * dayMs;
      if (e.timestamp < oneWeekAgo) return false;
    } else if (period === 'month') {
      const startOfMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 1).getTime();
      if (e.timestamp < startOfMonth) return false;
    }

    // Search query match (amount or note or category name)
    if (q) {
      const catMatch = e.category.toLowerCase().includes(q);
      const noteMatch = (e.note || '').toLowerCase().includes(q);
      const amountMatch = e.amount.toString().includes(q);
      if (!catMatch && !noteMatch && !amountMatch) return false;
    }

    return true;
  });
}

/**
 * Generate CSV export
 */
export function generateCSV(expenses: Expense[]): string {
  const header = ['ID', 'Date', 'Time', 'Category', 'Amount', 'Currency', 'Note'];
  const rows = expenses.map((e) => {
    const d = new Date(e.timestamp);
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = d.toTimeString().split(' ')[0];
    const safeNote = (e.note || '').replace(/"/g, '""');
    return [
      e.id,
      dateStr,
      timeStr,
      e.category,
      e.amount,
      e.currency,
      `"${safeNote}"`,
    ].join(',');
  });

  return [header.join(','), ...rows].join('\n');
}

/**
 * Realistic seed data so the user opens to a rich, refined experience
 */
export function getInitialSeedData(currency: CurrencyCode = 'INR'): Expense[] {
  const now = Date.now();
  const hour = 3600 * 1000;
  const day = 24 * hour;

  // Realistic luxury & daily amounts calibrated to default INR
  return [
    {
      id: 'noir-exp-1',
      amount: 280,
      category: 'coffee',
      timestamp: now - 1.5 * hour,
      currency,
      note: 'Pour-over Single Origin',
    },
    {
      id: 'noir-exp-2',
      amount: 650,
      category: 'food',
      timestamp: now - 4 * hour,
      currency,
      note: 'Artisan Bistro lunch',
    },
    {
      id: 'noir-exp-3',
      amount: 420,
      category: 'travel',
      timestamp: now - 1 * day - 2 * hour,
      currency,
      note: 'Cab to design studio',
    },
    {
      id: 'noir-exp-4',
      amount: 2400,
      category: 'shopping',
      timestamp: now - 2 * day - 5 * hour,
      currency,
      note: 'Minimalist leather notebook & pen',
    },
    {
      id: 'noir-exp-5',
      amount: 1199,
      category: 'bills',
      timestamp: now - 3 * day - 8 * hour,
      currency,
      note: 'High-speed fiber connectivity',
    },
    {
      id: 'noir-exp-6',
      amount: 850,
      category: 'entertainment',
      timestamp: now - 4 * day - 3 * hour,
      currency,
      note: 'Indie cinema evening screening',
    },
    {
      id: 'noir-exp-7',
      amount: 1500,
      category: 'health',
      timestamp: now - 5 * day - 6 * hour,
      currency,
      note: 'Pilates studio session',
    },
  ];
}
