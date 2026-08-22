import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectPage } from '../pages/ProjectPage';
import type { Project } from '../types/content';

const getProject = vi.fn();
const getAdminProject = vi.fn();
const getProjects = vi.fn();
const listAdminProjects = vi.fn();

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>();
  return {
    ...actual,
    getProject: (...args: unknown[]) => getProject(...args),
    getAdminProject: (...args: unknown[]) => getAdminProject(...args),
    getProjects: (...args: unknown[]) => getProjects(...args),
    listAdminProjects: (...args: unknown[]) => listAdminProjects(...args),
  };
});

vi.mock('../lib/auth', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('../lib/editMode', () => ({
  useEditMode: () => ({
    editMode: mockEditMode,
    setEditMode: vi.fn(),
    canEdit: Boolean(mockAuth.accessToken),
    saveStatus: 'idle',
    saveError: null,
    lastSavedAt: null,
    runSave: vi.fn(async (work: () => Promise<unknown>) => work()),
  }),
}));

let mockAuth = {
  accessToken: null as string | null,
  isAdmin: false,
  session: null,
  loading: false,
  configured: true,
  admin: null,
  adminLoading: false,
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
};

let mockEditMode = false;

const draftProject: Project = {
  id: '1',
  slug: 'draft-project',
  title: 'Draft Project',
  client: '',
  role: '',
  summary: '',
  body: [],
  thumbnailUrl: '',
  publishedAt: '2026-01-01',
  sortOrder: 0,
  status: 'draft',
};

function renderProjectPage(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/projects/${slug}`]}>
      <Routes>
        <Route path="/projects/:slug" element={<ProjectPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('draft project after exiting edit mode', () => {
  beforeEach(() => {
    getProject.mockReset();
    getAdminProject.mockReset();
    getProjects.mockReset();
    listAdminProjects.mockReset();
    mockAuth = {
      ...mockAuth,
      accessToken: null,
      isAdmin: false,
    };
    mockEditMode = false;
    getProjects.mockResolvedValue([]);
    listAdminProjects.mockResolvedValue([draftProject]);
  });

  it('loads drafts via admin API when signed in, even without edit mode', async () => {
    mockAuth = { ...mockAuth, accessToken: 'tok', isAdmin: true };
    getAdminProject.mockResolvedValue(draftProject);

    renderProjectPage('draft-project');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Draft Project' })).toBeInTheDocument();
    });
    expect(getAdminProject).toHaveBeenCalledWith('draft-project', 'tok');
    expect(getProject).not.toHaveBeenCalled();
    expect(screen.getByText(/Draft preview/)).toBeInTheDocument();
  });

  it('shows not found for drafts when the visitor is not signed in', async () => {
    getProject.mockRejectedValue(new Error('Request to /api/projects/draft-project failed with status 404'));

    renderProjectPage('draft-project');

    await waitFor(() => {
      expect(screen.getByText('Project not found.')).toBeInTheDocument();
    });
    expect(getProject).toHaveBeenCalledWith('draft-project');
    expect(getAdminProject).not.toHaveBeenCalled();
  });
});
