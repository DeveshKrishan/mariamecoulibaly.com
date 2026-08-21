import type { AboutPage, Project } from '@mariame/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAboutPage, getAdminMe, getProject, getProjects } from './api';

// No VITE_API_URL is set for tests, so api.ts falls back to this default.
const API_URL = 'http://localhost:4000';

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  const response = {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response;
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
  return response;
}

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getProjects fetches the projects list endpoint', async () => {
    const projects: Project[] = [];
    mockFetchOnce(projects);

    const result = await getProjects();

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/api/projects`, expect.any(Object));
    expect(result).toEqual(projects);
  });

  it('getProject fetches a single project by slug', async () => {
    const project = { slug: 'my-project' } as Project;
    mockFetchOnce(project);

    const result = await getProject('my-project');

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/api/projects/my-project`,
      expect.any(Object),
    );
    expect(result).toEqual(project);
  });

  it('getAboutPage fetches the about page endpoint', async () => {
    const about = { headline: 'Hi' } as AboutPage;
    mockFetchOnce(about);

    const result = await getAboutPage();

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/api/pages/about`,
      expect.any(Object),
    );
    expect(result).toEqual(about);
  });

  it('getAdminMe sends Authorization bearer token', async () => {
    mockFetchOnce({ email: 'a@b.com', displayName: 'A' });

    const result = await getAdminMe('tok');

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/api/admin/me`,
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
    const call = vi.mocked(fetch).mock.calls[0];
    const headers = (call[1] as RequestInit).headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer tok');
    expect(result.email).toBe('a@b.com');
  });

  it('throws when the response is not ok', async () => {
    mockFetchOnce({}, false, 500);

    await expect(getProjects()).rejects.toThrow(
      'Request to /api/projects failed with status 500',
    );
  });
});
