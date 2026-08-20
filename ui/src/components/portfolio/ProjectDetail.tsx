import type { Project, RichTextBlock } from '@mariame/shared';
import { formatDetailDate } from '../../lib/dates';
import { ProjectBlock, ProjectBody } from './ProjectBody';
import { ProjectPagination } from './ProjectPagination';

function MetaLine({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  if (!children || children === 'Coming soon.') return null;
  return <p className={className ? `mb-1 ${className}` : 'mb-1'}>{children}</p>;
}

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
  previous,
  next,
}: {
  project: Project;
  previous: Project | null;
  next: Project | null;
}) {
  const { media, rest } = splitLeadingMedia(project.body);

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl mb-3">{project.title}</h1>
        <time
          className="block text-sm opacity-70 mb-6"
          dateTime={project.publishedAt}
        >
          {formatDetailDate(project.publishedAt)}
        </time>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 items-start gap-y-8">
        <div className="md:col-span-4">
          {media ? (
            <ProjectBlock block={media} />
          ) : project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="w-full object-cover"
            />
          ) : null}
        </div>
        <div className="hidden md:block md:col-span-1" aria-hidden="true" />
        <div className="md:col-span-7">
          <div className="text-sm">
            <MetaLine className="font-bold">{project.client}</MetaLine>
            <MetaLine>{project.role}</MetaLine>
            <MetaLine>{project.summary}</MetaLine>
          </div>
          <ProjectBody body={rest} />
        </div>
      </div>

      <ProjectPagination previous={previous} next={next} />
    </article>
  );
}
