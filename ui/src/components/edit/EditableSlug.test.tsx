import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditableSlug } from './EditableSlug';

describe('EditableSlug', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows /projects/ prefix and current slug', () => {
    render(<EditableSlug value="kqed" onSave={() => undefined} />);

    expect(screen.getByText('/projects/')).toBeInTheDocument();
    expect(screen.getByLabelText('Project URL name')).toHaveValue('kqed');
  });

  it('confirms, slugifies, and saves on blur when the value changes', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<EditableSlug value="kqed" onSave={onSave} />);

    const input = screen.getByLabelText('Project URL name');
    await user.clear(input);
    await user.type(input, 'KQED Animals');
    await user.tab();

    expect(window.confirm).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalledWith('kqed-animals');
  });

  it('resets and does not save when confirm is cancelled', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<EditableSlug value="kqed" onSave={onSave} />);

    const input = screen.getByLabelText('Project URL name');
    await user.clear(input);
    await user.type(input, 'other');
    await user.tab();

    expect(onSave).not.toHaveBeenCalled();
    expect(input).toHaveValue('kqed');
  });

  it('does not save when the slug is unchanged after normalize', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm');
    render(<EditableSlug value="kqed" onSave={onSave} />);

    const input = screen.getByLabelText('Project URL name');
    await user.clear(input);
    await user.type(input, 'KQED');
    await user.tab();

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });
});
