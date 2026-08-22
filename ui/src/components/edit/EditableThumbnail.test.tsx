import type { Project } from '@mariame/shared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../lib/auth';
import { EditModeProvider } from '../../lib/editMode';
import { EditableThumbnail } from './EditableThumbnail';

vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

const replaceProjectThumbnail = vi.fn();

vi.mock('../../lib/api', async () => {
  const actual =
    await vi.importActual<typeof import('../../lib/api')>('../../lib/api');
  return {
    ...actual,
    replaceProjectThumbnail: (...args: unknown[]) =>
      replaceProjectThumbnail(...args),
  };
});

vi.mock('../../lib/auth', async () => {
  const actual =
    await vi.importActual<typeof import('../../lib/auth')>('../../lib/auth');
  return {
    ...actual,
    useAuth: () => ({
      accessToken: 'tok',
      isAdmin: true,
      user: { email: 'a@b.com', displayName: 'A' },
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      isLoading: false,
    }),
  };
});

const project: Project = {
  id: 'proj-1',
  slug: 'demo',
  title: 'Demo',
  publishedAt: '2026-01-01',
  client: '',
  role: '',
  summary: '',
  body: [],
  thumbnailUrl: '/images/projects/demo.jpg',
  sortOrder: 0,
  status: 'published',
};

function renderThumb(edit = true) {
  return render(
    <MemoryRouter initialEntries={[edit ? '/?edit=1' : '/']}>
      <AuthProvider>
        <EditModeProvider>
          <EditableThumbnail
            project={project}
            alt="Demo"
            aspect="square"
            onReplaced={edit ? vi.fn() : undefined}
          />
        </EditModeProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('EditableThumbnail', () => {
  beforeEach(() => {
    replaceProjectThumbnail.mockReset();
  });

  it('shows the image without replace controls outside edit mode', () => {
    renderThumb(false);
    expect(screen.getByRole('img', { name: 'Demo' })).toHaveAttribute(
      'src',
      project.thumbnailUrl,
    );
    expect(screen.queryByText('Replace image')).not.toBeInTheDocument();
  });

  it('shows replace affordance in edit mode', async () => {
    const user = userEvent.setup();
    renderThumb(true);
    expect(screen.getByText('Replace image')).toBeInTheDocument();
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.accept).toContain('image/jpeg');

    replaceProjectThumbnail.mockResolvedValue({
      ...project,
      thumbnailUrl: 'https://cdn.example/new.jpg',
    });

    const file = new File(['x'], 'new.jpg', { type: 'image/jpeg' });
    await user.upload(input, file);
    expect(replaceProjectThumbnail).toHaveBeenCalled();
  });
});
