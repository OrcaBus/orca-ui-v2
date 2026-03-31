/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Get environment variables from window.config or import.meta.env
 */
declare global {
  interface Window {
    config: Record<string, any>;
  }
}
export const env = (() => {
  if (typeof window !== 'undefined') {
    return Object.keys(window.config || {}).length === 0 ? import.meta.env : window.config;
  }
  return import.meta.env;
})();
