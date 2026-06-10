import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a number as NPR (Rs.) with Nepali/Indian-style grouping. */
export function formatPrice(value: number): string {
  return `Rs. ${Math.round(value).toLocaleString('en-IN')}`;
}

/** Short, human date — e.g. "10 Jun 2026". */
export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Date + time — e.g. "10 Jun 2026, 14:30". */
export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
