/**
 * Compares two arrays of strings and returns an object containing the following properties:
 * - `isEqual`: A boolean indicating whether the two arrays are equal (same length and same elements in the same order).
 * - `added`: An array of strings that are present in the `next` array but not in the `previous` array.
 * - `removed`: An array of strings that are present in the `previous` array but not in the `next` array.
 * - `shared`: An array of strings that are present in both arrays.
 *
 * @param previous - The first array of strings to compare.
 * @param next - The second array of strings to compare.
 * @returns An object containing the comparison results.
 */
export function compareStringArrays(previous: readonly string[], next: readonly string[]) {
  const previousSet = new Set(previous);
  const nextSet = new Set(next);

  return {
    isEqual:
      previous.length === next.length && previous.every((value, index) => value === next[index]),
    added: next.filter((value) => !previousSet.has(value)),
    removed: previous.filter((value) => !nextSet.has(value)),
    shared: next.filter((value) => previousSet.has(value)),
  };
}
