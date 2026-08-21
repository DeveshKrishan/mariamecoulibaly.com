import {
  useEffect,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from 'react';

type EditableFieldProps = {
  value: string;
  onSave: (next: string) => void | Promise<void>;
  editMode: boolean;
  multiline?: boolean;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  'aria-label'?: string;
  /** Render HTML when not editing (for trusted bio fragments). */
  asHtml?: boolean;
};

/**
 * Plain-text field that becomes an input/textarea in edit mode and saves on blur.
 */
export function EditableField({
  value,
  onSave,
  editMode,
  multiline = false,
  className,
  inputClassName,
  placeholder,
  'aria-label': ariaLabel,
  asHtml = false,
}: EditableFieldProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (!editMode) {
    if (asHtml) {
      return (
        <span
          className={className}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      );
    }
    return <span className={className}>{value}</span>;
  }

  const shared = {
    value: draft,
    'aria-label': ariaLabel,
    placeholder,
    className: [
      'w-full bg-transparent outline outline-1 outline-ink/25 focus:outline-ink/60',
      inputClassName ?? className,
    ]
      .filter(Boolean)
      .join(' '),
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft(e.target.value),
    onBlur: () => {
      if (draft !== value) {
        void onSave(draft);
      }
    },
  };

  if (multiline) {
    return (
      <textarea
        {...shared}
        rows={6}
        style={{ resize: 'vertical' } as CSSProperties}
      />
    );
  }

  return <input type="text" {...shared} />;
}
