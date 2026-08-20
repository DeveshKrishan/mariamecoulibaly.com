import { describe, expect, it } from 'vitest';
import { hasContent, stripHtml, truncate } from './text';

describe('hasContent', () => {
  it('is false for empty, undefined, and the "Coming soon." placeholder', () => {
    expect(hasContent('')).toBe(false);
    expect(hasContent(undefined)).toBe(false);
    expect(hasContent(null)).toBe(false);
    expect(hasContent('Coming soon.')).toBe(false);
  });

  it('is true for real content', () => {
    expect(hasContent('Assistant Editor — Freelance')).toBe(true);
  });
});

describe('stripHtml', () => {
  it('removes tags but keeps text content', () => {
    expect(stripHtml('An <em>emerging</em> media professional.')).toBe(
      'An emerging media professional.',
    );
  });
});

describe('truncate', () => {
  it('returns text unchanged when under the limit', () => {
    expect(truncate('short', 20)).toBe('short');
  });

  it('truncates and appends an ellipsis when over the limit', () => {
    expect(truncate('a'.repeat(20), 10)).toBe(`${'a'.repeat(9)}…`);
  });
});
