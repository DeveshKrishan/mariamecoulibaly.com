import type { Project, RichTextBlock } from '@mariame/shared';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { EditableDate } from '../edit/EditableDate';
import { EditableField } from '../edit/EditableField';
import { EditableSlug } from '../edit/EditableSlug';
import { EditableThumbnail } from '../edit/EditableThumbnail';
import {
  deleteProject,
  projectToWritePayload,
  updateProject,
} from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useEditMode } from '../../lib/editMode';
import { absoluteUrl } from '../../lib/site';
import { hasContent, truncate } from '../../lib/text';
import { Seo } from '../seo/Seo';
import { ProjectBlock, ProjectBody } from './ProjectBody';
import { ProjectPagination } from './ProjectPagination';

function isLeadingMedia(
  block: RichTextBlock | undefined,
): block is Extract<RichTextBlock, { type: 'image' | 'embed' }> {
  return block?.type === 'image' || block?.type === 'embed';
}

function splitLeadingMedia(body: RichTextBlock[]): {
  media: RichTextBlock | null;
  rest: RichTextBlock[];
} {
  if (isLeadingMedia(body[0])) {
    return { media: body[0], rest: body.slice(1) };
  }
  return { media: null, rest: body };
}

/**
 * Full project detail section: title, date, client/role/summary meta,
 * rich-text body (paragraphs, images, embeds, links), and prev/next nav.
 *
 * Desktop layout matches the live Squarespace 12-col blog: full-width title
 * and date, then 4 cols leading media | 1 col gap | 7 cols copy + CTA.
 */
export function ProjectDetail({
  project,
  onProjectChange,
  previous,
  next,
}: {
  project: Project;
  onProjectChange?: (next: Project) => void;
  previous: Project | null;
  next: Project | null;
}) {
  const { accessToken } = useAuth();
  const { editMode, runSave } = useEditMode();
  const navigate = useNavigate();
  const { media, rest } = splitLeadingMedia(project.body);
  const description = hasContent(project.summary)
    ? truncate(project.summary, 160)
    : `${project.title}, a project by Mariam Coulibaly.`;

  async function saveField<K extends keyof Project>(
    key: K,
    value: Project[K],
  ) {
    if (!accessToken || !onProjectChange) return;
    const previous = project;
    const optimistic = { ...project, [key]: value };
    onProjectChange(optimistic);
    try {
      const updated = await runSave(() =>
        updateProject(
          project.slug,
          projectToWritePayload(optimistic),
          accessToken,
        ),
      );
      onProjectChange(updated);
    } catch {
      onProjectChange(previous);
    }
  }

  async function saveSlug(next: string) {
    if (!accessToken || !onProjectChange || next === project.slug) return;
    const previous = project;
    const optimistic = { ...project, slug: next };
    onProjectChange(optimistic);
    try {
      const updated = await runSave(() =>
        updateProject(
          project.slug,
          projectToWritePayload(optimistic),
          accessToken,
        ),
      );
      onProjectChange(updated);
      navigate(`/projects/${updated.slug}?edit=1`, { replace: true });
    } catch {
      onProjectChange(previous);
    }
  }

  async function handleDelete() {
    if (!accessToken) return;
    if (!window.confirm(`Soft-delete project “${project.slug}”?`)) return;
    try {
      await runSave(() => deleteProject(project.slug, accessToken));
      navigate('/?edit=1');
    } catch {
      // status already set
    }
  }

  async function handleTogglePublish() {
    if (!accessToken || !onProjectChange) return;
    const nextStatus =
      project.status === 'published' ? 'draft' : 'published';
    const nextPublishedAt =
      nextStatus === 'published' && !project.publishedAt.trim()
        ? new Date().toISOString().slice(0, 10)
        : project.publishedAt;
    const previous = project;
    const optimistic = {
      ...project,
      status: nextStatus,
      publishedAt: nextPublishedAt,
    };
    onProjectChange(optimistic);
    try {
      const updated = await runSave(() =>
        updateProject(
          project.slug,
          projectToWritePayload(optimistic),
          accessToken,
        ),
      );
      onProjectChange(updated);
    } catch {
      onProjectChange(previous);
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <Seo
        title={project.title}
        description={description}
        image={project.thumbnailUrl}
        url={absoluteUrl(`/projects/${project.slug}`)}
        type="article"
      />
      <header className="mb-8">
        {editMode ? (
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <EditableField
              value={project.title}
              editMode
              onSave={(v) => void saveField('title', v)}
              className="text-3xl md:text-4xl"
              inputClassName="font-heading text-3xl md:text-4xl px-1"
              aria-label="Project title"
            />
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleTogglePublish()}
                className="border border-ink px-3 py-1.5 text-xs tracking-wide hover:bg-ink hover:text-white"
              >
                {project.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="border border-red-300 px-3 py-1.5 text-xs tracking-wide text-red-800 hover:bg-red-50"
              >
                Delete project
              </button>
            </div>
          </div>
        ) : (
          <h1 className="mb-3 text-3xl md:text-4xl">{project.title}</h1>
        )}
        {editMode ? (
          <EditableSlug
            value={project.slug}
            onSave={(v) => void saveSlug(v)}
          />
        ) : null}
        <EditableDate
          value={project.publishedAt}
          editMode={editMode}
          onSave={(v) => void saveField('publishedAt', v)}
          className="mb-6 block text-sm opacity-70"
          inputClassName="mb-6 block text-sm opacity-70 px-1"
          aria-label="Project date"
        />
        {editMode ? (
          <p className="mb-4 text-xs tracking-wide text-ink/60 uppercase">
            {project.status === 'draft'
              ? 'Draft — not visible on the public site'
              : 'Published — visible on the public site'}
          </p>
        ) : null}
      </header>

      <div className="grid grid-cols-1 items-start gap-y-8 md:grid-cols-12">
        <div className="md:col-span-4">
          {media ? (
            <ProjectBlock block={media} />
          ) : (
            <EditableThumbnail
              project={project}
              alt={project.title}
              aspect="natural"
              imgClassName="w-full object-cover"
              onReplaced={onProjectChange}
            />
          )}
        </div>
        <div className="hidden md:col-span-1 md:block" aria-hidden="true" />
        <div className="md:col-span-7">
          <div className="text-sm">
            {editMode ? (
              <>
                <EditableField
                  value={project.client}
                  editMode
                  onSave={(v) => void saveField('client', v)}
                  className="mb-1 font-bold"
                  inputClassName="mb-1 font-bold px-1"
                  placeholder="Client"
                  aria-label="Client"
                />
                <EditableField
                  value={project.role}
                  editMode
                  onSave={(v) => void saveField('role', v)}
                  className="mb-1"
                  inputClassName="mb-1 px-1"
                  placeholder="Role"
                  aria-label="Role"
                />
                <EditableField
                  value={project.summary}
                  editMode
                  multiline
                  onSave={(v) => void saveField('summary', v)}
                  className="mb-1"
                  inputClassName="mb-1 px-1"
                  placeholder="Summary"
                  aria-label="Summary"
                />
              </>
            ) : (
              <>
                {hasContent(project.client) ? (
                  <p className="mb-1 font-bold">{project.client}</p>
                ) : null}
                {hasContent(project.role) ? (
                  <p className="mb-1">{project.role}</p>
                ) : null}
                {hasContent(project.summary) ? (
                  <p className="mb-1">{project.summary}</p>
                ) : null}
              </>
            )}
          </div>
          <ProjectBody body={rest} />
        </div>
      </div>

      <ProjectPagination previous={previous} next={next} />
    </motion.article>
  );
}
