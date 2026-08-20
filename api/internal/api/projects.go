package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/models"
)

// stubProjects is placeholder seed data until Phase 2 (docs/PLAN.md Section 10)
// wires up a real database and the Squarespace content migration.
//
// Titles, slugs, and publish dates are copied from the reference site
// (mariamecoulibaly.com) so the ordering matches exactly; sortOrder is
// assigned in the same reverse-chronological order the reference site
// displays them (0 = most recent). Roles/summaries/body beyond a few
// representative projects are placeholders pending the real content migration.
//
// ThumbnailURLs point at images scraped from each project's reference-site
// grid thumbnail and downloaded into ui/public/images/projects/ (served by
// the ui app itself, not this API, since there's no media storage yet —
// see docs/PLAN.md Section 5.5).
var stubProjects = []models.Project{
	{
		ID: "1", Slug: "residenthome", Title: "Resident Home", PublishedAt: "2026-07-22",
		Client: "Resident Home/Nectar", Role: "Assistant Editor — Freelance",
		Summary: "Organized footage and re-cut Amazon advertisements",
		Body: []models.RichTextBlock{
			{"type": "image", "url": "/images/projects/residenthome.jpg", "alt": "Resident Home"},
			{"type": "paragraph", "text": "Resident Home is a house of direct-to-consumer sleep brands, best known for Nectar, DreamCloud, Siena, and Awara mattresses."},
			{"type": "link", "url": "https://m.media-amazon.com/images/S/al-na-9d5791cf-3faf/88c96b86-52f0-45ba-8ac6-25a9ed632108.mp4/videoTile.mp4", "label": "Watch"},
		},
		ThumbnailURL: "/images/projects/residenthome.jpg", SortOrder: 0, Status: models.StatusPublished,
	},
	{ID: "2", Slug: "udacity", Title: "Udacity Accenture", PublishedAt: "2026-06-13", Client: "", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "/images/projects/udacity.jpg", SortOrder: 1, Status: models.StatusPublished},
	{
		ID: "3", Slug: "flyingupstream", Title: "Flying Upstream Podcast", PublishedAt: "2025-11-13",
		Client: "Flying Upstream Podcast", Role: "Podcast Editor",
		Summary: "Edited Episodes 100-150 | Contributed to a 300% increase in streams and downloads",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "Hosted by Luisa Anderson and Kristyn Medeiros, Flying Upstream invites you to explore the unconventional paths that lead to fulfilling, sustainable lives. Each episode uncovers how individuals break free from societal norms to create their own unique journeys. From ancient wisdom to modern-day choices, our discussions challenge you to think beyond the mainstream and embrace alternative perspectives. If you've ever felt like flying north while the world turns south, you've found your flock."},
		},
		ThumbnailURL: "/images/projects/flyingupstream.webp", SortOrder: 2, Status: models.StatusPublished,
	},
	{ID: "4", Slug: "future-of-the-bay-kqed-special", Title: "Future of the Bay- KQED Special", PublishedAt: "2025-09-15", Client: "", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "/images/projects/future-of-the-bay-kqed-special.jpg", SortOrder: 3, Status: models.StatusPublished},
	{ID: "5", Slug: "holi-celebration-pyarful", Title: "Holi Celebration- Pyarful", PublishedAt: "2025-03-21", Client: "", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "/images/projects/holi-celebration-pyarful.webp", SortOrder: 4, Status: models.StatusPublished},
	{ID: "6", Slug: "founder-introduction-pyarful", Title: "Founder Introduction- Pyarful", PublishedAt: "2025-03-21", Client: "", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "/images/projects/founder-introduction-pyarful.jpg", SortOrder: 5, Status: models.StatusPublished},
	{
		ID: "7", Slug: "biodiversitypge", Title: "Biodiversity and Climate Optimist at Heart- PG&E", PublishedAt: "2025-03-18",
		Client: "BAVC Media", Role: "Editor",
		Summary: "Featured on PG&E’s YouTube (35.8K subscribers)",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "Partnered with PG&E"},
			{"type": "paragraph", "text": "Tackling the impact of climate change is going to take all of us. Tanya Rivas is building a vision on how we can coexist with the needs of the plants and animals around us. Tanya is from American Canyon, studying Ecology, Evolution and Biodiversity at UC Davis."},
			{"type": "embed", "url": "https://youtu.be/eq6bDsFdjnA", "provider": "youtube"},
		},
		ThumbnailURL: "/images/projects/biodiversitypge.jpg", SortOrder: 6, Status: models.StatusPublished,
	},
	{ID: "8", Slug: "techwomen-pge", Title: "TechWomen- PG&E", PublishedAt: "2025-01-15", Client: "", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "/images/projects/techwomen-pge.jpg", SortOrder: 7, Status: models.StatusPublished},
	{ID: "9", Slug: "salutingbranches", Title: "Saluting Branches- PG&E", PublishedAt: "2024-11-04", Client: "", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "/images/projects/salutingbranches.jpg", SortOrder: 8, Status: models.StatusPublished},
	{ID: "10", Slug: "beautification-pge", Title: "Beautification- PG&E", PublishedAt: "2024-11-04", Client: "", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "/images/projects/beautification-pge.jpg", SortOrder: 9, Status: models.StatusPublished},
	{ID: "11", Slug: "kqedanimalshelter", Title: "Inside a No-Kill Animal Shelter- KQED", PublishedAt: "2024-09-27", Client: "", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "/images/projects/kqedanimalshelter.jpg", SortOrder: 10, Status: models.StatusPublished},
	{ID: "12", Slug: "comrade-is-my-pronoun", Title: "Comrade is My Pronoun", PublishedAt: "2024-09-27", Client: "", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "/images/projects/comrade-is-my-pronoun.jpg", SortOrder: 11, Status: models.StatusPublished},
	{
		ID: "13", Slug: "kqed", Title: "Things to Do at Dolores Park This Summer- KQED", PublishedAt: "2024-09-27",
		Client: "KQED", Role: "Producer, Cinematographer, Editor",
		Summary: "Featured on KQED's main Instagram account (175K followers)",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "Fun times at Dolores Park! From tennis and sunshine to the playground, there's something for everyone."},
		},
		ThumbnailURL: "/images/projects/kqed.jpg", SortOrder: 12, Status: models.StatusPublished,
	},
	{
		ID: "14", Slug: "chabotfireacademy", Title: "Chabot Fire Academy", PublishedAt: "2021-08-05",
		Client:  "Chabot-Las Positas Community College",
		Role:    "Producer, Director, Cinematographer, Interviewer, and Sound Editor",
		Summary: "Best Documentary at the 2023 Chabot Film & Animation Festival",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "A look into the students of Chabot College’s Fire Tech Academy."},
		},
		ThumbnailURL: "/images/projects/chabotfireacademy.jpg", SortOrder: 13, Status: models.StatusPublished,
	},
	{ID: "15", Slug: "gorast-droll", Title: "Gorast Droll", PublishedAt: "2021-08-04", Client: "", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "/images/projects/gorast-droll.jpg", SortOrder: 14, Status: models.StatusPublished},
	{ID: "16", Slug: "city-surf-project", Title: "City Surf Project", PublishedAt: "2021-07-30", Client: "", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "/images/projects/city-surf-project.jpg", SortOrder: 15, Status: models.StatusPublished},
}

func handleListProjects(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, stubProjects)
}

func handleGetProject(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	for _, project := range stubProjects {
		if project.Slug == slug {
			writeJSON(w, http.StatusOK, project)
			return
		}
	}

	writeJSON(w, http.StatusNotFound, map[string]string{"error": "project not found"})
}
