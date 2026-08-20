export type ContentStatus = 'draft' | 'published';

/** Paragraph of project body copy. */
export interface ParagraphBlock {
  type: 'paragraph';
  text: string;
}

/** Inline or full-width image; optional href makes it a linked image. */
export interface ImageBlock {
  type: 'image';
  url: string;
  alt?: string;
  href?: string;
}

/**
 * Embedded media. `url` may be a YouTube/Vimeo watch URL or a direct video file.
 * The UI derives an embeddable player when possible.
 */
export interface EmbedBlock {
  type: 'embed';
  url: string;
  provider?: 'youtube' | 'vimeo' | 'video';
}

/** Call-to-action / external link rendered below body copy. */
export interface LinkBlock {
  type: 'link';
  url: string;
  label: string;
}

/**
 * Loosely-typed body blocks for a project detail page.
 * New block types can be added as the editor (docs/PLAN.md §6.5) lands.
 */
export type RichTextBlock =
  | ParagraphBlock
  | ImageBlock
  | EmbedBlock
  | LinkBlock;

export interface Project {
  id: string;
  slug: string;
  title: string;
  publishedAt: string; // ISO date
  /** Client / organization line shown under the date (e.g. "KQED"). */
  client: string;
  role: string;
  /** Short highlight / credit line (e.g. award or scope blurb). */
  summary: string;
  body: RichTextBlock[];
  thumbnailUrl: string;
  sortOrder: number;
  status: ContentStatus;
}

export interface AboutPageLink {
  label: string;
  url: string;
}

export interface AboutPage {
  title: string;
  headline: string;
  greeting: string;
  /** Bio copy as a small trusted inline-HTML fragment (e.g. `<em>` for production titles). */
  bio: string;
  photoUrl: string;
  links: AboutPageLink[];
}
