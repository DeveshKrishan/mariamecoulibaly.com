package store

import "github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/models"

// stubAboutPage is transcribed from the reference site's /about-me page.
// PhotoURL points at ui/public/images/about/ (served by the ui app).
var stubAboutPage = models.AboutPage{
	Title:    "About Me",
	Headline: "an emerging media professional from the San Francisco Bay Area",
	Greeting: "Hello!",
	Bio: "I’m an emerging media professional with a passion for storytelling and an eye for media production. " +
		"I have a Bachelor’s degree in cinema with a minor in journalism from San Francisco State University. " +
		"Currently, I am a junior video producer at Accenture. Previously, I was a video editor for <em>Flying Upstream</em> " +
		"and Assistant Editor for Pedal Born Pictures. I was a video editing fellow at BAVC Media, partnering with PG&amp;E. " +
		"I directed and produced the award-winning documentary <em>Chabot Fire Academy</em>, which won Best Documentary at " +
		"the Chabot Film &amp; Animation Festival, and Oakland BAVC short <em>Comrade is My Pronoun</em>. Following these " +
		"projects, I interned at KQED, where I helped develop their first-ever youth-produced digital video series, " +
		"<em>The Field Trip Game: A Ridiculous Adventure Game with Mediocre Prizes</em>, and recently produced the Future " +
		"of the Bay radio special with them.",
	PhotoURL: "/images/about/headshot.webp",
	Links: []models.AboutPageLink{
		{Label: "Resume", URL: "https://drive.google.com/file/d/1m5bSOC6hLU2mOcPVJ6Od5i5Vhg7l2DOr/view?usp=sharing"},
		{Label: "LinkedIn", URL: "https://www.linkedin.com/in/mariam-e-coulibaly"},
	},
}
