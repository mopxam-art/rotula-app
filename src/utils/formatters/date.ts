const toDate = (value: Date | string | number): Date =>
  value instanceof Date ? value : new Date(value);

export interface DateFormatOptions {
  timeZone?: string;
}

export interface DateTimeFormatOptions extends DateFormatOptions {
  timeZoneName?:
    | "short"
    | "long"
    | "shortOffset"
    | "longOffset"
    | "shortGeneric"
    | "longGeneric";
}

/** Formats a date in UTC as e.g. "Jul 20, 2026". */
export const formatDate = (
  date: Date | string | number,
  options: DateFormatOptions = {},
): string =>
  toDate(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: options.timeZone ?? "UTC",
  });

/** Formats a date and time with explicit timezone e.g. "Jul 20, 2026, 2:30 PM UTC". */
export const formatDateTime = (
  date: Date | string | number,
  options: DateTimeFormatOptions = {},
): string =>
  toDate(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: options.timeZone ?? "UTC",
    timeZoneName: options.timeZoneName ?? "short",
  });
