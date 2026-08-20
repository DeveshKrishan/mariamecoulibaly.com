package models

// ContentStatus mirrors the draft/published lifecycle used by the admin edit mode.
type ContentStatus string

// Content lifecycle states.
const (
	StatusDraft     ContentStatus = "draft"
	StatusPublished ContentStatus = "published"
)

// RichTextBlock is a loosely-typed block of the project body content.
// Kept generic here; a concrete block schema can be added once the
// rich text editor (Section 6.5 of docs/PLAN.md) is chosen.
type RichTextBlock map[string]any

// Project is a single portfolio project shown on the homepage grid and its
// own detail page.
type Project struct {
	ID           string          `json:"id"`
	Slug         string          `json:"slug"`
	Title        string          `json:"title"`
	PublishedAt  string          `json:"publishedAt"`
	Client       string          `json:"client"`
	Role         string          `json:"role"`
	Summary      string          `json:"summary"`
	Body         []RichTextBlock `json:"body"`
	ThumbnailURL string          `json:"thumbnailUrl"`
	SortOrder    int             `json:"sortOrder"`
	Status       ContentStatus   `json:"status"`
}
