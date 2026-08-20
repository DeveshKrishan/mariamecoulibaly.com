package api

import (
	"net/http"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/models"
)

var stubAboutPage = models.AboutPage{
	Headline: "an emerging media professional from the San Francisco Bay Area",
	Bio:      "Coming soon.",
	Links: []models.AboutPageLink{
		{Label: "Resume", URL: "https://drive.google.com/file/d/1m5bSOC6hLU2mOcPVJ6Od5i5Vhg7l2DOr/view?usp=sharing"},
		{Label: "LinkedIn", URL: "https://www.linkedin.com/in/mariam-e-coulibaly"},
	},
}

func handleGetAboutPage(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, stubAboutPage)
}
