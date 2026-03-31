import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine multiple classes into one string
 * @param classes - the classes to combine
 * @returns the combined class names
 * @example
 * const classNames = ['btn', 'btn-primary', 'btn-lg'];
 * const combinedClassNames = cn(...classNames);
 * console.log(combinedClassNames); // btn btn-primary
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
