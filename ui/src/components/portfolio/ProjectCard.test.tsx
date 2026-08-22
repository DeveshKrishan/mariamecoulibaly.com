import type { Project } from '../../types/content';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../lib/auth';
import { EditModeProvider } from '../../lib/editMode';
import { ProjectCard } from './ProjectCard';

vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

const project: Project = {
  id: '1',
  slug: 'my-project',
  title: 'My Project',
  publishedAt: '2026-01-01',
  client: 'Example Client',
  role: 'Designer',
  summary: 'A summary',
  body: [],
  thumbnailUrl: 'https://example.com/thumb.jpg',
  sortOrder: 0,
  status: 'published',
};

function renderCard(p: Project) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <EditModeProvider>
          <ProjectCard project={p} />
        </EditModeProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('ProjectCard', () => {
  it('renders the project title and links to its detail page', () => {
    renderCard(project);

    expect(screen.getByText('My Project')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/projects/my-project',
    );
  });

  it('renders the thumbnail image when one is present', () => {
    renderCard(project);

    const img = screen.getByRole('img', { name: 'My Project' });
    expect(img).toHaveAttribute('src', project.thumbnailUrl);
  });

  it('renders no image when thumbnailUrl is empty', () => {
    renderCard({ ...project, thumbnailUrl: '' });

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
