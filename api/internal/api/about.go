package api

import (
	"net/http"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/models"
)

var stubAboutPage = models.AboutPage{
	Headline: "an emerging media professional from the San Francisco Bay Area",
	Bio:      "Coming soon.",
	Links: []models.AboutPageLink{
		{Label: "LinkedIn", URL: "https://www.linkedin.com"},
	},
}

func handleGetAboutPage(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, stubAboutPage)
}
