import React from 'react';
import { NavigationTab } from '../types/expense';
import { Disc, Clock, PieChart, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Wheel', icon: Disc },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'insights', label: 'Insights', icon: PieChart },
  { id: 'profile', label: 'Space', icon: User },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none"
      style={{
        bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
      }}
      aria-label="Main navigation dock"
    >
      {/* iPhone Floating Glass Dock Container */}
      <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-2xl sm:rounded-full bg-white/85 dark:bg-[#121212]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.14] shadow-[0_12px_36px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.7)] transition-all">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-full transition-all duration-200 cursor-pointer min-h-[44px] group ${
                isActive
                  ? 'bg-[#F2EFE6]/90 dark:bg-white/[0.12] text-[#9B7E48] dark:text-[#D6C5A1] shadow-xs'
                  : 'text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
              }`}
              aria-label={`Navigate to ${item.label}`}
              aria-selected={isActive}
              role="tab"
            >
              <div
                className={`relative flex items-center justify-center transition-transform duration-200 ${
                  isActive ? 'scale-105' : 'group-hover:scale-110'
                }`}
              >
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.3 : 1.8}
                  className={isActive ? 'text-[#9B7E48] dark:text-[#D6C5A1]' : 'text-current'}
                />
              </div>

              <span
                className={`text-xs tracking-tight font-medium transition-all ${
                  isActive
                    ? 'font-semibold text-[#9B7E48] dark:text-[#D6C5A1]'
                    : 'text-current hidden xs:inline'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-0.5 rounded-full bg-[#9B7E48] dark:bg-[#D6C5A1]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
