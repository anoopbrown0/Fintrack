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
  CATEGORIES,
  getInitialSeedData,
} from './utils/expenseLogic';
import { Header } from './components/Header';
import { AmountWheel } from './components/AmountWheel';
import { CategoryPicker } from './components/CategoryPicker';
import { RecentExpenses } from './components/RecentExpenses';
import { HistoryView } from './components/HistoryView';
import { InsightsView } from './components/InsightsView';
import { ProfileView } from './components/ProfileView';
import { BottomNav } from './components/BottomNav';
import { TransactionModal } from './components/TransactionModal';
import { Toast } from './components/Toast';

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

  // Toggle Theme mode
  const handleToggleTheme = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  // Record a new expense from the amount wheel
  const handleCommitExpense = useCallback((amount: number) => {
    const newExpense: Expense = {
      id: `noir-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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

      {/* Main Container - Responsive across mobile, laptop, and desktop viewports */}
      <main className="w-full max-w-md lg:max-w-5xl min-h-screen flex flex-col px-4 sm:px-8 relative bg-[#FBFBFA]/90 dark:bg-[#080808]/90 backdrop-blur-2xl sm:border-x sm:border-[#E5E3DC]/60 dark:sm:border-[#1A1A18]/80 sm:shadow-2xl transition-colors duration-200">
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
              <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start space-y-6 lg:space-y-0">
                {/* Left zone: Category Picker + Amount Wheel (The signature centerpiece) */}
                <div className="lg:col-span-6 space-y-6">
                  <CategoryPicker
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    soundEnabled={preferences.hapticsSoundEnabled}
                  />

                  <AmountWheel
                    currency={preferences.currency}
                    onCommitExpense={handleCommitExpense}
                    autoLogDelayMs={preferences.autoLogDelayMs}
                    soundEnabled={preferences.hapticsSoundEnabled}
                    selectedCategoryName={activeCategoryInfo?.name || 'Expense'}
                  />
                </div>

                {/* Right zone on Desktop: Recent Activity */}
                <div className="lg:col-span-6">
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
