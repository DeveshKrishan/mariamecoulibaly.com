import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditToolbar } from './EditToolbar';

const setEditMode = vi.fn();

vi.mock('../../lib/editMode', () => ({
  useEditMode: () => mockEditMode,
}));

let mockEditMode = {
  editMode: false,
  setEditMode,
  canEdit: true,
  saveStatus: 'idle' as const,
  saveError: null as string | null,
  runSave: vi.fn(),
};

describe('EditToolbar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setEditMode.mockReset();
    mockEditMode = {
      editMode: false,
      setEditMode,
      canEdit: true,
      saveStatus: 'idle',
      saveError: null,
      runSave: vi.fn(),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a green signed-in flash when edit mode turns on', () => {
    const { rerender } = render(<EditToolbar />);
    expect(screen.queryByText(/Signed in/)).not.toBeInTheDocument();

    mockEditMode = { ...mockEditMode, editMode: true };
    rerender(<EditToolbar />);

    expect(screen.getByText('Signed in — edit mode on')).toBeInTheDocument();
    const shell = screen.getByText('Signed in — edit mode on').closest('div');
    expect(shell?.className).toMatch(/bg-emerald-50/);

    act(() => {
      vi.advanceTimersByTime(1800);
    });

    expect(screen.getByText('Editing — changes save automatically')).toBeInTheDocument();
  });
});
