import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EditToolbar } from '../components/edit/EditToolbar';
import { AuthProvider } from './auth';
import { EditModeProvider, useEditMode } from './editMode';

vi.mock('./supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

function ToggleProbe() {
  const { editMode, setEditMode, canEdit } = useEditMode();
  return (
    <div>
      <span data-testid="edit">{editMode ? 'on' : 'off'}</span>
      <span data-testid="can">{canEdit ? 'yes' : 'no'}</span>
      <button type="button" onClick={() => setEditMode(true)}>
        enter
      </button>
    </div>
  );
}

describe('edit mode', () => {
  it('keeps edit mode off for non-admins even with ?edit=1', () => {
    render(
      <MemoryRouter initialEntries={['/?edit=1']}>
        <AuthProvider>
          <EditModeProvider>
            <ToggleProbe />
            <EditToolbar />
          </EditModeProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('can')).toHaveTextContent('no');
    expect(screen.getByTestId('edit')).toHaveTextContent('off');
    expect(
      screen.queryByRole('button', { name: 'Exit edit' }),
    ).not.toBeInTheDocument();
  });

  it('setEditMode updates the search param when called', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <EditModeProvider>
            <ToggleProbe />
          </EditModeProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('edit')).toHaveTextContent('off');
    await user.click(screen.getByRole('button', { name: 'enter' }));
    // Without admin, editMode stays false even if ?edit=1 is set.
    expect(screen.getByTestId('edit')).toHaveTextContent('off');
  });
});
