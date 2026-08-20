package api

import (
	"net/http"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/models"
)

// stubProjects is placeholder seed data until Phase 2 (docs/PLAN.md Section 10)
// wires up a real database and the Squarespace content migration.
//
// Titles, slugs, and publish dates are copied from the reference site
// (mariamecoulibaly.com) so the ordering matches exactly; sortOrder is
// assigned in the same reverse-chronological order the reference site
// displays them (0 = most recent). Roles/summaries beyond "residenthome"
// are placeholders pending the real content migration.
var stubProjects = []models.Project{
	{ID: "1", Slug: "residenthome", Title: "Resident Home", PublishedAt: "2026-07-22", Role: "Assistant Editor — Freelance", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "", SortOrder: 0, Status: models.StatusPublished},
	{ID: "2", Slug: "udacity", Title: "Udacity Accenture", PublishedAt: "2026-06-13", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "", SortOrder: 1, Status: models.StatusPublished},
	{ID: "3", Slug: "flyingupstream", Title: "Flying Upstream Podcast", PublishedAt: "2025-11-13", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "", SortOrder: 2, Status: models.StatusPublished},
	{ID: "4", Slug: "future-of-the-bay-kqed-special", Title: "Future of the Bay- KQED Special", PublishedAt: "2025-09-15", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "", SortOrder: 3, Status: models.StatusPublished},
	{ID: "5", Slug: "holi-celebration-pyarful", Title: "Holi Celebration- Pyarful", PublishedAt: "2025-03-21", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "", SortOrder: 4, Status: models.StatusPublished},
	{ID: "6", Slug: "founder-introduction-pyarful", Title: "Founder Introduction- Pyarful", PublishedAt: "2025-03-21", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "", SortOrder: 5, Status: models.StatusPublished},
	{ID: "7", Slug: "biodiversitypge", Title: "Biodiversity and Climate Optimist at Heart- PG&E", PublishedAt: "2025-03-18", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "", SortOrder: 6, Status: models.StatusPublished},
	{ID: "8", Slug: "techwomen-pge", Title: "TechWomen- PG&E", PublishedAt: "2025-01-15", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "", SortOrder: 7, Status: models.StatusPublished},
	{ID: "9", Slug: "salutingbranches", Title: "Saluting Branches- PG&E", PublishedAt: "2024-11-04", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "", SortOrder: 8, Status: models.StatusPublished},
	{ID: "10", Slug: "beautification-pge", Title: "Beautification- PG&E", PublishedAt: "2024-11-04", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "", SortOrder: 9, Status: models.StatusPublished},
	{ID: "11", Slug: "kqedanimalshelter", Title: "Inside a No-Kill Animal Shelter- KQED", PublishedAt: "2024-09-27", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "", SortOrder: 10, Status: models.StatusPublished},
	{ID: "12", Slug: "comrade-is-my-pronoun", Title: "Comrade is My Pronoun", PublishedAt: "2024-09-27", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "", SortOrder: 11, Status: models.StatusPublished},
	{ID: "13", Slug: "kqed", Title: "Things to Do at Dolores Park This Summer- KQED", PublishedAt: "2024-09-27", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "", SortOrder: 12, Status: models.StatusPublished},
	{ID: "14", Slug: "chabotfireacademy", Title: "Chabot Fire Academy", PublishedAt: "2021-08-05", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "", SortOrder: 13, Status: models.StatusPublished},
	{ID: "15", Slug: "gorast-droll", Title: "Gorast Droll", PublishedAt: "2021-08-04", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "", SortOrder: 14, Status: models.StatusPublished},
	{ID: "16", Slug: "city-surf-project", Title: "City Surf Project", PublishedAt: "2021-07-30", Role: "Coming soon.", Summary: "Coming soon.", Body: []models.RichTextBlock{}, ThumbnailURL: "", SortOrder: 15, Status: models.StatusPublished},
}

func handleListProjects(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, stubProjects)
}

func handleGetProject(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")

	for _, project := range stubProjects {
		if project.Slug == slug {
			writeJSON(w, http.StatusOK, project)
			return
		}
	}

	writeJSON(w, http.StatusNotFound, map[string]string{"error": "project not found"})
}
