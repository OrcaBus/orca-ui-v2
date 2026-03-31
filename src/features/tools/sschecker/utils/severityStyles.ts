import type { ValidationResult } from '../types';

export type Severity = ValidationResult['severity'];

export interface SeverityStyles {
  border: string;
  badge: string;
  text: string;
}

export function getSeverityStyles(severity: Severity): SeverityStyles {
  switch (severity) {
    case 'debug':
      return {
        border: 'border-neutral-300 dark:border-neutral-600',
        badge: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300',
        text: 'text-neutral-800 dark:text-neutral-200',
      };
    case 'info':
      return {
        border: 'border-blue-200 dark:border-blue-800',
        badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
        text: 'text-neutral-800 dark:text-neutral-200',
      };
    case 'warning':
      return {
        border: 'border-amber-300 dark:border-amber-700',
        badge: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
        text: 'text-neutral-800 dark:text-neutral-200',
      };
    case 'error':
      return {
        border: 'border-red-300 dark:border-red-700',
        badge: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
        text: 'text-neutral-800 dark:text-neutral-200',
      };
    case 'critical':
      return {
        border: 'border-red-400 dark:border-red-600',
        badge: 'bg-red-600 dark:bg-red-700 text-white',
        text: 'text-neutral-800 dark:text-neutral-200',
      };
  }
}

export const SEVERITY_ICON_CLASSES: Record<Severity, string> = {
  debug: 'h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400',
  info: 'h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400',
  warning: 'h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400',
  error: 'h-4 w-4 shrink-0 text-red-500 dark:text-red-400',
  critical: 'h-4 w-4 shrink-0 text-red-500 dark:text-red-400',
};
