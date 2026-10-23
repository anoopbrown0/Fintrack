import React, { useState } from 'react';
import { CurrencyCode, Expense, ThemeMode, UserPreferences } from '../types/expense';
import {
  CURRENCIES,
  calculateMonthTotal,
  calculateBudgetMetrics,
  generateCSV,
} from '../utils/expenseLogic';
import { CurrencySymbol, FormattedAmount } from './CurrencySymbol';
import {
  User,
  Shield,
  CreditCard,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Check,
  X,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';

interface ProfileViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  expenses: Expense[];
  onResetData: () => void;
  onClearData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  preferences,
  onUpdatePreferences,
  expenses,
  onResetData,
  onClearData,
}) => {
  const [activeModal, setActiveModal] = useState<
    'budget' | 'currency' | 'account' | 'about' | 'privacy' | 'help' | null
  >(null);

  const [tempBudget, setTempBudget] = useState(preferences.monthlyBudget);
  const [tempName, setTempName] = useState(preferences.name);
  const [tempEmail, setTempEmail] = useState(preferences.email);
  const [exportNotice, setExportNotice] = useState(false);

  const monthTotal = calculateMonthTotal(expenses);
  const budgetMetrics = calculateBudgetMetrics(monthTotal, preferences.monthlyBudget);

  const initials = preferences.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'NB';

  const handleExportCSV = () => {
    const csvContent = generateCSV(expenses);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fintrack-expenses-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempBudget > 0) {
      onUpdatePreferences({ monthlyBudget: tempBudget });
      setActiveModal(null);
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences({
      name: tempName.trim() || preferences.name,
      email: tempEmail.trim() || preferences.email,
    });
    setActiveModal(null);
  };

  return (
    <div className="w-full pb-36 sm:pb-32">
      {/* Top Header */}
      <div className="mb-4">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#706F6A] dark:text-[#858580] font-medium">
          YOUR SPACE
        </span>
      </div>

      {/* Responsive Layout Grid for Laptop / Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (Desktop lg:col-span-5): Identity & Monthly Overview */}
        <div className="lg:col-span-5 space-y-5">
          {/* Avatar & User Hero */}
          <div className="flex items-center gap-4 p-5 rounded-3xl bg-white/70 dark:bg-[#121212]/70 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#F4F0E6]/80 dark:bg-white/[0.08] backdrop-blur-md border-2 border-[#9B7E48]/50 dark:border-[#D6C5A1]/50 flex items-center justify-center text-[#9B7E48] dark:text-[#D6C5A1] text-lg font-serif font-bold tracking-wider shadow-sm shadow-[#9B7E48]/10 dark:shadow-[#D6C5A1]/10">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#080808] border border-[#9B7E48]/40 dark:border-[#D6C5A1]/40 flex items-center justify-center">
                <Sparkles size={10} className="text-[#9B7E48] dark:text-[#D6C5A1]" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium text-[#141312] dark:text-[#F4F2EF] truncate">
                  {preferences.name}
                </h2>
                <span className="text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#F4F0E6] dark:bg-white/[0.1] border border-[#9B7E48]/30 dark:border-[#D6C5A1]/30 text-[#9B7E48] dark:text-[#D6C5A1] font-semibold">
                  {preferences.membershipStatus}
                </span>
              </div>
              <p className="text-xs text-[#706F6A] dark:text-[#858580] truncate mt-0.5">{preferences.email}</p>
              <p className="text-xs font-serif italic text-[#9B7E48] dark:text-[#D6C5A1] mt-1.5">
                “Your finances, your rhythm.”
              </p>
            </div>
          </div>

          {/* Compact Monthly Overview Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-[#121212]/70 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-xs uppercase tracking-[0.15em] text-[#706F6A] dark:text-[#858580]">
                  Monthly Spending
                </span>
                <div className="mt-0.5">
                  <FormattedAmount
                    amount={monthTotal}
                    currency={preferences.currency}
                    symbolSize={18}
                    className="text-2xl font-serif font-bold text-[#141312] dark:text-[#F4F2EF]"
                  />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-[0.15em] text-[#706F6A] dark:text-[#858580]">
                  Remaining Budget
                </span>
                <div className="mt-0.5">
                  <FormattedAmount
                    amount={budgetMetrics.remaining}
                    currency={preferences.currency}
                    symbolSize={12}
                    className="text-sm font-semibold text-[#9B7E48] dark:text-[#D6C5A1]"
                  />
                </div>
              </div>
            </div>

            {/* Thin Budget Progress Line */}
            <div className="w-full h-1 bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden mt-3 mb-2">
              <div
                className={`h-full transition-all duration-300 ${
                  budgetMetrics.isOver ? 'bg-red-500' : 'bg-[#9B7E48] dark:bg-[#D6C5A1]'
                }`}
                style={{ width: `${Math.min(100, budgetMetrics.percentUsed)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#706F6A] dark:text-[#858580]">
              <span>{budgetMetrics.percentUsed}% spent</span>
              <span className="font-serif italic text-[#9B7E48] dark:text-[#D6C5A1]">
                {budgetMetrics.percentSaved}% remaining savings potential
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (Desktop lg:col-span-7): Settings & Preferences */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section: Account */}
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#706F6A] dark:text-[#858580] font-medium px-1 block mb-2">
              Account
            </span>
            <div className="rounded-2xl bg-white/70 dark:bg-[#121212]/70 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] divide-y divide-black/[0.04] dark:divide-white/[0.06] overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setTempName(preferences.name);
                  setTempEmail(preferences.email);
                  setActiveModal('account');
                }}
                className="w-full flex items-center justify-between p-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors text-left cursor-pointer min-h-[52px]"
              >
                <div className="flex items-center gap-3">
                  <User size={16} className="text-[#706F6A] dark:text-[#858580]" />
                  <span className="text-xs font-medium text-[#141312] dark:text-[#F4F2EF]">Personal Information</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#706F6A] dark:text-[#858580]">
                  <span>{preferences.name}</span>
                  <ChevronRight size={14} />
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTempBudget(preferences.monthlyBudget);
                  setActiveModal('budget');
                }}
                className="w-full flex items-center justify-between p-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors text-left cursor-pointer min-h-[52px]"
              >
                <div className="flex items-center gap-3">
                  <CreditCard size={16} className="text-[#706F6A] dark:text-[#858580]" />
                  <span className="text-xs font-medium text-[#141312] dark:text-[#F4F2EF]">Monthly Budget Limit</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#9B7E48] dark:text-[#D6C5A1]">
                  <FormattedAmount
                    amount={preferences.monthlyBudget}
                    currency={preferences.currency}
                    symbolSize={12}
                    className="font-medium"
                  />
                  <ChevronRight size={14} />
                </div>
              </button>

              <div className="flex items-center justify-between p-3.5 text-xs">
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-[#706F6A] dark:text-[#858580]" />
                  <span className="font-medium text-[#141312] dark:text-[#F4F2EF]">Membership Status</span>
                </div>
                <span className="text-[#9B7E48] dark:text-[#D6C5A1] font-medium">{preferences.membershipStatus}</span>
              </div>
            </div>
          </div>

          {/* Section: Preferences */}
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#706F6A] dark:text-[#858580] font-medium px-1 block mb-2">
              Preferences
            </span>
            <div className="rounded-2xl bg-white/70 dark:bg-[#121212]/70 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] divide-y divide-black/[0.04] dark:divide-white/[0.06] overflow-hidden shadow-xs">
              {/* Theme / Appearance Switcher */}
              <div className="p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {preferences.theme === 'dark' ? (
                    <Moon size={16} className="text-[#9B7E48] dark:text-[#D6C5A1]" />
                  ) : (
                    <Sun size={16} className="text-[#9B7E48] dark:text-[#D6C5A1]" />
                  )}
                  <div>
                    <span className="font-medium text-[#141312] dark:text-[#F4F2EF] block">Appearance Theme</span>
                    <span className="text-[11px] text-[#706F6A] dark:text-[#858580]">Light or pure dark luxury theme</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-[#F4F0E6]/80 dark:bg-white/[0.08] p-1 rounded-xl border border-black/[0.04] dark:border-white/[0.08]">
                  {(['dark', 'light'] as ThemeMode[]).map((mode) => {
                    const isSelected = preferences.theme === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => onUpdatePreferences({ theme: mode })}
                        className={`px-3 py-1 rounded-lg text-[11px] capitalize transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#9B7E48] text-white dark:bg-[#D6C5A1] dark:text-[#080808] font-bold shadow-xs'
                            : 'text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF]'
                        }`}
                      >
                        {mode === 'dark' ? <Moon size={11} /> : <Sun size={11} />}
                        <span>{mode}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Currency Selector */}
              <button
                type="button"
                onClick={() => setActiveModal('currency')}
                className="w-full flex items-center justify-between p-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors text-left cursor-pointer min-h-[52px]"
              >
                <span className="text-xs font-medium text-[#141312] dark:text-[#F4F2EF]">Currency</span>
                <div className="flex items-center gap-1.5 text-xs text-[#9B7E48] dark:text-[#D6C5A1]">
                  <CurrencySymbol currency={preferences.currency} size={12} />
                  <span>{CURRENCIES[preferences.currency]?.name}</span>
                  <ChevronRight size={14} />
                </div>
              </button>

              {/* Auto-Log Debounce Delay */}
              <div className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-[#141312] dark:text-[#F4F2EF] block">Wheel Auto-Log Delay</span>
                  <span className="text-[11px] text-[#706F6A] dark:text-[#858580]">Time to settle before recording</span>
                </div>
                <div className="flex items-center gap-1 bg-[#F4F0E6]/80 dark:bg-white/[0.08] p-1 rounded-xl border border-black/[0.04] dark:border-white/[0.08]">
                  {[1000, 1500, 2000, 0].map((delay) => {
                    const isSelected = preferences.autoLogDelayMs === delay;
                    const label = delay === 0 ? 'Manual' : `${delay / 1000}s`;
                    return (
                      <button
                        key={delay}
                        type="button"
                        onClick={() => onUpdatePreferences({ autoLogDelayMs: delay })}
                        className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#9B7E48] text-white dark:bg-[#D6C5A1] dark:text-[#080808] font-bold shadow-xs'
                            : 'text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sound & Haptic Toggle */}
              <div className="p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {preferences.hapticsSoundEnabled ? (
                    <Volume2 size={16} className="text-[#9B7E48] dark:text-[#D6C5A1]" />
                  ) : (
                    <VolumeX size={16} className="text-[#706F6A] dark:text-[#858580]" />
                  )}
                  <div>
                    <span className="font-medium text-[#141312] dark:text-[#F4F2EF] block">Tactile Audio & Haptics</span>
                    <span className="text-[11px] text-[#706F6A] dark:text-[#858580]">Subtle watch clicks on rotation</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdatePreferences({
                      hapticsSoundEnabled: !preferences.hapticsSoundEnabled,
                    })
                  }
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                    preferences.hapticsSoundEnabled ? 'bg-[#9B7E48] dark:bg-[#D6C5A1] justify-end' : 'bg-[#DCDAD2] dark:bg-[#272725] justify-start'
                  }`}
                  aria-label="Toggle haptic sound"
                >
                  <div className="w-5 h-5 rounded-full bg-white dark:bg-[#080808]" />
                </button>
              </div>
            </div>
          </div>

          {/* Section: Support & Data */}
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#706F6A] dark:text-[#858580] font-medium px-1 block mb-2">
              Support & Data
            </span>
            <div className="rounded-2xl bg-white/70 dark:bg-[#121212]/70 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] divide-y divide-black/[0.04] dark:divide-white/[0.06] overflow-hidden shadow-xs">
              {/* Export CSV */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="w-full flex items-center justify-between p-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors text-left cursor-pointer min-h-[52px]"
              >
                <div className="flex items-center gap-3">
                  <Download size={16} className="text-[#706F6A] dark:text-[#858580]" />
                  <div>
                    <span className="text-xs font-medium text-[#141312] dark:text-[#F4F2EF] block">Export Ledger CSV</span>
                    <span className="text-[11px] text-[#706F6A] dark:text-[#858580]">Download complete history</span>
                  </div>
                </div>
                {exportNotice ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Exported!</span>
                ) : (
                  <ChevronRight size={14} className="text-[#706F6A] dark:text-[#858580]" />
                )}
              </button>

              {/* Reset to Sample Data */}
              <button
                type="button"
                onClick={onResetData}
                className="w-full flex items-center justify-between p-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors text-left cursor-pointer min-h-[52px]"
              >
                <div className="flex items-center gap-3">
                  <RotateCcw size={16} className="text-[#706F6A] dark:text-[#858580]" />
                  <span className="text-xs font-medium text-[#141312] dark:text-[#F4F2EF]">Reset to Sample Ledger</span>
                </div>
                <ChevronRight size={14} className="text-[#706F6A] dark:text-[#858580]" />
              </button>

              {/* Help & Support */}
              <button
                type="button"
                onClick={() => setActiveModal('help')}
                className="w-full flex items-center justify-between p-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors text-left cursor-pointer min-h-[52px]"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle size={16} className="text-[#706F6A] dark:text-[#858580]" />
                  <span className="text-xs font-medium text-[#141312] dark:text-[#F4F2EF]">Help & Concierge</span>
                </div>
                <ChevronRight size={14} className="text-[#706F6A] dark:text-[#858580]" />
              </button>

              {/* About FinTrack */}
              <button
                type="button"
                onClick={() => setActiveModal('about')}
                className="w-full flex items-center justify-between p-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors text-left cursor-pointer min-h-[52px]"
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-[#706F6A] dark:text-[#858580]" />
                  <span className="text-xs font-medium text-[#141312] dark:text-[#F4F2EF]">About FinTrack, Privacy & Terms</span>
                </div>
                <ChevronRight size={14} className="text-[#706F6A] dark:text-[#858580]" />
              </button>
            </div>
          </div>

          {/* Sign Out & Version footer */}
          <div className="pt-2 text-center space-y-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset local session preferences to defaults?')) {
                  onResetData();
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer py-1 px-3.5 rounded-full border border-red-200 dark:border-red-950/40 bg-white/40 dark:bg-white/[0.02]"
            >
              <LogOut size={13} />
              <span>Sign Out of Session</span>
            </button>
            <p className="text-[11px] text-[#8E8D87] dark:text-[#555] tracking-wider uppercase">
              FinTrack v2.4.0 · Precision Luxury Finance
            </p>
          </div>
        </div>
      </div>

      {/* --- MODALS with Glassmorphism --- */}

      {/* Currency Modal */}
      {activeModal === 'currency' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 dark:bg-black/75 backdrop-blur-md p-0 sm:p-4">
          <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-white/90 dark:bg-[#141414]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08] mb-3">
              <h3 className="text-sm font-semibold text-[#141312] dark:text-[#F4F2EF]">Select Currency</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
                const isSelected = preferences.currency === code;
                const config = CURRENCIES[code];
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      onUpdatePreferences({ currency: code });
                      setActiveModal(null);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F2EFE6] dark:bg-white/[0.12] border border-[#9B7E48]/50 dark:border-[#D6C5A1]/50 text-[#9B7E48] dark:text-[#D6C5A1] font-semibold'
                        : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CurrencySymbol currency={code} size={15} />
                      <span className="text-xs">{config.name}</span>
                    </div>
                    {isSelected && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {activeModal === 'budget' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 dark:bg-black/75 backdrop-blur-md p-0 sm:p-4">
          <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-white/90 dark:bg-[#141414]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08] mb-4">
              <h3 className="text-sm font-semibold text-[#141312] dark:text-[#F4F2EF]">Monthly Budget Target</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label htmlFor="budget-input" className="block text-xs uppercase tracking-wider text-[#706F6A] dark:text-[#858580] mb-1 font-medium">
                  Budget Cap ({preferences.currency})
                </label>
                <input
                  id="budget-input"
                  type="number"
                  min="500"
                  step="500"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(Number(e.target.value))}
                  className="w-full bg-[#F4F0E6]/80 dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.1] focus:border-[#9B7E48] dark:focus:border-[#D6C5A1] rounded-2xl px-4 py-3 text-xl font-bold tabular-nums text-[#141312] dark:text-[#F4F2EF] outline-none"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5">
                {[25000, 50000, 75000, 100000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTempBudget(preset)}
                    className="flex-1 py-1.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] hover:border-[#9B7E48]/40 dark:hover:border-[#D6C5A1]/40 text-[11px] text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] cursor-pointer tabular-nums"
                  >
                    <FormattedAmount amount={preset} currency={preferences.currency} symbolSize={10} />
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-[#9B7E48] hover:bg-[#8A6E3B] text-white dark:bg-[#D6C5A1] dark:text-[#080808] dark:hover:bg-[#E2D4B6] font-bold text-xs cursor-pointer shadow-xs"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Info Modal */}
      {activeModal === 'account' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 dark:bg-black/75 backdrop-blur-md p-0 sm:p-4">
          <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-white/90 dark:bg-[#141414]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08] mb-4">
              <h3 className="text-sm font-semibold text-[#141312] dark:text-[#F4F2EF]">Edit Account Profile</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveAccount} className="space-y-3">
              <div>
                <label htmlFor="name-input" className="block text-xs uppercase tracking-wider text-[#706F6A] dark:text-[#858580] mb-1 font-medium">
                  Full Name
                </label>
                <input
                  id="name-input"
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full bg-[#F4F0E6]/80 dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.1] focus:border-[#9B7E48] dark:focus:border-[#D6C5A1] rounded-2xl px-3.5 py-2.5 text-sm text-[#141312] dark:text-[#F4F2EF] outline-none"
                />
              </div>

              <div>
                <label htmlFor="email-input" className="block text-xs uppercase tracking-wider text-[#706F6A] dark:text-[#858580] mb-1 font-medium">
                  Email
                </label>
                <input
                  id="email-input"
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  className="w-full bg-[#F4F0E6]/80 dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.1] focus:border-[#9B7E48] dark:focus:border-[#D6C5A1] rounded-2xl px-3.5 py-2.5 text-sm text-[#141312] dark:text-[#F4F2EF] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-[#9B7E48] hover:bg-[#8A6E3B] text-white dark:bg-[#D6C5A1] dark:text-[#080808] dark:hover:bg-[#E2D4B6] font-bold text-xs cursor-pointer shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* About FinTrack & Privacy Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-white/95 dark:bg-[#141414]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] p-6 max-h-[80vh] overflow-y-auto no-scrollbar shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08] mb-4">
              <h3 className="text-base font-serif italic text-[#141312] dark:text-[#F4F2EF]">About FinTrack</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="text-xs text-[#706F6A] dark:text-[#858580] space-y-3 leading-relaxed">
              <p className="text-[#141312] dark:text-[#F4F2EF] font-medium">
                FinTrack is an unapologetically minimalist personal expense tracker engineered for high-intent individuals.
              </p>
              <p>
                By replacing cumbersome numeric keypads with an interactive, tactile amount wheel, FinTrack transforms financial logging into an effortless physical ritual.
              </p>
              <h4 className="text-xs font-semibold text-[#9B7E48] dark:text-[#D6C5A1] uppercase tracking-wider pt-2">
                Zero Cloud Telemetry & Data Sovereignty
              </h4>
              <p>
                All your records reside strictly in your local device storage. No third-party ad networks, no tracking beacons, and no telemetry tickers.
              </p>
              <h4 className="text-xs font-semibold text-[#9B7E48] dark:text-[#D6C5A1] uppercase tracking-wider pt-2">
                Designed for One-Handed Use
              </h4>
              <p>
                Every interactive element sits strictly within the natural thumb reach zone to ensure uninterrupted flow.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full mt-5 py-2.5 rounded-2xl bg-[#F4F0E6] dark:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.1] text-xs font-medium text-[#141312] dark:text-[#F4F2EF] hover:border-[#9B7E48]/40 dark:hover:border-[#D6C5A1]/40 cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Help Concierge Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-white/95 dark:bg-[#141414]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] p-6 max-h-[80vh] overflow-y-auto no-scrollbar shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08] mb-4">
              <h3 className="text-base font-serif italic text-[#141312] dark:text-[#F4F2EF]">FinTrack Concierge & FAQs</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-[#141312] dark:text-[#F4F2EF] mb-1">How does the Amount Wheel auto-log?</h4>
                <p className="text-[#706F6A] dark:text-[#858580]">
                  Scroll to your expense amount. When you pause, a progress indicator initiates. After the debounce period (default 1.5s), your expense is saved automatically to the active category.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#141312] dark:text-[#F4F2EF] mb-1">Can I undo an accidental entry?</h4>
                <p className="text-[#706F6A] dark:text-[#858580]">
                  Yes. A toast notification with an “Undo” action appears immediately upon recording. You can also tap “Undo Last” in the Recent Activity list or delete it from the Ledger.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#141312] dark:text-[#F4F2EF] mb-1">How do I switch currencies?</h4>
                <p className="text-[#706F6A] dark:text-[#858580]">
                  Navigate to Preferences &gt; Currency in this space to switch between INR (₹), USD ($), EUR (€), GBP (£), JPY (¥), and AED.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full mt-5 py-2.5 rounded-2xl bg-[#9B7E48] hover:bg-[#8A6E3B] text-white dark:bg-[#D6C5A1] dark:text-[#080808] dark:hover:bg-[#E2D4B6] font-semibold text-xs cursor-pointer shadow-xs"
            >
              Back to Space
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
