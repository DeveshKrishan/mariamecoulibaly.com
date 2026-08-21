import { useEffect, useState, type ChangeEvent } from 'react';
import { formatDetailDate, toDateInputValue } from '../../lib/dates';

type EditableDateProps = {
  value: string;
  onSave: (next: string) => void | Promise<void>;
  editMode: boolean;
  className?: string;
  inputClassName?: string;
  'aria-label'?: string;
};

/**
 * Project date that renders as `<time>` publicly and a native date picker
 * (with year) in edit mode. Saves on change so a calendar pick persists
 * without needing a separate blur.
 */
export function EditableDate({
  value,
  onSave,
  editMode,
  className,
  inputClassName,
  'aria-label': ariaLabel,
}: EditableDateProps) {
  const inputValue = toDateInputValue(value);
  const [draft, setDraft] = useState(inputValue);

  useEffect(() => {
    setDraft(toDateInputValue(value));
  }, [value]);

  if (!editMode) {
    return (
      <time className={className} dateTime={value}>
        {formatDetailDate(value)}
      </time>
    );
  }

  return (
    <input
      type="date"
      value={draft}
      aria-label={ariaLabel}
      className={[
        'bg-transparent outline outline-1 outline-ink/25 focus:outline-ink/60',
        inputClassName ?? className,
      ]
        .filter(Boolean)
        .join(' ')}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        setDraft(next);
        if (next && next !== inputValue) {
          void onSave(next);
        }
      }}
    />
  );
}
