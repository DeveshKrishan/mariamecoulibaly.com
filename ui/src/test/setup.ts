import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Unmount rendered components between tests (RTL's auto-cleanup relies on a
// global `afterEach`, which we don't enable via vitest's `globals` option).
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement IntersectionObserver, which Framer Motion's
// `whileInView` (used by ProjectCard) relies on.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly scrollMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(): void {}
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
