import type { AboutPage, Project } from '@mariame/shared';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  status: number;

  constructor(path: string, status: number) {
    super(`Request to ${path} failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

export type AdminMe = {
  email: string;
  displayName: string;
};

async function request<T>(
  path: string,
  init?: RequestInit & { accessToken?: string },
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.accessToken) {
    headers.set('Authorization', `Bearer ${init.accessToken}`);
  }
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) {
    throw new ApiError(path, res.status);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function getProjects(): Promise<Project[]> {
  return request<Project[]>('/api/projects');
}

export function getProject(slug: string): Promise<Project> {
  return request<Project>(`/api/projects/${slug}`);
}

export function getAboutPage(): Promise<AboutPage> {
  return request<AboutPage>('/api/pages/about');
}

export function getAdminMe(accessToken: string): Promise<AdminMe> {
  return request<AdminMe>('/api/admin/me', { accessToken });
}
