import { useEditMode } from '../../lib/editMode';

/**
 * Floating edit-mode chrome: status + exit. Body/media editing is deferred.
 */
export function EditToolbar() {
  const { editMode, setEditMode, saveStatus, saveError } = useEditMode();

  if (!editMode) return null;

  const statusLabel =
    saveStatus === 'saving'
      ? 'Saving…'
      : saveStatus === 'saved'
        ? 'Saved'
        : saveStatus === 'error'
          ? saveError ?? 'Save failed'
          : 'Editing — changes save automatically';

  const shellClass =
    saveStatus === 'saved'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : saveStatus === 'error'
        ? 'border-red-200 bg-red-50 text-red-900'
        : 'border-ink/15 bg-white text-ink';

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center p-4">
      <div
        className={`pointer-events-auto flex max-w-xl flex-wrap items-center gap-3 border px-4 py-3 text-sm shadow-[0_-4px_24px_rgba(21,9,9,0.08)] ${shellClass}`}
      >
        <p className={saveStatus === 'idle' ? 'text-ink/70' : undefined}>
          {statusLabel}
        </p>
        {saveStatus === 'idle' || saveStatus === 'saving' ? (
          <p className="hidden text-xs text-ink/50 sm:block">
            Body/media editing coming next
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setEditMode(false)}
          className={`ml-auto border px-3 py-1.5 text-xs font-medium tracking-wide ${
            saveStatus === 'saved'
              ? 'border-emerald-800/40 hover:bg-emerald-100'
              : saveStatus === 'error'
                ? 'border-red-800/40 hover:bg-red-100'
                : 'border-ink hover:bg-ink hover:text-white'
          }`}
        >
          Exit edit
        </button>
      </div>
    </div>
  );
}
