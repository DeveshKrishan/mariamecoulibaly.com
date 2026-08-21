import { describe, expect, it } from 'vitest';
import { formatDetailDate, formatShortDate, toDateInputValue } from './dates';

describe('formatShortDate', () => {
  it('formats ISO dates like the reference grid (M/D/YY)', () => {
    expect(formatShortDate('2026-07-22')).toBe('7/22/26');
    expect(formatShortDate('2021-08-05')).toBe('8/5/21');
  });

  it('returns the input when the date cannot be parsed', () => {
    expect(formatShortDate('not-a-date')).toBe('not-a-date');
  });
});

describe('formatDetailDate', () => {
  it('formats ISO dates with month, day, and year', () => {
    expect(formatDetailDate('2026-07-22')).toBe('Jul 22, 2026');
    expect(formatDetailDate('2021-08-05')).toBe('Aug 5, 2021');
  });

  it('returns the input when the date cannot be parsed', () => {
    expect(formatDetailDate('nope')).toBe('nope');
  });
});

describe('toDateInputValue', () => {
  it('returns YYYY-MM-DD for date inputs', () => {
    expect(toDateInputValue('2026-07-22')).toBe('2026-07-22');
    expect(toDateInputValue('2026-07-22T00:00:00Z')).toBe('2026-07-22');
  });

  it('returns empty string when the date cannot be parsed', () => {
    expect(toDateInputValue('nope')).toBe('');
  });
});
