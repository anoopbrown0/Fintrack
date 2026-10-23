import React from 'react';
import { CurrencyCode, NavigationTab, ThemeMode } from '../types/expense';
import { FormattedAmount } from './CurrencySymbol';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  todayTotal: number;
  currency: CurrencyCode;
  activeTab: NavigationTab;
  onOpenProfile: () => void;
  userInitials: string;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  todayTotal,
  currency,
  activeTab,
  onOpenProfile,
  userInitials,
  theme,
  onToggleTheme,
}) => {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="w-full pt-3 pb-3 flex items-center justify-between border-b border-[#E5E3DC] dark:border-[#1C1C1A]/80 mb-5 transition-colors">
      {/* Brand & Date */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-serif tracking-[0.18em] font-bold text-[#141312] dark:text-[#F4F2EF]">
            FINTRACK
          </span>
          <span className="text-[10px] text-[#706F6A] dark:text-[#666] tracking-widest uppercase">
            / STUDIO
          </span>
        </div>
        <span className="text-[11px] text-[#706F6A] dark:text-[#858580] tracking-wide block mt-0.5">
          {dateFormatted}
        </span>
      </div>

      {/* Today's Spend Callout, Theme Toggle, & Profile Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-[0.15em] text-[#706F6A] dark:text-[#858580] block font-medium">
            Today
          </span>
          <FormattedAmount
            amount={todayTotal}
            currency={currency}
            symbolSize={14}
            className="text-lg font-serif font-bold text-[#9B7E48] dark:text-[#D6C5A1]"
          />
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-full bg-white dark:bg-[#181818] border border-[#E5E3DC] dark:border-[#272725] hover:border-[#9B7E48] dark:hover:border-[#D6C5A1] flex items-center justify-center text-[#706F6A] dark:text-[#858580] hover:text-[#9B7E48] dark:hover:text-[#D6C5A1] transition-all cursor-pointer shadow-xs"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Profile Avatar Trigger */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="w-9 h-9 rounded-full bg-white dark:bg-[#181818] border border-[#9B7E48]/40 dark:border-[#D6C5A1]/40 flex items-center justify-center text-xs font-serif font-bold text-[#9B7E48] dark:text-[#D6C5A1] hover:border-[#9B7E48] dark:hover:border-[#D6C5A1] transition-all cursor-pointer shadow-xs"
          aria-label="Open Space and Profile"
        >
          {userInitials}
        </button>
      </div>
    </header>
  );
};
