package models

// AboutPageLink is a single external link shown in the "My Links" section.
type AboutPageLink struct {
	Label string `json:"label"`
	URL   string `json:"url"`
}

// AboutPage is the content of the About Me page.
type AboutPage struct {
	Title    string `json:"title"`
	Headline string `json:"headline"`
	Greeting string `json:"greeting"`
	// Bio is a small trusted inline-HTML fragment (e.g. <em> around production
	// titles) rendered as-is by the ui app — not user-generated content.
	Bio      string          `json:"bio"`
	PhotoURL string          `json:"photoUrl"`
	Links    []AboutPageLink `json:"links"`
}
