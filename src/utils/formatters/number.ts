/**
 * Formats a numeric value with standard grouping separators (e.g. 1204 -> "1,204").
 *
 * @param value - The number to format.
 */
export const formatNumber = (value: number): string =>
  new Intl.NumberFormat("en-US").format(value);

/**
 * Formats a large number compactly, e.g. 12_500 -> "12.5K".
 * Intended for chart axis ticks or dense displays where space is the constraint.
 *
 * @param value - The number to format.
 */
export const formatCompactNumber = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
