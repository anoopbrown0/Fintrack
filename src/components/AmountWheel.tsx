import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CurrencyCode } from '../types/expense';
import { playMechanicalTick, playCommitSound, triggerHaptic } from '../utils/audio';
import { CurrencySymbol, FormattedAmount } from './CurrencySymbol';
import { Check, ChevronUp, ChevronDown, RotateCcw, Volume2, VolumeX } from 'lucide-react';

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
const ITEM_HEIGHT = 68;

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

  // Handle mechanical wheel scroll with directional ratchet clicks
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
      const direction = clampedIndex > lastIndexRef.current ? 'down' : 'up';
      lastIndexRef.current = clampedIndex;
      setSelectedIndex(clampedIndex);
      // Authentic mechanical watch escapement ratchet click
      playMechanicalTick(direction, soundEnabled);
      triggerHaptic(7, soundEnabled);
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
    playMechanicalTick('neutral', soundEnabled);
    triggerHaptic(10, soundEnabled);
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
      playMechanicalTick(delta > 0 ? 'down' : 'up', soundEnabled);
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
    <div className="w-full flex flex-col items-center select-none">
      {/* Precision Scale Selector */}
      <div className="flex items-center gap-1 p-1 bg-white/70 dark:bg-[#121212]/80 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-2xl mb-4 transition-all shadow-xs">
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
              <span className="text-[10px] opacity-75 flex items-center font-mono">
                (<CurrencySymbol currency={currency} size={9} className="mr-0.5" />{rangeLabel})
              </span>
            </button>
          );
        })}
      </div>

      {/* Mechanical Wheel Housing with Milled Knurled Bezel & Escapement Ticks */}
      <div className="relative w-full max-w-sm h-[270px] flex items-center justify-center select-none overflow-hidden rounded-3xl bg-white/80 dark:bg-[#0B0B0B]/90 backdrop-blur-3xl border border-black/[0.08] dark:border-white/[0.1] shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all">
        {/* Knurled Left Edge Flange (Milled gear teeth representation) */}
        <div className="absolute left-2 top-0 bottom-0 w-3 flex flex-col justify-around py-4 pointer-events-none opacity-40 z-10">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={`flange-l-${i}`}
              className="h-1 w-full bg-[#141312] dark:bg-white/40 rounded-full"
            />
          ))}
        </div>

        {/* Knurled Right Edge Flange */}
        <div className="absolute right-12 top-0 bottom-0 w-3 flex flex-col justify-around py-4 pointer-events-none opacity-40 z-10">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={`flange-r-${i}`}
              className="h-1 w-full bg-[#141312] dark:bg-white/40 rounded-full"
            />
          ))}
        </div>

        {/* Top & Bottom Depth Vignettes */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white via-white/70 to-transparent dark:from-[#0B0B0B] dark:via-[#0B0B0B]/70 z-10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/70 to-transparent dark:from-[#0B0B0B] dark:via-[#0B0B0B]/70 z-10" />

        {/* Mechanical Center Detent Frame with Champagne Needle Alignment Markers */}
        <div className="pointer-events-none absolute inset-x-6 h-[68px] rounded-2xl border border-[#9B7E48]/60 dark:border-[#D6C5A1]/50 bg-[#9B7E48]/[0.08] dark:bg-[#D6C5A1]/[0.05] backdrop-blur-md z-10 flex items-center justify-between px-3 transition-colors shadow-xs">
          {/* Left Jewel Detent Pip */}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#9B7E48] dark:bg-[#D6C5A1] shadow-[0_0_8px_rgba(214,197,161,0.6)]" />
            <div className="w-3 h-0.5 bg-[#9B7E48]/70 dark:bg-[#D6C5A1]/70" />
          </div>

          {/* Calibrated Ticks in Center Selection */}
          <div className="flex items-center gap-1.5 opacity-30">
            <div className="h-2 w-px bg-current" />
            <div className="h-3 w-px bg-current" />
            <div className="h-2 w-px bg-current" />
          </div>

          {/* Right Jewel Detent Pip */}
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-[#9B7E48]/70 dark:bg-[#D6C5A1]/70" />
            <div className="w-2 h-2 rounded-full bg-[#9B7E48] dark:bg-[#D6C5A1] shadow-[0_0_8px_rgba(214,197,161,0.6)]" />
          </div>
        </div>

        {/* Precision Stepper Buttons (Up / Down) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => stepAmount(-1)}
            disabled={selectedIndex <= 0}
            className="w-8 h-8 rounded-xl bg-white/90 dark:bg-white/[0.08] backdrop-blur-md border border-black/[0.08] dark:border-white/[0.12] text-[#706F6A] dark:text-[#858580] hover:text-[#9B7E48] dark:hover:text-[#D6C5A1] hover:border-[#9B7E48]/50 dark:hover:border-[#D6C5A1]/50 flex items-center justify-center disabled:opacity-25 cursor-pointer active:scale-90 transition-all shadow-xs"
            aria-label="Decrease mechanical step"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => stepAmount(1)}
            disabled={selectedIndex >= amounts.length - 1}
            className="w-8 h-8 rounded-xl bg-white/90 dark:bg-white/[0.08] backdrop-blur-md border border-black/[0.08] dark:border-white/[0.12] text-[#706F6A] dark:text-[#858580] hover:text-[#9B7E48] dark:hover:text-[#D6C5A1] hover:border-[#9B7E48]/50 dark:hover:border-[#D6C5A1]/50 flex items-center justify-center disabled:opacity-25 cursor-pointer active:scale-90 transition-all shadow-xs"
            aria-label="Increase mechanical step"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Scrollable Mechanical Cylinder Drum */}
        <div
          ref={containerRef}
          onPointerDown={() => { isUserGestureRef.current = true; }}
          onTouchStart={() => { isUserGestureRef.current = true; }}
          onWheel={() => { isUserGestureRef.current = true; }}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-scroll no-scrollbar snap-y snap-mandatory py-[101px] text-center"
          style={{ scrollBehavior: 'smooth' }}
          role="region"
          aria-label="Mechanical amount dial"
        >
          {amounts.map((amt, idx) => {
            const distance = Math.abs(idx - selectedIndex);
            const isCenter = distance === 0;

            let opacityClass = 'opacity-100 scale-100';
            if (distance === 1) opacityClass = 'opacity-45 scale-90';
            else if (distance === 2) opacityClass = 'opacity-20 scale-75';
            else if (distance >= 3) opacityClass = 'opacity-5 scale-65';

            return (
              <div
                key={`${activeScale}-${amt}-${idx}`}
                onClick={() => {
                  isUserGestureRef.current = true;
                  setHasUserInteracted(true);
                  setSelectedIndex(idx);
                  lastIndexRef.current = idx;
                  scrollToIndex(idx, true);
                  playMechanicalTick('neutral', soundEnabled);
                  triggerHaptic(10, soundEnabled);
                }}
                className={`h-[68px] flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${opacityClass}`}
              >
                <div className="flex items-center gap-2">
                  {/* Subtle index notch indicator on major numbers */}
                  <span className="text-[10px] font-mono opacity-40 w-4 text-right">
                    {idx + 1}
                  </span>

                  <FormattedAmount
                    amount={amt}
                    currency={currency}
                    symbolSize={isCenter ? 26 : 16}
                    className={
                      isCenter
                        ? 'text-3xl sm:text-4xl font-editorial font-bold text-[#141312] dark:text-[#F4F2EF] tracking-tight'
                        : 'text-2xl text-[#8E8D87] dark:text-[#858580]'
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mechanical Status & Escapement Countdown Bar */}
      <div className="w-full max-w-sm mt-3 px-1 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-[#706F6A] dark:text-[#858580] min-h-[22px]">
          <span className="font-editorial italic text-sm text-[#9B7E48] dark:text-[#D6C5A1] flex items-center gap-1.5">
            {isCommitted ? (
              <>
                <span>Recorded</span>
                <FormattedAmount amount={selectedAmount} currency={currency} symbolSize={12} />
                <span>for {selectedCategoryName}</span>
              </>
            ) : isScrolling ? (
              'Escapement in motion...'
            ) : hasUserInteracted && countdownProgress > 0 ? (
              `Auto-logging to ${selectedCategoryName}...`
            ) : (
              `Rotate dial to select amount`
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
            className={`flex-1 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 cursor-pointer min-h-[48px] ${
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
