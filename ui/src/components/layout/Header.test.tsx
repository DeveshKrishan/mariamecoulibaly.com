import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { Header } from './Header';

function renderHeader(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  );
}

describe('Header', () => {
  afterEach(() => {
    window.scrollY = 0;
    fireEvent.scroll(window);
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
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });

  it('opens and closes the mobile menu overlay', () => {
    renderHeader();

    const toggle = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(toggle);

    expect(
      screen.getByRole('navigation', { name: 'Mobile' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();

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
});
