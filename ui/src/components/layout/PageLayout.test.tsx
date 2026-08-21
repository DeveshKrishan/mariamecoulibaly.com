import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../lib/auth';
import { EditModeProvider } from '../../lib/editMode';
import { PageLayout } from './PageLayout';

vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

function NavigateButton({ to }: { to: string }) {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)}>
      go
    </button>
  );
}

describe('PageLayout', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scrolls to top when the pathname changes', async () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      writable: true,
      value: scrollTo,
    });

    render(
      <MemoryRouter initialEntries={['/about-me']}>
        <AuthProvider>
          <EditModeProvider>
            <PageLayout>
              <Routes>
                <Route
                  path="/about-me"
                  element={<NavigateButton to="/" />}
                />
                <Route path="/" element={<p>home</p>} />
              </Routes>
            </PageLayout>
          </EditModeProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    // Initial mount also scrolls; clear before asserting the route change.
    scrollTo.mockClear();
    screen.getByRole('button', { name: 'go' }).click();

    await waitFor(() => {
      expect(scrollTo).toHaveBeenCalledWith(0, 0);
    });
  });
});
