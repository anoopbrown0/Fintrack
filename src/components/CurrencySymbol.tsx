import React from 'react';
import { CurrencyCode } from '../types/expense';

interface CurrencySymbolProps {
  currency: CurrencyCode;
  className?: string;
  size?: number;
}

/**
 * Universal luxury currency glyph renderer.
 * For INR, renders an authentic crisp SVG vector symbol so it NEVER renders as a tofu box
 * on systems missing Devanagari/Indian Rupee system fonts.
 */
export const CurrencySymbol: React.FC<CurrencySymbolProps> = ({
  currency,
  className = '',
  size = 14,
}) => {
  if (currency === 'INR') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`inline-block align-middle shrink-0 ${className}`}
        aria-hidden="true"
      >
        {/* Crisp authentic Indian Rupee glyph */}
        <path d="M6 3h12" />
        <path d="M6 8h12" />
        <path d="M6 13l8.5 8" />
        <path d="M6 13h3a4 4 0 0 0 0-8" />
      </svg>
    );
  }

  const symbols: Record<CurrencyCode, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AED: 'AED ',
    CAD: 'CA$',
  };

  return <span className={className}>{symbols[currency] || '₹'}</span>;
};

/**
 * Helper to render an amount with the crisp currency symbol
 */
export const FormattedAmount: React.FC<{
  amount: number;
  currency: CurrencyCode;
  className?: string;
  symbolSize?: number;
}> = ({ amount, currency, className = '', symbolSize }) => {
  const rounded = Math.round(amount);
  const formattedNumber =
    currency === 'INR'
      ? rounded.toLocaleString('en-IN')
      : rounded.toLocaleString('en-US');

  return (
    <span className={`inline-flex items-center gap-0.5 tabular-nums ${className}`}>
      <CurrencySymbol currency={currency} size={symbolSize} />
      <span>{formattedNumber}</span>
    </span>
  );
};
