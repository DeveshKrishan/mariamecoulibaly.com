import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProjectGridSkeleton } from './ProjectGridSkeleton';

describe('ProjectGridSkeleton', () => {
  it('renders a loading status region with placeholder cards', () => {
    render(<ProjectGridSkeleton count={3} />);

    expect(screen.getByRole('status', { name: 'Loading projects' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByText('Loading projects')).toHaveClass('sr-only');
    expect(document.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3);
  });
});
