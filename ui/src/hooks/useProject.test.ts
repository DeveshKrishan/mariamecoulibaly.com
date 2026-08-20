import type { Project } from '@mariame/shared';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useProject } from './useProject';

const detail: Project = {
  id: '1',
  slug: 'residenthome',
  title: 'Resident Home',
  publishedAt: '2026-07-22',
  client: 'Resident Home/Nectar',
  role: 'Editor',
  summary: 'Summary',
  body: [],
  thumbnailUrl: '/thumb.jpg',
  sortOrder: 0,
  status: 'published',
};

const neighbor: Project = {
  ...detail,
  id: '2',
  slug: 'udacity',
  title: 'Udacity Accenture',
  sortOrder: 1,
};

describe('useProject', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns notFound when slug is missing', () => {
    const { result } = renderHook(() => useProject(undefined));
    expect(result.current).toMatchObject({
      project: null,
      isLoading: false,
      notFound: true,
    });
  });

  it('loads the project and its next neighbor', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith('/api/projects/residenthome')) {
          return {
            ok: true,
            status: 200,
            json: async () => detail,
          } as Response;
        }
        if (url.endsWith('/api/projects')) {
          return {
            ok: true,
            status: 200,
            json: async () => [detail, neighbor],
          } as Response;
        }
        throw new Error(`unexpected fetch: ${url}`);
      }),
    );

    const { result } = renderHook(() => useProject('residenthome'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.project).toEqual(detail);
    expect(result.current.next?.slug).toBe('udacity');
    expect(result.current.previous).toBeNull();
    expect(result.current.notFound).toBe(false);
  });

  it('still returns the project when the list endpoint fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith('/api/projects/residenthome')) {
          return {
            ok: true,
            status: 200,
            json: async () => detail,
          } as Response;
        }
        return { ok: false, status: 500, json: async () => ({}) } as Response;
      }),
    );

    const { result } = renderHook(() => useProject('residenthome'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.project).toEqual(detail);
    expect(result.current.next).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('marks unknown slugs as notFound', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 404,
        json: async () => ({ error: 'project not found' }),
      }) as Response),
    );

    const { result } = renderHook(() => useProject('missing'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.notFound).toBe(true);
    expect(result.current.project).toBeNull();
  });
});
