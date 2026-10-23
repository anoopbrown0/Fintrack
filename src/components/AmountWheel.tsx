import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CurrencyCode } from '../types/expense';
import { playTickSound, playCommitSound, triggerHaptic } from '../utils/audio';
import { CurrencySymbol, FormattedAmount } from './CurrencySymbol';
import { Check, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';

interface AmountWheelProps {
  currency: CurrencyCode;
  onCommitExpense: (amount: number) => void;
  autoLogDelayMs: number;
  soundEnabled: boolean;
  selectedCategoryName: string;
}

const SCALES = {
  standard: [
    10, 20, 30, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500, 650, 800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000,
  ],
  micro: [
    5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 120, 150, 200, 250,
  ],
  major: [
    100, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000, 15000, 20000, 25000, 50000,
  ],
};

type ScaleType = 'micro' | 'standard' | 'major';
const ITEM_HEIGHT = 64;

export const AmountWheel: React.FC<AmountWheelProps> = ({
  currency,
  onCommitExpense,
  autoLogDelayMs,
  soundEnabled,
  selectedCategoryName,
}) => {
  const [activeScale, setActiveScale] = useState<ScaleType>('standard');
  const amounts = SCALES[activeScale];
  const [selectedIndex, setSelectedIndex] = useState<number>(6); // Default 100
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);
  const [countdownProgress, setCountdownProgress] = useState<number>(0);
  const [isCommitted, setIsCommitted] = useState<boolean>(false);
  const [lastCommittedAmount, setLastCommittedAmount] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastIndexRef = useRef<number>(selectedIndex);

  const selectedAmount = amounts[selectedIndex] || amounts[0];

  const isUserGestureRef = useRef<boolean>(false);
  const isProgrammaticScrollRef = useRef<boolean>(false);

  // Scroll to index
  const scrollToIndex = useCallback((index: number, smooth = true) => {
    if (!containerRef.current) return;
    isProgrammaticScrollRef.current = true;
    const targetScroll = index * ITEM_HEIGHT;
    containerRef.current.scrollTo({
      top: targetScroll,
      behavior: smooth ? 'smooth' : 'auto',
    });
    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 200);
  }, []);

  // Initial scroll position
  useEffect(() => {
    scrollToIndex(selectedIndex, false);
  }, []);

  // Handle wheel scroll
  const handleScroll = () => {
    if (!containerRef.current) return;

    if (!isUserGestureRef.current) {
      return;
    }

    setIsScrolling(true);
    setHasUserInteracted(true);
    setCountdownProgress(0);
    setIsCommitted(false);

    const scrollTop = containerRef.current.scrollTop;
    const rawIndex = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(amounts.length - 1, rawIndex));

    if (clampedIndex !== lastIndexRef.current) {
      lastIndexRef.current = clampedIndex;
      setSelectedIndex(clampedIndex);
      playTickSound(soundEnabled);
      triggerHaptic(6, soundEnabled);
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      isUserGestureRef.current = false;
      scrollToIndex(clampedIndex, true);
    }, 120);
  };

  // Commit selected amount
  const commitExpense = useCallback(() => {
    if (isCommitted) return;
    setIsCommitted(true);
    setLastCommittedAmount(selectedAmount);
    playCommitSound(soundEnabled);
    triggerHaptic([12, 50, 18], soundEnabled);
    onCommitExpense(selectedAmount);
    setCountdownProgress(0);
  }, [isCommitted, selectedAmount, soundEnabled, onCommitExpense]);

  // Debounced auto-log countdown
  useEffect(() => {
    if (!hasUserInteracted) return;

    if (isScrolling) {
      setCountdownProgress(0);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      return;
    }

    if (isCommitted && lastCommittedAmount === selectedAmount) {
      return;
    }

    if (autoLogDelayMs <= 0) {
      return;
    }

    const intervalTime = 40;
    const totalSteps = autoLogDelayMs / intervalTime;
    let step = 0;

    countdownIntervalRef.current = setInterval(() => {
      step += 1;
      const progress = Math.min(100, Math.round((step / totalSteps) * 100));
      setCountdownProgress(progress);

      if (progress >= 100) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        commitExpense();
      }
    }, intervalTime);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [
    hasUserInteracted,
    isScrolling,
    selectedIndex,
    autoLogDelayMs,
    commitExpense,
    isCommitted,
    lastCommittedAmount,
    selectedAmount,
  ]);

  const handleScaleChange = (scale: ScaleType) => {
    setActiveScale(scale);
    setHasUserInteracted(false);
    const newAmounts = SCALES[scale];
    const midIndex = Math.min(5, Math.floor(newAmounts.length / 3));
    setSelectedIndex(midIndex);
    lastIndexRef.current = midIndex;
    setIsCommitted(false);
    setTimeout(() => {
      scrollToIndex(midIndex, false);
    }, 40);
  };

  const stepAmount = (delta: number) => {
    const nextIndex = Math.max(0, Math.min(amounts.length - 1, selectedIndex + delta));
    if (nextIndex !== selectedIndex) {
      isUserGestureRef.current = true;
      setHasUserInteracted(true);
      setSelectedIndex(nextIndex);
      lastIndexRef.current = nextIndex;
      scrollToIndex(nextIndex, true);
      playTickSound(soundEnabled);
      triggerHaptic(8, soundEnabled);
    }
  };

  const cancelCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setCountdownProgress(0);
    setIsCommitted(true);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Scale Switcher Tabs */}
      <div className="flex items-center gap-1 p-1.5 bg-white/70 dark:bg-[#121212]/70 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-2xl mb-4 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        {(['micro', 'standard', 'major'] as ScaleType[]).map((scale) => {
          const isActive = activeScale === scale;
          const rangeLabel =
            scale === 'micro'
              ? '5–250'
              : scale === 'standard'
              ? '10–10k'
              : '100–50k';

          return (
            <button
              key={scale}
              type="button"
              onClick={() => handleScaleChange(scale)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all capitalize whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                isActive
                  ? 'bg-[#F2EFE6]/90 dark:bg-white/[0.12] text-[#9B7E48] dark:text-[#D6C5A1] border border-[#9B7E48]/30 dark:border-[#D6C5A1]/30 font-semibold shadow-xs'
                  : 'text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]'
              }`}
              aria-label={`Switch scale to ${scale}`}
            >
              <span>{scale}</span>
              <span className="text-[10px] opacity-75 flex items-center">
                (<CurrencySymbol currency={currency} size={9} className="mr-0.5" />{rangeLabel})
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Wheel Viewport - Frosted Glass Cylindrical Drum */}
      <div className="relative w-full max-w-sm h-[256px] flex items-center justify-center select-none overflow-hidden rounded-3xl bg-white/60 dark:bg-[#0A0A0A]/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all">
        {/* Soft frosted gradient masks */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/90 via-white/50 to-transparent dark:from-[#0A0A0A]/95 dark:via-[#0A0A0A]/60 z-10 transition-colors" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/90 via-white/50 to-transparent dark:from-[#0A0A0A]/95 dark:via-[#0A0A0A]/60 z-10 transition-colors" />

        {/* Center Selection Frame & Champagne Hairlines */}
        <div className="pointer-events-none absolute inset-x-4 h-[64px] rounded-2xl border border-[#9B7E48]/50 dark:border-[#D6C5A1]/40 bg-[#9B7E48]/[0.06] dark:bg-[#D6C5A1]/[0.04] backdrop-blur-md z-10 flex items-center justify-between px-3.5 transition-colors shadow-xs">
          <div className="w-1.5 h-1.5 rounded-full bg-[#9B7E48] dark:bg-[#D6C5A1] opacity-80" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#9B7E48] dark:bg-[#D6C5A1] opacity-80" />
        </div>

        {/* Stepper Buttons (Up / Down) */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => stepAmount(-1)}
            disabled={selectedIndex <= 0}
            className="w-8 h-8 rounded-xl bg-white/80 dark:bg-white/[0.08] backdrop-blur-md border border-black/[0.06] dark:border-white/[0.1] text-[#706F6A] dark:text-[#858580] hover:text-[#9B7E48] dark:hover:text-[#D6C5A1] hover:border-[#9B7E48]/40 dark:hover:border-[#D6C5A1]/40 flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95 transition-all shadow-xs"
            aria-label="Decrease amount"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => stepAmount(1)}
            disabled={selectedIndex >= amounts.length - 1}
            className="w-8 h-8 rounded-xl bg-white/80 dark:bg-white/[0.08] backdrop-blur-md border border-black/[0.06] dark:border-white/[0.1] text-[#706F6A] dark:text-[#858580] hover:text-[#9B7E48] dark:hover:text-[#D6C5A1] hover:border-[#9B7E48]/40 dark:hover:border-[#D6C5A1]/40 flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-95 transition-all shadow-xs"
            aria-label="Increase amount"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Vertically Scrollable Amount Column */}
        <div
          ref={containerRef}
          onPointerDown={() => { isUserGestureRef.current = true; }}
          onTouchStart={() => { isUserGestureRef.current = true; }}
          onWheel={() => { isUserGestureRef.current = true; }}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-scroll no-scrollbar snap-y snap-mandatory py-[96px] text-center"
          style={{ scrollBehavior: 'smooth' }}
          role="region"
          aria-label="Amount selection wheel"
        >
          {amounts.map((amt, idx) => {
            const distance = Math.abs(idx - selectedIndex);
            const isCenter = distance === 0;

            let opacityClass = 'opacity-100 scale-100';
            if (distance === 1) opacityClass = 'opacity-40 scale-90';
            else if (distance === 2) opacityClass = 'opacity-20 scale-80';
            else if (distance >= 3) opacityClass = 'opacity-5 scale-70';

            return (
              <div
                key={`${activeScale}-${amt}-${idx}`}
                onClick={() => {
                  isUserGestureRef.current = true;
                  setHasUserInteracted(true);
                  setSelectedIndex(idx);
                  lastIndexRef.current = idx;
                  scrollToIndex(idx, true);
                  playTickSound(soundEnabled);
                  triggerHaptic(10, soundEnabled);
                }}
                className={`h-[64px] flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${opacityClass}`}
              >
                <FormattedAmount
                  amount={amt}
                  currency={currency}
                  symbolSize={isCenter ? 24 : 16}
                  className={
                    isCenter
                      ? 'text-3xl sm:text-4xl font-editorial font-bold text-[#141312] dark:text-[#F4F2EF]'
                      : 'text-2xl text-[#8E8D87] dark:text-[#858580]'
                  }
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Status / Auto-Log Countdown Bar */}
      <div className="w-full max-w-sm mt-3 px-1 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-[#706F6A] dark:text-[#858580] min-h-[22px]">
          <span className="font-editorial italic text-sm text-[#9B7E48] dark:text-[#D6C5A1] flex items-center gap-1">
            {isCommitted ? (
              <>
                <span>Logged</span>
                <FormattedAmount amount={selectedAmount} currency={currency} symbolSize={12} />
                <span>for {selectedCategoryName}</span>
              </>
            ) : isScrolling ? (
              'Scrolling...'
            ) : hasUserInteracted && countdownProgress > 0 ? (
              `Auto-logging to ${selectedCategoryName}...`
            ) : (
              `Scroll wheel to select amount`
            )}
          </span>

          {!isCommitted && countdownProgress > 0 && (
            <button
              type="button"
              onClick={cancelCountdown}
              className="inline-flex items-center gap-1 text-[11px] text-[#706F6A] dark:text-[#858580] hover:text-[#141312] dark:hover:text-[#F4F2EF] px-2.5 py-0.5 rounded-full bg-white/60 dark:bg-white/[0.06] backdrop-blur-md border border-black/[0.08] dark:border-white/[0.1] cursor-pointer"
              aria-label="Cancel auto-logging"
            >
              <RotateCcw size={10} />
              Cancel
            </button>
          )}
        </div>

        {/* Progress Bar Line */}
        <div className="relative w-full h-1 bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden transition-colors">
          <div
            className={`h-full transition-all duration-75 ${
              isCommitted
                ? 'bg-emerald-500 w-full'
                : countdownProgress > 0
                ? 'bg-[#9B7E48] dark:bg-[#D6C5A1]'
                : 'bg-transparent w-0'
            }`}
            style={{ width: isCommitted ? '100%' : `${countdownProgress}%` }}
          />
        </div>

        {/* Action Row: Immediate Log Button */}
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={commitExpense}
            className={`flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 cursor-pointer min-h-[48px] ${
              isCommitted
                ? 'bg-[#F2EFE6] dark:bg-[#181818] border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 shadow-sm'
                : 'bg-[#9B7E48] hover:bg-[#8A6E3B] text-white dark:bg-[#D6C5A1] dark:text-[#080808] dark:hover:bg-[#E2D4B6] active:scale-[0.98] shadow-[0_8px_24px_rgba(155,126,72,0.22)] dark:shadow-[0_8px_28px_rgba(214,197,161,0.2)] font-semibold'
            }`}
            aria-label={`Log expense of ${selectedAmount} for ${selectedCategoryName}`}
          >
            {isCommitted ? (
              <>
                <Check size={18} className="text-emerald-500 dark:text-emerald-400" />
                <span>Recorded</span>
              </>
            ) : (
              <>
                <span>Log</span>
                <FormattedAmount
                  amount={selectedAmount}
                  currency={currency}
                  symbolSize={14}
                  className="font-bold text-inherit"
                />
                <span className="text-xs opacity-80 font-normal">({selectedCategoryName})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
