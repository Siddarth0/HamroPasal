import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a number as NPR (Rs.) with Nepali/Indian-style grouping. */
export function formatPrice(value: number): string {
  return `Rs. ${Math.round(value).toLocaleString('en-IN')}`;
}
