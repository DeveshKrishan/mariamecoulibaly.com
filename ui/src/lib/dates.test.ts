import { describe, expect, it } from 'vitest';
import { formatDetailDate, formatShortDate } from './dates';

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
  it('formats ISO dates like the reference detail page (Mon D)', () => {
    expect(formatDetailDate('2026-07-22')).toBe('Jul 22');
    expect(formatDetailDate('2021-08-05')).toBe('Aug 5');
  });

  it('returns the input when the date cannot be parsed', () => {
    expect(formatDetailDate('nope')).toBe('nope');
  });
});
