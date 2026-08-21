import { describe, expect, it } from 'vitest';
import { reorderSlugs } from '../components/portfolio/ProjectGrid';
import { slugifyTitle, uniqueSlug } from './slug';

describe('slug helpers', () => {
  it('slugifyTitle kebab-cases titles', () => {
    expect(slugifyTitle('Hello World')).toBe('hello-world');
    expect(slugifyTitle('  ')).toBe('untitled');
  });

  it('uniqueSlug appends a counter when taken', () => {
    const existing = new Set(['untitled', 'untitled-2']);
    expect(uniqueSlug('untitled', existing)).toBe('untitled-3');
  });
});

describe('reorderSlugs', () => {
  it('moves active slug before over slug', () => {
    expect(reorderSlugs(['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b']);
  });

  it('returns the same list when ids are missing', () => {
    expect(reorderSlugs(['a', 'b'], 'x', 'a')).toEqual(['a', 'b']);
  });
});
