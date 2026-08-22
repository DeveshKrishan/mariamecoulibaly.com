import type {
  EmbedBlock,
  ImageBlock,
  LinkBlock,
  ParagraphBlock,
  RichTextBlock,
} from '../../types/content';
import { useEffect, useId, useRef, useState } from 'react';
import {
  IMAGE_UPLOAD_HINT,
  assertImageFile,
  uploadProjectImage,
} from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useEditMode } from '../../lib/editMode';

type EditableProjectBodyProps = {
  projectId: string;
  body: RichTextBlock[];
  onSave: (next: RichTextBlock[]) => void | Promise<void>;
};

function isParagraph(block: RichTextBlock): block is ParagraphBlock {
  return block.type === 'paragraph';
}

function isImage(block: RichTextBlock): block is ImageBlock {
  return block.type === 'image';
}

function isLink(block: RichTextBlock): block is LinkBlock {
  return block.type === 'link';
}

function isEmbed(block: RichTextBlock): block is EmbedBlock {
  return block.type === 'embed';
}

function isLinkLike(
  block: RichTextBlock,
): block is LinkBlock | EmbedBlock {
  return isLink(block) || isEmbed(block);
}

/** Remount editors when the block *type* at an index changes (e.g. reorder).
 * Do not include editable field values — that remounts mid-edit and drops focus. */
function blockEditorKey(block: RichTextBlock, index: number): string {
  return `${block.type}-${index}`;
}

/**
 * Edit-mode body editor for paragraph, image, and link CTA blocks.
 * Legacy `embed` blocks are edited as link CTAs and saved as `type: "link"`.
 */
