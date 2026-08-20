import { describe, expect, it } from 'vitest';
import { absoluteUrl } from './site';

// No VITE_SITE_URL is set for tests, so site.ts falls back to this default.
const SITE_URL = 'https://mariamecoulibaly-com-ui.vercel.app';

describe('absoluteUrl', () => {
  it('resolves a relative path against the default site URL', () => {
    expect(absoluteUrl('/projects/residenthome')).toBe(
      `${SITE_URL}/projects/residenthome`,
    );
  });

  it('adds a leading slash when missing', () => {
    expect(absoluteUrl('about-me')).toBe(`${SITE_URL}/about-me`);
  });

  it('returns already-absolute URLs unchanged', () => {
    expect(absoluteUrl('https://example.com/img.jpg')).toBe(
      'https://example.com/img.jpg',
    );
  });
});
