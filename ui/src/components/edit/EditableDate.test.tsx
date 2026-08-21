import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EditableDate } from './EditableDate';

describe('EditableDate', () => {
  it('renders the formatted date with year when not editing', () => {
    render(
      <EditableDate
        value="2026-07-22"
        editMode={false}
        onSave={vi.fn()}
        className="date"
      />,
    );

    const time = screen.getByText('Jul 22, 2026');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('dateTime', '2026-07-22');
  });

  it('shows a date picker in edit mode and saves on change', () => {
    const onSave = vi.fn();
    render(
      <EditableDate
        value="2026-07-22"
        editMode
        onSave={onSave}
        aria-label="Project date"
      />,
    );

    const input = screen.getByLabelText('Project date');
    expect(input).toHaveAttribute('type', 'date');
    expect(input).toHaveValue('2026-07-22');

    fireEvent.change(input, { target: { value: '2024-03-15' } });
    expect(onSave).toHaveBeenCalledWith('2024-03-15');
  });
});
