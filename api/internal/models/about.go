package models

// AboutPageLink is a single external link shown in the "My Links" section.
type AboutPageLink struct {
	Label string `json:"label"`
	URL   string `json:"url"`
}

// AboutPage is the content of the About Me page.
type AboutPage struct {
	Headline string          `json:"headline"`
	Bio      string          `json:"bio"`
	PhotoURL string          `json:"photoUrl"`
	Links    []AboutPageLink `json:"links"`
}
