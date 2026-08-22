import type { Project } from '../../types/content';
import { useEffect, useId, useRef, useState } from 'react';
import {
  IMAGE_UPLOAD_HINT,
  assertImageFile,
  replaceProjectThumbnail,
} from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useEditMode } from '../../lib/editMode';

type EditableThumbnailProps = {
  project: Project;
  onReplaced?: (next: Project) => void;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** Square crop for homepage cards; natural for detail. */
  aspect?: 'square' | 'natural';
};

/**
 * Project thumbnail with edit-mode replace affordance (file picker →
 * signed upload → PATCH thumbnailUrl). See docs/PLAN.md §6.7.
 */
export function EditableThumbnail({
  project,
  onReplaced,
  alt,
  className = '',
  imgClassName = 'h-full w-full object-cover',
  aspect = 'natural',
}: EditableThumbnailProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { accessToken } = useAuth();
  const { editMode, runSave } = useEditMode();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const displaySrc = previewUrl ?? project.thumbnailUrl;

  if (!editMode && !displaySrc) {
    return null;
  }

  async function onFileChange(file: File | undefined) {
    if (!file || !accessToken || !onReplaced || busy) return;
    setLocalError(null);
    try {
      assertImageFile(file);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Invalid image');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    const local = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return local;
    });
    setBusy(true);
    try {
      const updated = await runSave(() =>
        replaceProjectThumbnail(project, file, accessToken),
      );
      onReplaced(updated);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Upload failed');
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const shellClass = [
    'relative overflow-hidden bg-neutral-100',
    aspect === 'square' ? 'aspect-square' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClass}>
      {displaySrc ? (
        <img
          src={displaySrc}
          alt={alt}
          loading="lazy"
          className={[imgClassName, busy ? 'opacity-60' : '']
            .filter(Boolean)
            .join(' ')}
        />
      ) : (
        <div
          className="flex h-full min-h-40 w-full items-center justify-center text-xs tracking-wide text-ink/40 uppercase"
          aria-hidden={editMode ? undefined : true}
        >
          {editMode ? 'No image' : null}
        </div>
      )}

      {editMode && onReplaced ? (
        <>
          <label
            htmlFor={inputId}
            className={[
              'absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1 px-2 text-center',
              'bg-ink/0 text-sm tracking-wide text-white opacity-0 transition',
              'hover:bg-ink/45 hover:opacity-100 focus-within:bg-ink/45 focus-within:opacity-100',
              busy ? 'pointer-events-none opacity-100 bg-ink/45' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!busy) inputRef.current?.click();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                if (!busy) inputRef.current?.click();
              }
            }}
          >
            <span>{busy ? 'Uploading…' : 'Replace image'}</span>
            {!busy ? (
              <span className="text-xs font-normal tracking-normal opacity-90">
                {IMAGE_UPLOAD_HINT}
              </span>
            ) : null}
          </label>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={busy}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              void onFileChange(e.target.files?.[0]);
            }}
          />
          {localError ? (
            <p
              className="absolute right-0 bottom-0 left-0 bg-red-50/95 px-2 py-1 text-center text-xs text-red-800"
              role="alert"
            >
              {localError}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
