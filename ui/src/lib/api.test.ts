import type { AboutPage, Project } from '../types/content';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createProject,
  deleteProject,
  getAboutPage,
  getAdminMe,
  getAdminProject,
  getProject,
  getProjects,
  listAdminProjects,
  reorderProjects,
  updateAboutPage,
  updateProject,
} from './api';

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

  it('listAdminProjects and getAdminProject use admin paths with bearer', async () => {
    mockFetchOnce([]);
    await listAdminProjects('tok');
    let call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe(`${API_URL}/api/admin/projects`);
    expect(((call[1] as RequestInit).headers as Headers).get('Authorization')).toBe(
      'Bearer tok',
    );

    mockFetchOnce({ slug: 'x' } as Project);
    await getAdminProject('x', 'tok');
    call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe(`${API_URL}/api/admin/projects/x`);
  });

  it('write helpers send Bearer + correct methods/paths', async () => {
    const payload = {
      slug: 'new',
      title: 'New',
      client: '',
      role: '',
      summary: '',
      body: [],
      thumbnailUrl: '',
      sortOrder: 1,
      status: 'draft' as const,
      publishedAt: '2024-01-01T00:00:00Z',
    };

    mockFetchOnce({ ...payload, id: '1' } as Project);
    await createProject(payload, 'tok');
    let call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe(`${API_URL}/api/projects`);
    expect(call[1]).toMatchObject({ method: 'POST' });
    expect(((call[1] as RequestInit).headers as Headers).get('Authorization')).toBe(
      'Bearer tok',
    );

    mockFetchOnce({ ...payload, id: '1' } as Project);
    await updateProject('new', payload, 'tok');
    call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe(`${API_URL}/api/projects/new`);
    expect(call[1]).toMatchObject({ method: 'PATCH' });

    mockFetchOnce(undefined, true, 204);
    await deleteProject('new', 'tok');
    call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe(`${API_URL}/api/projects/new`);
    expect(call[1]).toMatchObject({ method: 'DELETE' });

    mockFetchOnce({ status: 'ok' });
    await reorderProjects(['a', 'b'], 'tok');
    call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe(`${API_URL}/api/projects/reorder`);
    expect(call[1]).toMatchObject({ method: 'PUT' });
    expect(JSON.parse((call[1] as RequestInit).body as string)).toEqual({
      slugs: ['a', 'b'],
    });

    const about = { title: 'About', headline: '', greeting: '', bio: '', photoUrl: '', links: [] };
    mockFetchOnce(about);
    await updateAboutPage(about, 'tok');
    call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe(`${API_URL}/api/pages/about`);
    expect(call[1]).toMatchObject({ method: 'PUT' });
  });
});

describe('assertImageFile', () => {
  it('rejects files over 20 MB with an explicit max message', async () => {
    const { assertImageFile, MAX_IMAGE_BYTES } = await import('./api');
    const file = new File(['x'], 'big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: MAX_IMAGE_BYTES + 1 });
    expect(() => assertImageFile(file)).toThrow(/max 20 MB/i);
  });
});
