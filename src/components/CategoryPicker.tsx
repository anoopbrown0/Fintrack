import React from 'react';
import {
  UtensilsCrossed,
  Compass,
  Coffee,
  ShoppingBag,
  Receipt,
  Sparkles,
  HeartPulse,
  Layers,
} from 'lucide-react';
import { CategoryId, CategoryInfo } from '../types/expense';
import { CATEGORIES } from '../utils/expenseLogic';
import { playTickSound, triggerHaptic } from '../utils/audio';

interface CategoryPickerProps {
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  soundEnabled: boolean;
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

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  selectedCategory,
  onSelectCategory,
  soundEnabled,
}) => {
  const handleSelect = (cat: CategoryInfo) => {
    playTickSound(soundEnabled);
    triggerHaptic(10, soundEnabled);
    onSelectCategory(cat.id);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs uppercase tracking-[0.2em] text-[#706F6A] dark:text-[#858580] font-medium">
          Category
        </span>
        <span className="text-xs font-serif italic text-[#9B7E48] dark:text-[#D6C5A1]">
          {CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Selected'}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id];
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat)}
              className={`group relative flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl transition-all duration-200 min-h-[58px] cursor-pointer ${
                isSelected
                  ? 'bg-[#F2EFE6]/90 dark:bg-white/[0.14] backdrop-blur-xl border border-[#9B7E48] dark:border-[#D6C5A1]/80 text-[#141312] dark:text-[#F4F2EF] shadow-[0_4px_16px_rgba(155,126,72,0.15)] dark:shadow-[0_4px_20px_rgba(214,197,161,0.15)] scale-[1.02]'
                  : 'bg-white/65 dark:bg-[#121212]/65 backdrop-blur-xl border border-black/[0.05] dark:border-white/[0.08] text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] hover:border-black/15 dark:hover:border-white/20 hover:bg-white/80 dark:hover:bg-[#161616]/75'
              }`}
              aria-label={`Select category ${cat.name}`}
              aria-pressed={isSelected}
            >
              <div
                className={`w-6 h-6 flex items-center justify-center mb-1 transition-transform duration-200 ${
                  isSelected ? 'scale-110 text-[#9B7E48] dark:text-[#D6C5A1]' : 'group-hover:scale-105'
                }`}
              >
                <Icon size={18} strokeWidth={isSelected ? 2.3 : 1.7} />
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight truncate max-w-full ${
                  isSelected ? 'text-[#141312] dark:text-[#F4F2EF] font-semibold' : 'text-[#706F6A] dark:text-[#858580]'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
