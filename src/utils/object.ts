/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Omit keys from object
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

/**
 * Clean object from undefined, null, or empty string
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export function cleanObject(obj: Record<string, any>) {
  return Object.keys(obj).reduce(
    (prev: Record<string, any>, key) => {
      const val = obj[key];
      if (val !== undefined && val !== null && val !== '') {
        prev[key] = val;
      }
      return prev;
    },
    {} as Record<string, any>
  );
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment */

/**
 * Get query params from URLSearchParams (uses cleanObject)
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
export const getQueryParams = (searchParams: URLSearchParams) => {
  const params = [...searchParams.entries()].reduce((acc, tuple) => {
    const [key, val] = tuple;
    if (Object.prototype.hasOwnProperty.call(acc, key)) {
      if (Array.isArray(acc[key])) {
        acc[key] = [...acc[key], val];
      } else {
        acc[key] = [acc[key], val];
      }
    } else {
      acc[key] = val;
    }
    return acc;
  }, {} as any);
  return cleanObject(params);
};
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
