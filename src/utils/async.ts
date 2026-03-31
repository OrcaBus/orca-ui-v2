/**
 * Pause execution for a given number of milliseconds
 */
export const sleep = (timeout?: number) =>
  new Promise((resolve) => setTimeout(resolve, timeout || 0));
