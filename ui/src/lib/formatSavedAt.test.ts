import { describe, expect, it } from 'vitest';
import { formatSavedAt } from './formatSavedAt';

describe('formatSavedAt', () => {
  it('formats as dd/mm/yyyy HH:mm:ss in local time', () => {
    // Construct via local components so the assertion is timezone-stable.
    const date = new Date(2026, 7, 21, 18, 5, 9); // 21 Aug 2026 18:05:09 local
    expect(formatSavedAt(date)).toBe('21/08/2026 18:05:09');
  });

  it('zero-pads single-digit day, month, and time parts', () => {
    const date = new Date(2026, 0, 3, 9, 8, 7); // 3 Jan 2026 09:08:07 local
    expect(formatSavedAt(date)).toBe('03/01/2026 09:08:07');
  });
});
