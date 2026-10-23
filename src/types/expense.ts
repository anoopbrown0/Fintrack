export type CategoryId =
  | 'food'
  | 'travel'
  | 'coffee'
  | 'shopping'
  | 'bills'
  | 'entertainment'
  | 'health'
  | 'other';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  iconName: string;
  tagline: string;
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AED' | 'CAD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToInr: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: CategoryId;
  timestamp: number; // Unix timestamp ms
  currency: CurrencyCode;
  note?: string;
}

export type ThemeMode = 'dark' | 'light';

export interface UserPreferences {
  name: string;
  email: string;
  membershipStatus: string;
  currency: CurrencyCode;
  monthlyBudget: number;
  autoLogDelayMs: number; // e.g. 1500ms debounce before auto-logging
  hapticsSoundEnabled: boolean;
  reducedMotion: boolean;
  theme: ThemeMode;
}

export type NavigationTab = 'home' | 'history' | 'insights' | 'profile';
