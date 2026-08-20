// Date helpers for portfolio display. Parse "YYYY-MM-DD" parts directly
// (rather than `new Date(isoDate)`) to avoid UTC-vs-local timezone shifts
// rolling the date back a day.

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

function parseIsoDateParts(
  isoDate: string,
): { year: string; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) return null;
  const [, year, month, day] = match;
  return { year, month: Number(month), day: Number(day) };
}

/** Grid card format matching the reference site, e.g. "7/22/26". */
export function formatShortDate(isoDate: string): string {
  const parts = parseIsoDateParts(isoDate);
  if (!parts) return isoDate;
  return `${parts.month}/${parts.day}/${parts.year.slice(-2)}`;
}

/** Project detail format matching the reference site, e.g. "Jul 22". */
export function formatDetailDate(isoDate: string): string {
  const parts = parseIsoDateParts(isoDate);
  if (!parts) return isoDate;
  const monthName = MONTH_SHORT[parts.month - 1];
  if (!monthName) return isoDate;
  return `${monthName} ${parts.day}`;
}
