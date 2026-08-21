import type { Project, RichTextBlock } from '@mariame/shared';
import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../lib/auth';
import { EditModeProvider } from '../../lib/editMode';
import { ProjectBody } from './ProjectBody';
import { ProjectDetail } from './ProjectDetail';

vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

const siteUrl = (
  import.meta.env.VITE_SITE_URL ??
  'https://mariamecoulibaly-com-ui.vercel.app'
).replace(/\/+$/, '');

function renderDetail(ui: ReactElement) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <EditModeProvider>{ui}</EditModeProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

const baseProject: Project = {
  id: '1',
  slug: 'residenthome',
  title: 'Resident Home',
  publishedAt: '2026-07-22',
  client: 'Resident Home/Nectar',
  role: 'Assistant Editor — Freelance',
  summary: 'Organized footage and re-cut Amazon advertisements',
  body: [
    {
      type: 'paragraph',
      text: 'Resident Home is a house of direct-to-consumer sleep brands.',
    },
  ],
  thumbnailUrl: '/images/projects/residenthome.jpg',
  sortOrder: 0,
  status: 'published',
};

const nextProject: Project = {
  ...baseProject,
  id: '2',
  slug: 'udacity',
  title: 'Udacity Accenture',
  sortOrder: 1,
};

describe('ProjectBody', () => {
  it('renders paragraph, image, embed, and link blocks', () => {
    const body: RichTextBlock[] = [
      { type: 'paragraph', text: 'Hello body' },
      { type: 'image', url: '/img.jpg', alt: 'Still' },
      { type: 'embed', url: 'https://youtu.be/eq6bDsFdjnA', provider: 'youtube' },
      { type: 'link', url: 'https://example.com/watch', label: 'Watch' },
    ];

    render(<ProjectBody body={body} />);

    expect(screen.getByText('Hello body')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Still' })).toHaveAttribute(
      'src',
      '/img.jpg',
    );
    expect(screen.getByTitle('Embedded media')).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/eq6bDsFdjnA',
    );
    const watchLink = screen.getByRole('link', { name: 'Watch' });
    expect(watchLink).toHaveAttribute('href', 'https://example.com/watch');
    expect(watchLink).toHaveClass('project-cta');
  });

  it('renders nothing for an empty body', () => {
    const { container } = render(<ProjectBody body={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('ProjectDetail', () => {
  it('renders title, date, meta lines, body, and next project link', () => {
    renderDetail(
      <ProjectDetail
        project={baseProject}
        previous={null}
        next={nextProject}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Resident Home' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Jul 22')).toBeInTheDocument();
    expect(screen.getByText('Resident Home/Nectar')).toBeInTheDocument();
    expect(
      screen.getByText('Assistant Editor — Freelance'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Organized footage and re-cut Amazon advertisements'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Resident Home is a house of direct-to-consumer sleep brands.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Udacity Accenture/i }),
    ).toHaveAttribute('href', '/projects/udacity');
  });

  it('places a leading image in the media column and remaining body beside it', () => {
    const { container } = renderDetail(
      <ProjectDetail
        project={{
          ...baseProject,
          body: [
            { type: 'image', url: '/lead.jpg', alt: 'Lead still' },
            {
              type: 'paragraph',
              text: 'Resident Home is a house of direct-to-consumer sleep brands.',
            },
            {
              type: 'link',
              url: 'https://example.com/watch',
              label: 'Watch Here',
            },
          ],
        }}
        previous={null}
        next={null}
      />,
    );

    const mediaCol = container.querySelector('.md\\:col-span-4');
    const contentCol = container.querySelector('.md\\:col-span-7');
    const leadImage = screen.getByRole('img', { name: 'Lead still' });

    expect(mediaCol).toContainElement(leadImage);
    expect(contentCol).toHaveTextContent('Resident Home/Nectar');
    expect(contentCol).toHaveTextContent(
      'Resident Home is a house of direct-to-consumer sleep brands.',
    );
    expect(
      screen.getByRole('link', { name: 'Watch Here' }),
    ).toBeInTheDocument();
    expect(contentCol).toContainElement(
      screen.getByRole('link', { name: 'Watch Here' }),
    );
  });

  it('falls back to the thumbnail when there is no leading media block', () => {
    const { container } = renderDetail(
      <ProjectDetail
        project={{
          ...baseProject,
          thumbnailUrl: '/images/projects/residenthome.jpg',
          body: [{ type: 'paragraph', text: 'Only copy in the body.' }],
        }}
        previous={null}
        next={null}
      />,
    );

    const mediaCol = container.querySelector('.md\\:col-span-4');
    const contentCol = container.querySelector('.md\\:col-span-7');
    const thumbnail = screen.getByRole('img', { name: 'Resident Home' });

    expect(thumbnail).toHaveAttribute(
      'src',
      '/images/projects/residenthome.jpg',
    );
    expect(mediaCol).toContainElement(thumbnail);
    expect(contentCol).toHaveTextContent('Only copy in the body.');
    expect(contentCol).not.toContainElement(thumbnail);
  });

  it('hides placeholder Coming soon meta lines', () => {
    renderDetail(
      <ProjectDetail
        project={{
          ...baseProject,
          client: '',
          role: 'Coming soon.',
          summary: 'Coming soon.',
          body: [],
        }}
        previous={null}
        next={null}
      />,
    );

    expect(screen.queryByText('Coming soon.')).not.toBeInTheDocument();
  });

  it('sets SEO title, description, and canonical URL from the project', () => {
    renderDetail(
      <ProjectDetail project={baseProject} previous={null} next={null} />,
    );

    expect(document.title).toBe('Resident Home — Mariam Coulibaly');
    expect(
      document.head.querySelector('meta[name="description"]'),
    ).toHaveAttribute(
      'content',
      'Organized footage and re-cut Amazon advertisements',
    );
    expect(
      document.head.querySelector('link[rel="canonical"]'),
    ).toHaveAttribute('href', `${siteUrl}/projects/residenthome`);
  });

  it('falls back to a generic SEO description when the summary is "Coming soon."', () => {
    renderDetail(
      <ProjectDetail
        project={{ ...baseProject, summary: 'Coming soon.' }}
        previous={null}
        next={null}
      />,
    );

    expect(
      document.head.querySelector('meta[name="description"]'),
    ).toHaveAttribute(
      'content',
      'Resident Home, a project by Mariam Coulibaly.',
    );
  });
});
