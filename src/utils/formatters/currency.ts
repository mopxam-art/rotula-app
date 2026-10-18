/**
 * Formats a numeric amount as a localized currency string.
 *
 * @param amount - The value to format.
 * @param currency - ISO 4217 currency code (defaults to USD).
 */
export const formatCurrency = (amount: number, currency = "USD"): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

/**
 * Formats a numeric amount compactly with a localized currency symbol,
 * e.g. 12_500 -> "$12.5K".
 *
 * @param value - The value to format.
 * @param currency - ISO 4217 currency code (defaults to USD).
 */
export const formatCompactCurrency = (
  value: number,
  currency = "USD",
): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    // Pin the minimum to zero so whole amounts render as "$1M" rather than
    // "$1.0M" on ICU versions that pad the compact unit to one decimal.
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);

// Re-exported so existing imports from this module keep working while the
// implementations live together in `number.ts`.
export { formatCompactNumber } from "./number";
