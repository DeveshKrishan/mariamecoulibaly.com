import type { AboutPage as AboutPageData } from '../types/content';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../lib/auth';
import { EditModeProvider } from '../lib/editMode';
import { AboutPage } from './AboutPage';

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

const getAboutPage = vi.fn();
const updateAboutPage = vi.fn();

vi.mock('../lib/api', async () => {
  const actual =
    await vi.importActual<typeof import('../lib/api')>('../lib/api');
  return {
    ...actual,
    getAboutPage: (...args: unknown[]) => getAboutPage(...args),
    updateAboutPage: (...args: unknown[]) => updateAboutPage(...args),
  };
});

vi.mock('../lib/auth', async () => {
  const actual =
    await vi.importActual<typeof import('../lib/auth')>('../lib/auth');
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

const aboutFixture: AboutPageData = {
  title: 'About Me',
  headline: 'Editor & producer',
  greeting: 'Hi!',
  bio: 'Bio copy',
  photoUrl: '',
  links: [
    { label: 'Resume', url: 'https://example.com/resume' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/x' },
  ],
};

function renderAbout() {
  return render(
    <MemoryRouter initialEntries={['/about-me?edit=1']}>
      <AuthProvider>
        <EditModeProvider>
          <AboutPage />
        </EditModeProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('AboutPage link editing', () => {
  beforeEach(() => {
    getAboutPage.mockReset();
    updateAboutPage.mockReset();
    getAboutPage.mockResolvedValue(aboutFixture);
    updateAboutPage.mockImplementation(async (page: AboutPageData) => page);
  });

  it('edits link label on blur', async () => {
    renderAbout();

    const label = await screen.findByLabelText('Link 1 label');
    fireEvent.change(label, { target: { value: 'CV' } });
    fireEvent.blur(label);

    await waitFor(() => {
      expect(updateAboutPage).toHaveBeenCalledWith(
        expect.objectContaining({
          links: [
            { label: 'CV', url: 'https://example.com/resume' },
            aboutFixture.links[1],
          ],
        }),
        'tok',
      );
    });
  });

  it('edits link url on blur', async () => {
    renderAbout();

    const url = await screen.findByLabelText('Link 1 URL');
    fireEvent.change(url, { target: { value: 'https://example.com/cv' } });
    fireEvent.blur(url);

    await waitFor(() => {
      expect(updateAboutPage).toHaveBeenCalledWith(
        expect.objectContaining({
          links: [
            { label: 'Resume', url: 'https://example.com/cv' },
            aboutFixture.links[1],
          ],
        }),
        'tok',
      );
    });
  });

  it('adds a new link', async () => {
    const user = userEvent.setup();
    renderAbout();

    await screen.findByLabelText('Link 1 label');
    await user.click(screen.getByRole('button', { name: 'Add link' }));

    await waitFor(() => {
      expect(updateAboutPage).toHaveBeenCalledWith(
        expect.objectContaining({
          links: [
            ...aboutFixture.links,
            { label: 'New link', url: 'https://' },
          ],
        }),
        'tok',
      );
    });
  });

  it('removes a link', async () => {
    const user = userEvent.setup();
    renderAbout();

    await screen.findByLabelText('Link 1 label');
    const removeButtons = screen.getAllByRole('button', { name: 'Remove' });
    await user.click(removeButtons[0]!);

    await waitFor(() => {
      expect(updateAboutPage).toHaveBeenCalledWith(
        expect.objectContaining({
          links: [aboutFixture.links[1]],
        }),
        'tok',
      );
    });
  });
});
