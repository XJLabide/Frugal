import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency configuration
export const CURRENCIES: Record<string, { symbol: string; name: string }> = {
  PHP: { symbol: '₱', name: 'Philippine Peso' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
};

// Keep for backwards compatibility
export const CURRENCY_SYMBOL = "₱";

export function formatCurrency(amount: number, currencyCode: string = 'PHP'): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.PHP;
  return `${currency.symbol}${Math.abs(amount).toFixed(currencyCode === 'JPY' ? 0 : 2)}`;
}

export function formatCurrencyWithSign(amount: number, type: 'income' | 'expense', currencyCode: string = 'PHP'): string {
  const sign = type === 'income' ? '+' : '-';
  const currency = CURRENCIES[currencyCode] || CURRENCIES.PHP;
  return `${sign}${currency.symbol}${Math.abs(amount).toFixed(currencyCode === 'JPY' ? 0 : 2)}`;
}
