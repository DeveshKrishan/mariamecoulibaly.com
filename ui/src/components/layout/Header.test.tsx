import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../lib/auth';
import { EditModeProvider } from '../../lib/editMode';
import { Header } from './Header';

vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

function renderHeader(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <EditModeProvider>
          <Header />
        </EditModeProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function setScrollY(y: number) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    writable: true,
    value: y,
  });
  fireEvent.scroll(window);
}

describe('Header', () => {
  afterEach(() => {
    setScrollY(0);
  });

  it('renders the site title and desktop nav links', () => {
    renderHeader();

    expect(
      screen.getByRole('link', { name: 'Mariam Coulibaly' }),
    ).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'About Me' })).toHaveAttribute(
      'href',
      '/about-me',
    );
    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument();
  });

  it('opens and closes the mobile menu overlay', () => {
    const { container } = renderHeader();

    const toggle = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(toggle);

    expect(
      screen.getByRole('navigation', { name: 'Mobile' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Close menu' }),
    ).toBeInTheDocument();

    const header = container.querySelector('header');
    const overlay = container.querySelector('#mobile-nav');
    expect(header?.className).not.toMatch(/translate-y/);
    expect(overlay?.className).toContain('bg-white');
    expect(overlay?.className).toContain('fixed');
    expect(overlay?.className).toContain('inset-x-0');

    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(
      screen.queryByRole('navigation', { name: 'Mobile' }),
    ).not.toBeInTheDocument();
  });

  it('uses light text over the About dark hero at the top of the page', () => {
    const { container } = renderHeader('/about-me');
    const header = container.querySelector('header');
    expect(header?.className).toContain('text-white');
  });

  it('stays visible at the top of the page', () => {
    const { container } = renderHeader();
    setScrollY(0);

    const header = container.querySelector('header');
    expect(header?.className).not.toMatch(/-translate-y-full/);
  });

  it('only hides after scrolling down past the near-top band', () => {
    const { container } = renderHeader();
    const header = container.querySelector('header');

    setScrollY(8);
    expect(header?.className).not.toMatch(/-translate-y-full/);

    setScrollY(80);
    expect(header?.className).toMatch(/-translate-y-full/);

    setScrollY(40);
    expect(header?.className).not.toMatch(/-translate-y-full/);

    setScrollY(0);
    expect(header?.className).not.toMatch(/-translate-y-full/);
  });

  it('shows again on route change even if it was hidden from prior scroll', () => {
    const { container } = renderHeader('/');

    setScrollY(120);
    expect(container.querySelector('header')?.className).toMatch(
      /-translate-y-full/,
    );

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 0,
    });
    fireEvent.click(screen.getByRole('link', { name: 'About Me' }));

    expect(container.querySelector('header')?.className).not.toMatch(
      /-translate-y-full/,
    );
  });

  it('does not show Edit when the visitor is not an admin', () => {
    renderHeader();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });
});
