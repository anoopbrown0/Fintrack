import React, { useState, useEffect, useCallback } from 'react';
import { CurrencyCode } from '../types/expense';
import { playDialTone, playCommitSound, playKeypadClick, triggerHaptic } from '../utils/audio';
import { CurrencySymbol, FormattedAmount } from './CurrencySymbol';
import { Delete, Check, ArrowRight, Disc, RotateCcw } from 'lucide-react';

interface KeypadInputProps {
  currency: CurrencyCode;
  onCommitExpense: (amount: number) => void;
  soundEnabled: boolean;
  selectedCategoryName: string;
  onSwitchToWheel?: () => void;
}

const DIALER_BUTTONS = [
  { digit: '1', sub: ' ' },
  { digit: '2', sub: 'ABC' },
  { digit: '3', sub: 'DEF' },
  { digit: '4', sub: 'GHI' },
  { digit: '5', sub: 'JKL' },
  { digit: '6', sub: 'MNO' },
  { digit: '7', sub: 'PQRS' },
  { digit: '8', sub: 'TUV' },
  { digit: '9', sub: 'WXYZ' },
];

export const KeypadInput: React.FC<KeypadInputProps> = ({
  currency,
  onCommitExpense,
  soundEnabled,
  selectedCategoryName,
  onSwitchToWheel,
}) => {
  const [valueStr, setValueStr] = useState<string>('0');
  const [isCommitted, setIsCommitted] = useState<boolean>(false);

  const numericValue = parseFloat(valueStr) || 0;

  // Key press handler with authentic dialer tones
  const handleDigit = useCallback(
    (digit: string) => {
      setIsCommitted(false);
      playDialTone(digit, soundEnabled);
      triggerHaptic(7, soundEnabled);

      setValueStr((prev) => {
        if (prev === '0') {
          return digit;
        }
        if (prev.length >= 7) return prev; // Limit max digits (e.g. up to 9,999,999)
        return prev + digit;
      });
    },
    [soundEnabled]
  );

  const handleBackspace = useCallback(() => {
    setIsCommitted(false);
    playKeypadClick(soundEnabled);
    triggerHaptic(8, soundEnabled);

    setValueStr((prev) => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  }, [soundEnabled]);

  const handleClear = useCallback(() => {
    setIsCommitted(false);
    playKeypadClick(soundEnabled);
    triggerHaptic([6, 12], soundEnabled);
    setValueStr('0');
  }, [soundEnabled]);

  const handleQuickAdd = useCallback(
    (amountToAdd: number) => {
      setIsCommitted(false);
      playKeypadClick(soundEnabled);
      triggerHaptic(10, soundEnabled);
      setValueStr((prev) => {
        const cur = parseFloat(prev) || 0;
        const next = cur + amountToAdd;
        return next.toString();
      });
    },
    [soundEnabled]
  );

  const handleCommit = useCallback(() => {
    if (numericValue <= 0 || isCommitted) return;
    setIsCommitted(true);
    playCommitSound(soundEnabled);
    triggerHaptic([12, 50, 18], soundEnabled);
    onCommitExpense(numericValue);

    setTimeout(() => {
      setValueStr('0');
      setIsCommitted(false);
    }, 1200);
  }, [numericValue, isCommitted, soundEnabled, onCommitExpense]);

  // Physical keyboard support for desktop/laptop users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleCommit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleBackspace, handleClear, handleCommit]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Precision Dial-In Pad Card */}
      <div className="w-full max-w-sm rounded-3xl bg-white/75 dark:bg-[#0E0E0E]/85 backdrop-blur-3xl border border-black/[0.08] dark:border-white/[0.09] shadow-[0_16px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] p-5 transition-all">
        {/* Top Display Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#9B7E48] dark:bg-[#D6C5A1] animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#706F6A] dark:text-[#858580]">
              Dial-In Pad
            </span>
          </div>

          <span className="text-xs font-editorial italic text-[#9B7E48] dark:text-[#D6C5A1]">
            Target: {selectedCategoryName}
          </span>
        </div>

        {/* Live Active Amount Readout with Tabular Numerals */}
        <div className="py-3 flex items-baseline justify-center gap-1.5 min-h-[72px]">
          <CurrencySymbol
            currency={currency}
            size={28}
            className="text-[#9B7E48] dark:text-[#D6C5A1] opacity-90 transition-transform"
          />
          <span className="text-4xl sm:text-5xl font-editorial font-bold tabular-nums tracking-tight text-[#141312] dark:text-[#F4F2EF]">
            {numericValue > 0 ? numericValue.toLocaleString() : '0'}
          </span>
        </div>

        {/* Quick Increment Preset Chips */}
        <div className="grid grid-cols-4 gap-1.5 mb-3.5">
          {[50, 100, 500, 1000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleQuickAdd(preset)}
              className="py-1.5 px-2 rounded-xl text-xs font-mono font-medium bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-[#706F6A] dark:text-[#A0A09B] hover:text-[#141312] dark:hover:text-[#F4F2EF] border border-black/[0.04] dark:border-white/[0.05] transition-all active:scale-95 cursor-pointer text-center"
              aria-label={`Add ${preset}`}
            >
              +{preset >= 1000 ? `${preset / 1000}k` : preset}
            </button>
          ))}
        </div>

        {/* Phone-Style Luxury Dialer 3x4 Grid */}
        <div className="grid grid-cols-3 gap-2">
          {DIALER_BUTTONS.map(({ digit, sub }) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-white/95 dark:bg-[#151515]/95 hover:bg-[#F2EFE6] dark:hover:bg-[#1F1F1F] active:scale-95 border border-black/[0.06] dark:border-white/[0.08] shadow-xs transition-all flex flex-col items-center justify-center cursor-pointer group"
              aria-label={`Dial ${digit}`}
            >
              <span className="text-xl font-editorial font-bold text-[#141312] dark:text-[#F4F2EF] leading-none">
                {digit}
              </span>
              {sub.trim() && (
                <span className="text-[9px] font-mono tracking-widest text-[#8E8D87] dark:text-[#777] mt-0.5 group-hover:text-[#9B7E48] dark:group-hover:text-[#D6C5A1] transition-colors">
                  {sub}
                </span>
              )}
            </button>
          ))}

          {/* Clear Key */}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.07] active:scale-95 border border-black/[0.04] dark:border-white/[0.06] text-xs font-mono tracking-widest uppercase text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] transition-all flex items-center justify-center cursor-pointer"
            aria-label="Clear value"
          >
            Clear
          </button>

          {/* Digit 0 */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-white/95 dark:bg-[#151515]/95 hover:bg-[#F2EFE6] dark:hover:bg-[#1F1F1F] active:scale-95 border border-black/[0.06] dark:border-white/[0.08] shadow-xs transition-all flex flex-col items-center justify-center cursor-pointer group"
            aria-label="Dial 0"
          >
            <span className="text-xl font-editorial font-bold text-[#141312] dark:text-[#F4F2EF] leading-none">
              0
            </span>
            <span className="text-[9px] font-mono text-[#8E8D87] dark:text-[#777] mt-0.5">
              +
            </span>
          </button>

          {/* Backspace Key */}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.07] active:scale-95 border border-black/[0.04] dark:border-white/[0.06] text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] transition-all flex items-center justify-center cursor-pointer"
            aria-label="Delete last digit"
          >
            <Delete size={18} />
          </button>
        </div>

        {/* Commit Button */}
        <button
          type="button"
          onClick={handleCommit}
          disabled={numericValue <= 0}
          className={`w-full mt-4 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            isCommitted
              ? 'bg-[#F2EFE6] dark:bg-[#181818] border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 shadow-sm'
              : numericValue > 0
              ? 'bg-[#9B7E48] hover:bg-[#8A6E3B] text-white dark:bg-[#D6C5A1] dark:text-[#080808] dark:hover:bg-[#E2D4B6] active:scale-[0.98] shadow-[0_8px_24px_rgba(155,126,72,0.24)] dark:shadow-[0_8px_28px_rgba(214,197,161,0.22)] font-semibold'
              : 'bg-black/[0.05] dark:bg-white/[0.06] text-[#706F6A] dark:text-[#858580]'
          }`}
          aria-label={`Record expense of ${numericValue} for ${selectedCategoryName}`}
        >
          {isCommitted ? (
            <>
              <Check size={18} className="text-emerald-500 dark:text-emerald-400" />
              <span>Recorded</span>
            </>
          ) : (
            <>
              <span>Record</span>
              <FormattedAmount
                amount={numericValue}
                currency={currency}
                symbolSize={14}
                className="font-bold text-inherit"
              />
              <span className="text-xs opacity-80 font-normal">({selectedCategoryName})</span>
              <ArrowRight size={14} className="ml-1 opacity-75" />
            </>
          )}
        </button>

        {/* Switch back to Wheel shortcut */}
        {onSwitchToWheel && (
          <div className="mt-3 pt-3 border-t border-black/[0.05] dark:border-white/[0.06] text-center">
            <button
              type="button"
              onClick={onSwitchToWheel}
              className="inline-flex items-center gap-1.5 text-xs text-[#706F6A] dark:text-[#858580] hover:text-[#9B7E48] dark:hover:text-[#D6C5A1] transition-colors cursor-pointer"
            >
              <Disc size={13} />
              <span>Turn off dialer & use default wheel</span>
            </button>
          </div>
        )}
      </div>

      {/* Keyboard Hint for Desktop */}
      <p className="mt-2.5 text-[11px] font-mono text-[#8E8D87] dark:text-[#6E6E69] hidden sm:block">
        Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.1]">0-9</kbd> and <kbd className="px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.1]">Enter</kbd> to record
      </p>
    </div>
  );
};
