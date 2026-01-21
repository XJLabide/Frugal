import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting - Philippine Peso
export const CURRENCY_SYMBOL = "₱";

export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${Math.abs(amount).toFixed(2)}`;
}

export function formatCurrencyWithSign(amount: number, type: 'income' | 'expense'): string {
  const sign = type === 'income' ? '+' : '-';
  return `${sign}${CURRENCY_SYMBOL}${Math.abs(amount).toFixed(2)}`;
}
