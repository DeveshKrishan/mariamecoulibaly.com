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
  saveStatus: 'idle' as 'idle' | 'saving' | 'saved' | 'error',
  saveError: null as string | null,
  lastSavedAt: null as Date | null,
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
      lastSavedAt: null,
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

  it('shows saved-at timestamp in local dd/mm/yyyy after a save', () => {
    const savedAt = new Date(2026, 7, 21, 18, 15, 32);
    mockEditMode = {
      ...mockEditMode,
      editMode: true,
      saveStatus: 'saved',
      lastSavedAt: savedAt,
    };
    render(<EditToolbar />);

    expect(screen.getByText('Last saved at 21/08/2026 18:15:32')).toBeInTheDocument();
  });

  it('keeps showing last saved time when status returns to idle', () => {
    const savedAt = new Date(2026, 7, 21, 9, 8, 7);
    mockEditMode = {
      ...mockEditMode,
      editMode: true,
      saveStatus: 'idle',
      lastSavedAt: savedAt,
    };
    render(<EditToolbar />);

    act(() => {
      vi.advanceTimersByTime(1800);
    });

    expect(screen.getByText('Last saved at 21/08/2026 09:08:07')).toBeInTheDocument();
  });
});
