/**
 * Returns true if the given date string falls within the optional from/to range.
 */
export function matchesDateRange(dateString: string, from: string, to: string): boolean {
  if (!from && !to) return true;
  const date = new Date(dateString);

  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return date >= fromDate && date <= toDate;
  }

  if (from) {
    const fromDate = new Date(from);
    return date >= fromDate;
  }

  if (to) {
    const toDate = new Date(to);
    return date <= toDate;
  }

  return true;
}
