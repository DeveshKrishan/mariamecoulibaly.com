import type { AboutPage, Project } from '../types/content';

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

/** Payload for create/update project writes. */
export type ProjectWritePayload = {
  slug?: string;
  title: string;
  client: string;
  role: string;
  summary: string;
  body: Project['body'];
  thumbnailUrl: string;
  sortOrder: number;
  status: Project['status'];
  publishedAt: string;
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

export function listAdminProjects(accessToken: string): Promise<Project[]> {
  return request<Project[]>('/api/admin/projects', { accessToken });
}

export function getAdminProject(
  slug: string,
  accessToken: string,
): Promise<Project> {
  return request<Project>(`/api/admin/projects/${slug}`, { accessToken });
}

export function createProject(
  payload: ProjectWritePayload & { slug: string },
  accessToken: string,
): Promise<Project> {
  return request<Project>('/api/projects', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function updateProject(
  slug: string,
  payload: ProjectWritePayload,
  accessToken: string,
): Promise<Project> {
  return request<Project>(`/api/projects/${slug}`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function deleteProject(
  slug: string,
  accessToken: string,
): Promise<void> {
  return request<void>(`/api/projects/${slug}`, {
    method: 'DELETE',
    accessToken,
  });
}

export function reorderProjects(
  slugs: string[],
  accessToken: string,
): Promise<{ status: string }> {
  return request<{ status: string }>('/api/projects/reorder', {
    method: 'PUT',
    accessToken,
    body: JSON.stringify({ slugs }),
  });
}

export function updateAboutPage(
  page: AboutPage,
  accessToken: string,
): Promise<AboutPage> {
  return request<AboutPage>('/api/pages/about', {
    method: 'PUT',
    accessToken,
    body: JSON.stringify(page),
  });
}

export function projectToWritePayload(project: Project): ProjectWritePayload {
  return {
    slug: project.slug,
    title: project.title,
    client: project.client,
    role: project.role,
    summary: project.summary,
    body: project.body,
    thumbnailUrl: project.thumbnailUrl,
    sortOrder: project.sortOrder,
    status: project.status,
    publishedAt: project.publishedAt,
  };
}

export type MediaUploadURLResponse = {
  uploadUrl: string;
  publicUrl: string;
  objectKey: string;
};

export function createMediaUploadUrl(
  body: { projectId: string; contentType: string; byteSize: number },
  accessToken: string,
): Promise<MediaUploadURLResponse> {
  return request<MediaUploadURLResponse>('/api/admin/media/upload-url', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(body),
  });
}

const ALLOWED_THUMB_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const MAX_THUMB_BYTES = 20 * 1024 * 1024;

/** Mint a signed URL, PUT the file to Storage, then PATCH the project thumbnail. */
export async function replaceProjectThumbnail(
  project: Project,
  file: File,
  accessToken: string,
): Promise<Project> {
  if (!ALLOWED_THUMB_TYPES.has(file.type)) {
    throw new Error('Use a JPEG, PNG, or WebP image');
  }
  if (file.size <= 0 || file.size > MAX_THUMB_BYTES) {
    throw new Error('Image must be between 1 byte and 20 MB');
  }

  const { uploadUrl, publicUrl } = await createMediaUploadUrl(
    {
      projectId: project.id,
      contentType: file.type,
      byteSize: file.size,
    },
    accessToken,
  );

  const put = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!put.ok) {
    throw new Error(`Upload failed with status ${put.status}`);
  }

  return updateProject(
    project.slug,
    { ...projectToWritePayload(project), thumbnailUrl: publicUrl },
    accessToken,
  );
}
