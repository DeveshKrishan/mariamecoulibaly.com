import { describe, expect, it } from 'vitest';
import { absoluteUrl } from './site';

// Resolve the same way site.ts does (env may set VITE_SITE_URL in .env.local).
const SITE_URL = (
  import.meta.env.VITE_SITE_URL ??
  'https://mariamecoulibaly-com-ui.vercel.app'
).replace(/\/+$/, '');

describe('absoluteUrl', () => {
  it('resolves a relative path against the configured site URL', () => {
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
