import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CategoryId,
  CurrencyCode,
  Expense,
  NavigationTab,
  UserPreferences,
} from './types/expense';
import {
  calculateTodayTotal,
  calculateMonthlyTotal,
  CATEGORIES,
  getInitialSeedData,
} from './utils/expenseLogic';
import { Header } from './components/Header';
import { AmountWheel } from './components/AmountWheel';
import { KeypadInput } from './components/KeypadInput';
import { CategoryPicker } from './components/CategoryPicker';
import { RecentExpenses } from './components/RecentExpenses';
import { HistoryView } from './components/HistoryView';
import { InsightsView } from './components/InsightsView';
import { ProfileView } from './components/ProfileView';
import { BottomNav } from './components/BottomNav';
import { TransactionModal } from './components/TransactionModal';
import { Toast } from './components/Toast';
import { FormattedAmount } from './components/CurrencySymbol';
import { playTickSound } from './utils/audio';
import { Disc, Calculator, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';

const STORAGE_KEY_EXPENSES = 'noir_expenses_v2';
const STORAGE_KEY_PREFS = 'noir_preferences_v2';

const DEFAULT_PREFERENCES: UserPreferences = {
  name: 'Anoop Brown',
  email: 'anoopbrown0@gmail.com',
  membershipStatus: 'Private Client',
  currency: 'INR',
  monthlyBudget: 50000,
  autoLogDelayMs: 1500, // 1.5s debounce before auto-logging
  hapticsSoundEnabled: true,
  reducedMotion: false,
  theme: 'dark', // default dark luxury
};

export default function App() {
  // Load preferences from localStorage
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PREFS);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PREFERENCES;
  });

  // Load expenses from localStorage
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EXPENSES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return getInitialSeedData(DEFAULT_PREFERENCES.currency);
  });

  // App UI states
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [showDialer, setShowDialer] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('coffee');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [lastLoggedExpense, setLastLoggedExpense] = useState<Expense | null>(null);
  const [previousExpensesHistory, setPreviousExpensesHistory] = useState<Expense[] | null>(null);

  // Sync theme to root <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [preferences.theme]);

  // Sync expenses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    } catch {
      // Ignore write errors
    }
  }, [expenses]);

  // Sync preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(preferences));
    } catch {
      // Ignore write errors
    }
  }, [preferences]);

  // Today's total spending
  const todayTotal = useMemo(() => {
    return calculateTodayTotal(expenses);
  }, [expenses]);

  // Current month total spending & budget pacing
  const currentMonthTotal = useMemo(() => {
    return calculateMonthlyTotal(expenses);
  }, [expenses]);

  const budgetRemaining = Math.max(0, preferences.monthlyBudget - currentMonthTotal);
  const budgetPercentUsed = Math.min(100, Math.round((currentMonthTotal / (preferences.monthlyBudget || 1)) * 100));

  // Toggle Theme mode
  const handleToggleTheme = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  // Record a new expense from the amount wheel or keypad
  const handleCommitExpense = useCallback((amount: number) => {
    const newExpense: Expense = {
      id: `fintrack-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      amount,
      category: selectedCategory,
      timestamp: Date.now(),
      currency: preferences.currency,
    };

    setPreviousExpensesHistory([...expenses]);
    setExpenses((prev) => [newExpense, ...prev]);
    setLastLoggedExpense(newExpense);
  }, [selectedCategory, preferences.currency, expenses]);

  // Undo the last logged entry
  const handleUndo = useCallback(() => {
    if (previousExpensesHistory) {
      setExpenses(previousExpensesHistory);
      setPreviousExpensesHistory(null);
      setLastLoggedExpense(null);
    } else if (expenses.length > 0) {
      setExpenses((prev) => prev.slice(1));
      setLastLoggedExpense(null);
    }
  }, [previousExpensesHistory, expenses]);

  // Update an existing expense
  const handleUpdateExpense = useCallback((updated: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }, []);

  // Delete an expense
  const handleDeleteExpense = useCallback((id: string) => {
    setPreviousExpensesHistory([...expenses]);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, [expenses]);

  // Update user preferences
  const handleUpdatePreferences = useCallback((updated: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updated }));
  }, []);

  // Reset to initial seed data
  const handleResetData = useCallback(() => {
    const seed = getInitialSeedData(preferences.currency);
    setExpenses(seed);
    setPreviousExpensesHistory(null);
    setLastLoggedExpense(null);
  }, [preferences.currency]);

  // Clear all data
  const handleClearData = useCallback(() => {
    setPreviousExpensesHistory([...expenses]);
    setExpenses([]);
    setLastLoggedExpense(null);
  }, [expenses]);

  const userInitials = useMemo(() => {
    return preferences.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'NB';
  }, [preferences.name]);

  const activeCategoryInfo = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[#F5F4EE] dark:bg-[#080808] text-[#141312] dark:text-[#F4F2EF] font-sans antialiased flex justify-center transition-colors duration-200">
      {/* Toast Notification */}
      <Toast
        lastExpense={lastLoggedExpense}
        currency={preferences.currency}
        onUndo={handleUndo}
        onDismiss={() => setLastLoggedExpense(null)}
      />

      {/* Main Container - Responsive across mobile (<768px), tablet (md:768-1024px), and desktop (lg:>1024px) */}
      <main className="w-full max-w-md md:max-w-3xl lg:max-w-6xl min-h-screen flex flex-col px-4 sm:px-8 lg:px-10 relative bg-[#FBFBFA]/90 dark:bg-[#080808]/90 backdrop-blur-2xl md:border-x md:border-[#E5E3DC]/60 dark:md:border-[#1A1A18]/80 md:shadow-2xl transition-colors duration-200">
        {/* Header with Dark/Light toggle and Today Spend */}
        <Header
          todayTotal={todayTotal}
          currency={preferences.currency}
          activeTab={activeTab}
          onOpenProfile={() => setActiveTab('profile')}
          userInitials={userInitials}
          theme={preferences.theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Tab Destination Routing */}
        <div className="flex-1">
          {activeTab === 'home' && (
            <div className="pb-32">
              {/* Responsive Layout Grid */}
              <div className="lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start space-y-6 lg:space-y-0">
                {/* Left zone: Input Mode Toggle + Category Picker + Input Instrument (Mechanical Wheel or Keypad) */}
                <div className="lg:col-span-6 space-y-5">
                  {/* Category Picker */}
                  <CategoryPicker
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    soundEnabled={preferences.hapticsSoundEnabled}
                  />

                  {/* Dial-In Toggle Switch: Defaults to OFF (Wheel is shown); when turned ON, Dialer is shown */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-[#111111]/75 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs transition-all">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          showDialer
                            ? 'bg-[#9B7E48]/15 dark:bg-[#D6C5A1]/15 text-[#9B7E48] dark:text-[#D6C5A1]'
                            : 'bg-black/[0.04] dark:bg-white/[0.05] text-[#706F6A] dark:text-[#858580]'
                        }`}
                      >
                        {showDialer ? <Calculator size={18} /> : <Disc size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold tracking-wide text-[#141312] dark:text-[#F4F2EF]">
                            Dial-In Mode
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-medium transition-colors ${
                              showDialer
                                ? 'bg-[#9B7E48]/20 dark:bg-[#D6C5A1]/20 text-[#9B7E48] dark:text-[#D6C5A1]'
                                : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#706F6A] dark:text-[#858580]'
                            }`}
                          >
                            {showDialer ? 'Dialer ON' : 'Wheel Default'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#706F6A] dark:text-[#858580] mt-0.5">
                          {showDialer
                            ? 'Dial-in pad active for custom entry'
                            : 'Mechanical wheel active (turn toggle ON to dial)'}
                        </p>
                      </div>
                    </div>

                    {/* Tactile Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showDialer}
                      onClick={() => {
                        setShowDialer((prev) => {
                          const next = !prev;
                          playTickSound(preferences.hapticsSoundEnabled);
                          return next;
                        });
                      }}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        showDialer
                          ? 'bg-[#9B7E48] dark:bg-[#D6C5A1]'
                          : 'bg-black/15 dark:bg-white/20'
                      }`}
                      aria-label="Toggle Dial-In Mode"
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white dark:bg-[#121212] shadow-md ring-0 transition duration-200 ease-in-out ${
                          showDialer ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Active Input Tool: Mechanical Escapement Wheel by default; Dialer when toggle is ON */}
                  {showDialer ? (
                    <KeypadInput
                      currency={preferences.currency}
                      onCommitExpense={handleCommitExpense}
                      soundEnabled={preferences.hapticsSoundEnabled}
                      selectedCategoryName={activeCategoryInfo?.name || 'Expense'}
                      onSwitchToWheel={() => {
                        setShowDialer(false);
                        playTickSound(preferences.hapticsSoundEnabled);
                      }}
                    />
                  ) : (
                    <AmountWheel
                      currency={preferences.currency}
                      onCommitExpense={handleCommitExpense}
                      autoLogDelayMs={preferences.autoLogDelayMs}
                      soundEnabled={preferences.hapticsSoundEnabled}
                      selectedCategoryName={activeCategoryInfo?.name || 'Expense'}
                    />
                  )}
                </div>

                {/* Right zone on Desktop & Tablet: Studio Metrics + Recent Activity */}
                <div className="lg:col-span-6 space-y-5">
                  {/* Executive Monthly Snapshot Card (Visible on Tablet & Desktop) */}
                  <div className="hidden md:grid grid-cols-2 gap-3 p-4 rounded-3xl bg-white/60 dark:bg-[#0E0E0E]/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-mono text-[#706F6A] dark:text-[#858580] block">
                        Month Spent
                      </span>
                      <FormattedAmount
                        amount={currentMonthTotal}
                        currency={preferences.currency}
                        symbolSize={15}
                        className="text-xl font-bold font-editorial text-[#141312] dark:text-[#F4F2EF] mt-0.5"
                      />
                      <span className="text-[11px] text-[#706F6A] dark:text-[#858580] block mt-1">
                        {budgetPercentUsed}% of monthly limit
                      </span>
                    </div>

                    <div className="border-l border-black/[0.06] dark:border-white/[0.06] pl-4">
                      <span className="text-[10px] uppercase tracking-wider font-mono text-[#706F6A] dark:text-[#858580] block">
                        Budget Remaining
                      </span>
                      <FormattedAmount
                        amount={budgetRemaining}
                        currency={preferences.currency}
                        symbolSize={15}
                        className="text-xl font-bold font-editorial text-[#9B7E48] dark:text-[#D6C5A1] mt-0.5"
                      />
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-1">
                        Pacing within target
                      </span>
                    </div>
                  </div>

                  {/* Recent Expenses List with Quick Delete and Undo */}
                  <RecentExpenses
                    expenses={expenses}
                    currency={preferences.currency}
                    onSelectExpense={setEditingExpense}
                    onDeleteExpense={handleDeleteExpense}
                    onUndoLastExpense={handleUndo}
                    canUndo={expenses.length > 0}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <HistoryView
              expenses={expenses}
              currency={preferences.currency}
              onSelectExpense={setEditingExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsView
              expenses={expenses}
              currency={preferences.currency}
              monthlyBudget={preferences.monthlyBudget}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
              expenses={expenses}
              onResetData={handleResetData}
              onClearData={handleClearData}
            />
          )}
        </div>

        {/* Transaction Detail & Edit Modal */}
        {editingExpense && (
          <TransactionModal
            expense={editingExpense}
            currency={preferences.currency}
            onClose={() => setEditingExpense(null)}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}
      </main>

      {/* Minimalist Bottom Navigation Bar - Rendered outside <main> to stay strictly fixed on screen across mobile scrolling */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
