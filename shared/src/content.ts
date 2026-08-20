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
  headline: string;
  bio: string;
  links: AboutPageLink[];
}
