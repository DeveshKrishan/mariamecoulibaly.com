export type ContentStatus = 'draft' | 'published';

export interface RichTextBlock {
  type: string;
  [key: string]: unknown;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  publishedAt: string; // ISO date
  role: string;
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
