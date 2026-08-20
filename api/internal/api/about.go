package api

import (
	"net/http"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/models"
)

// PhotoURL points at the headshot scraped from the reference site's About Me
// page and downloaded into ui/public/images/about/ (served by the ui app
// itself, not this API — see docs/PLAN.md Section 5.5).
var stubAboutPage = models.AboutPage{
	Headline: "an emerging media professional from the San Francisco Bay Area",
	Bio:      "Coming soon.",
	PhotoURL: "/images/about/headshot.webp",
	Links: []models.AboutPageLink{
		{Label: "Resume", URL: "https://drive.google.com/file/d/1m5bSOC6hLU2mOcPVJ6Od5i5Vhg7l2DOr/view?usp=sharing"},
		{Label: "LinkedIn", URL: "https://www.linkedin.com/in/mariam-e-coulibaly"},
	},
}

func handleGetAboutPage(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, stubAboutPage)
}
