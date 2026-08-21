import { useEffect, useState, type ChangeEvent } from 'react';
import { slugifyTitle } from '../../lib/slug';

type EditableSlugProps = {
  value: string;
  onSave: (next: string) => void | Promise<void>;
  className?: string;
  'aria-label'?: string;
};

/**
 * Edit-mode control for the project URL path segment under `/projects/`.
 * Normalizes on blur via slugifyTitle and confirms before calling onSave.
 */
export function EditableSlug({
  value,
  onSave,
  className,
  'aria-label': ariaLabel,
}: EditableSlugProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <label
      className={[
        'mb-4 flex flex-wrap items-center gap-1 text-sm text-ink/70',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="shrink-0">URL</span>
      <span className="shrink-0 text-ink/40">/projects/</span>
      <input
        type="text"
        value={draft}
        aria-label={ariaLabel ?? 'Project URL name'}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className="min-w-[8rem] flex-1 bg-transparent px-1 font-mono outline outline-1 outline-ink/25 focus:outline-ink/60"
        onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
        onBlur={() => {
          const next = slugifyTitle(draft);
          if (next === value) {
            setDraft(value);
            return;
          }
          if (
            !window.confirm(
              `Change URL from /projects/${value} to /projects/${next}?\n\nExisting links to the old URL will stop working.`,
            )
          ) {
            setDraft(value);
            return;
          }
          setDraft(next);
          void onSave(next);
        }}
      />
    </label>
  );
}
