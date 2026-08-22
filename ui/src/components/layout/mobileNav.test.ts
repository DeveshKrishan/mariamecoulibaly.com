import { describe, expect, it } from 'vitest';
import { shouldCloseMobileMenuOnClick } from './mobileNav';

describe('shouldCloseMobileMenuOnClick', () => {
  it('keeps the overlay open when navigating to a different route', () => {
    expect(shouldCloseMobileMenuOnClick('/about-me', '/')).toBe(false);
    expect(shouldCloseMobileMenuOnClick('/', '/about-me')).toBe(false);
  });

  it('closes the overlay when tapping the already-active route', () => {
    expect(shouldCloseMobileMenuOnClick('/about-me', '/about-me')).toBe(true);
    expect(shouldCloseMobileMenuOnClick('/', '/')).toBe(true);
  });
});