export function EditableProjectBody({
  projectId,
  body,
  onSave,
}: EditableProjectBodyProps) {
  function updateAt(index: number, next: RichTextBlock) {
    const copy = body.slice();
    copy[index] = next;
    void onSave(copy);
  }

  function removeAt(index: number) {
    void onSave(body.filter((_, i) => i !== index));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= body.length) return;
    const copy = body.slice();
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item!);
    void onSave(copy);
  }

  function addParagraph() {
    void onSave([...body, { type: 'paragraph', text: '' }]);
  }

  function addImage() {
    void onSave([...body, { type: 'image', url: '', alt: '' }]);
  }

  function addLink() {
    void onSave([...body, { type: 'link', url: '', label: 'Watch Here' }]);
  }

  return (
    <div className="mt-6 space-y-4">
      {body.length === 0 ? (
        <p className="text-xs tracking-wide text-ink/50 uppercase">
          No body blocks yet
        </p>
      ) : null}

      {body.map((block, index) => (
        <div
          key={blockEditorKey(block, index)}
          className="rounded border border-ink/15 p-3"
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs tracking-wide text-ink/50 uppercase">
              {isEmbed(block) ? 'link (legacy embed)' : block.type}
            </span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                className="border border-ink/20 px-2 py-0.5 text-xs tracking-wide hover:bg-ink/5 disabled:opacity-40"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                Up
              </button>
              <button
                type="button"
                className="border border-ink/20 px-2 py-0.5 text-xs tracking-wide hover:bg-ink/5 disabled:opacity-40"
                disabled={index === body.length - 1}
                onClick={() => move(index, 1)}
              >
                Down
              </button>
              {(isParagraph(block) || isImage(block) || isLinkLike(block)) && (
                <button
                  type="button"
                  className="border border-red-200 px-2 py-0.5 text-xs tracking-wide text-red-800 hover:bg-red-50"
                  onClick={() => removeAt(index)}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {isParagraph(block) ? (
            <ParagraphEditor
              block={block}
              onChange={(next) => updateAt(index, next)}
            />
          ) : isImage(block) ? (
            <EditableImageBlock
              projectId={projectId}
              block={block}
              onChange={(next) => updateAt(index, next)}
            />
          ) : isLinkLike(block) ? (
            <LinkEditor
              block={block}
              onChange={(next) => updateAt(index, next)}
            />
          ) : null}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addParagraph}
          className="border border-ink px-3 py-1.5 text-xs tracking-wide hover:bg-ink hover:text-white"
        >
          Add paragraph
        </button>
        <button
          type="button"
          onClick={addImage}
          className="border border-ink px-3 py-1.5 text-xs tracking-wide hover:bg-ink hover:text-white"
        >
          Add image
        </button>
        <button
          type="button"
          onClick={addLink}
          className="border border-ink px-3 py-1.5 text-xs tracking-wide hover:bg-ink hover:text-white"
        >
          Add link
        </button>
      </div>
    </div>
  );
}

function ParagraphEditor({
  block,
  onChange,
}: {
  block: ParagraphBlock;
  onChange: (next: ParagraphBlock) => void;
}) {
  const [draft, setDraft] = useState(block.text);

  useEffect(() => {
    setDraft(block.text);
  }, [block.text]);

  return (
    <textarea
      value={draft}
      aria-label="Paragraph text"
      rows={4}
      className="w-full bg-transparent px-1 py-1 text-sm leading-relaxed italic outline outline-1 outline-ink/25 focus:outline-ink/60"
      style={{ resize: 'vertical' }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== block.text) {
          onChange({ type: 'paragraph', text: draft });
        }
      }}
    />
  );
}

/**
 * Link CTA editor (Watch Here / Listen Here). Saving always writes a
 * `type: "link"` block so legacy embeds get migrated on first edit.
 */
function LinkEditor({
  block,
  onChange,
}: {
  block: LinkBlock | EmbedBlock;
  onChange: (next: LinkBlock) => void;
}) {
  const initialLabel = isLink(block) ? block.label : 'Watch Here';
  const [labelDraft, setLabelDraft] = useState(initialLabel);
  const [urlDraft, setUrlDraft] = useState(block.url);

  useEffect(() => {
    setLabelDraft(initialLabel);
    setUrlDraft(block.url);
  }, [initialLabel, block.url]);

  function commit(partial: { label?: string; url?: string }) {
    const label = (partial.label ?? labelDraft).trim() || 'Watch Here';
    const url = (partial.url ?? urlDraft).trim();
    if (label === initialLabel && url === block.url && isLink(block)) return;
    onChange({ type: 'link', label, url });
  }

  return (
    <div className="space-y-2">
      <p className="project-cta pointer-events-none w-fit mx-auto opacity-90">
        {labelDraft.trim() || 'Watch Here'}
      </p>
      <label className="block text-xs tracking-wide text-ink/60">
        Button text
        <input
          type="text"
          value={labelDraft}
          aria-label="Link button text"
          className="mt-1 w-full bg-transparent px-1 py-1 text-sm outline outline-1 outline-ink/25 focus:outline-ink/60"
          placeholder="Watch Here"
          onChange={(e) => setLabelDraft(e.target.value)}
          onBlur={() => commit({ label: labelDraft })}
        />
      </label>
      <label className="block text-xs tracking-wide text-ink/60">
        URL
        <input
          type="url"
          value={urlDraft}
          aria-label="Link URL"
          className="mt-1 w-full bg-transparent px-1 py-1 text-sm outline outline-1 outline-ink/25 focus:outline-ink/60"
          placeholder="https://…"
          onChange={(e) => setUrlDraft(e.target.value)}
          onBlur={() => commit({ url: urlDraft })}
        />
      </label>
    </div>
  );
}

/** Image block editor: preview + URL/alt/href + upload (max 20 MB). */
export function EditableImageBlock({
  projectId,
  block,
  onChange,
  onRemove,
}: {
  projectId: string;
  block: ImageBlock;
  onChange: (next: ImageBlock) => void;
  /** Optional — used for leading-column remove. */
  onRemove?: () => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { accessToken } = useAuth();
  const { runSave } = useEditMode();
  const [urlDraft, setUrlDraft] = useState(block.url);
  const [altDraft, setAltDraft] = useState(block.alt ?? '');
  const [hrefDraft, setHrefDraft] = useState(block.href ?? '');
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setUrlDraft(block.url);
    setAltDraft(block.alt ?? '');
    setHrefDraft(block.href ?? '');
  }, [block.url, block.alt, block.href]);

  function commitMeta(partial: Partial<ImageBlock>) {
    onChange({
      type: 'image',
      url: partial.url ?? urlDraft,
      alt: (partial.alt ?? altDraft).trim() || undefined,
      href: (partial.href ?? hrefDraft).trim() || undefined,
    });
  }

  async function onFileChange(file: File | undefined) {
    if (!file || !accessToken || busy) return;
    setLocalError(null);
    try {
      assertImageFile(file);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Invalid image');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setBusy(true);
    try {
      const publicUrl = await runSave(() =>
        uploadProjectImage(projectId, file, accessToken),
      );
      setUrlDraft(publicUrl);
      onChange({
        type: 'image',
        url: publicUrl,
        alt: altDraft.trim() || undefined,
        href: hrefDraft.trim() || undefined,
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      {urlDraft ? (
        <img
          src={urlDraft}
          alt={altDraft || ''}
          className={`w-full object-cover ${busy ? 'opacity-60' : ''}`}
        />
      ) : (
        <div className="flex min-h-32 items-center justify-center bg-neutral-100 text-xs tracking-wide text-ink/40 uppercase">
          No image URL yet
        </div>
      )}

      <label className="block text-xs tracking-wide text-ink/60">
        Image URL
        <input
          type="url"
          value={urlDraft}
          aria-label="Image URL"
          className="mt-1 w-full bg-transparent px-1 py-1 text-sm outline outline-1 outline-ink/25 focus:outline-ink/60"
          placeholder="https://…"
          onChange={(e) => setUrlDraft(e.target.value)}
          onBlur={() => {
            if (urlDraft !== block.url) commitMeta({ url: urlDraft });
          }}
        />
      </label>

      <label className="block text-xs tracking-wide text-ink/60">
        Alt text
        <input
          type="text"
          value={altDraft}
          aria-label="Image alt text"
          className="mt-1 w-full bg-transparent px-1 py-1 text-sm outline outline-1 outline-ink/25 focus:outline-ink/60"
          onChange={(e) => setAltDraft(e.target.value)}
          onBlur={() => {
            if (altDraft !== (block.alt ?? '')) commitMeta({ alt: altDraft });
          }}
        />
      </label>

      <label className="block text-xs tracking-wide text-ink/60">
        Link (optional)
        <input
          type="url"
          value={hrefDraft}
          aria-label="Image link URL"
          className="mt-1 w-full bg-transparent px-1 py-1 text-sm outline outline-1 outline-ink/25 focus:outline-ink/60"
          placeholder="https://…"
          onChange={(e) => setHrefDraft(e.target.value)}
          onBlur={() => {
            if (hrefDraft !== (block.href ?? '')) commitMeta({ href: hrefDraft });
          }}
        />
      </label>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          disabled={busy}
          className="border border-ink px-3 py-1.5 text-xs tracking-wide hover:bg-ink hover:text-white disabled:opacity-50"
          onClick={() => inputRef.current?.click()}
        >
          {busy ? 'Uploading…' : 'Upload image'}
        </button>
        {onRemove ? (
          <button
            type="button"
            className="border border-red-200 px-3 py-1.5 text-xs tracking-wide text-red-800 hover:bg-red-50"
            onClick={onRemove}
          >
            Remove
          </button>
        ) : null}
        <span className="text-xs text-ink/50">{IMAGE_UPLOAD_HINT}</span>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={(e) => void onFileChange(e.target.files?.[0])}
        />
      </div>

      {localError ? (
        <p className="text-xs text-red-800" role="alert">
          {localError}
        </p>
      ) : null}
    </div>
  );
}
