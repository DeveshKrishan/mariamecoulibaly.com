package store

import "github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/models"

// stubProjects is the Phase 1 content migrated from the reference site
// (mariamecoulibaly.com). It backs the in-memory Store and is upserted into
// Postgres by `make seed` / cmd/seed when a database is configured.
//
// Titles, slugs, publish dates, roles, summaries, and body copy match the
// reference site; sortOrder is reverse-chronological (0 = most recent).
//
// Outbound media CTAs use type "link" ("Watch Here" / "Listen Here" buttons),
// matching Squarespace — the original site never iframe-embeds video/audio.
//
// ThumbnailURLs (and body image URLs) point at public Supabase Storage
// objects in the project-media bucket (seeded via make migrate-media).
var stubProjects = []models.Project{
	{
		ID: "1", Slug: "residenthome", Title: "Resident Home", PublishedAt: "2026-07-22",
		Client: "Resident Home/Nectar", Role: "Assistant Editor — Freelance",
		Summary: "Organized footage and re-cut Amazon advertisements",
		Body: []models.RichTextBlock{
			{"type": "image", "url": "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/3357d464-18d0-41ba-9dd6-048dfeb7bda9/seed.jpg", "alt": "Resident Home"},
			{"type": "paragraph", "text": "Resident Home is a house of direct-to-consumer sleep brands, best known for Nectar, DreamCloud, Siena, and Awara mattresses."},
			{"type": "link", "url": "https://m.media-amazon.com/images/S/al-na-9d5791cf-3faf/88c96b86-52f0-45ba-8ac6-25a9ed632108.mp4/videoTile.mp4", "label": "Watch Here"},
		},
		ThumbnailURL: "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/3357d464-18d0-41ba-9dd6-048dfeb7bda9/seed.jpg", SortOrder: 0, Status: models.StatusPublished,
	},
	{
		ID: "2", Slug: "udacity", Title: "Udacity Accenture", PublishedAt: "2026-06-13",
		Client: "Udacity/Accenture", Role: "Junior Video Producer",
		Summary: "Produced 50+ Courses and Marketing Videos",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "Udacity is a global edtech platform reaching over 16.9 million learners across 240+ countries through industry-co-created Nanodegree programs in tech, AI, and data. I apply my film background to produce and edit video course content that makes complex, technical subjects clear and engaging for a worldwide audience."},
			{"type": "paragraph", "text": "Examples: Japanese Localization, Java Programming, Anthropic Engineer"},
			{"type": "link", "url": "https://www.youtube.com/watch?v=yftQNN73AP0&t=13s", "label": "Watch Here"},
		},
		ThumbnailURL: "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/8306c988-3b1e-4293-9929-96ed427acd49/seed.jpg", SortOrder: 1, Status: models.StatusPublished,
	},
	{
		ID: "3", Slug: "flyingupstream", Title: "Flying Upstream Podcast", PublishedAt: "2025-11-13",
		Client: "Flying Upstream Podcast", Role: "Podcast Editor",
		Summary: "Edited Episodes 100-150 | Contributed to a 300% increase in streams and downloads",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "Hosted by Luisa Anderson and Kristyn Medeiros, Flying Upstream invites you to explore the unconventional paths that lead to fulfilling, sustainable lives. Each episode uncovers how individuals break free from societal norms to create their own unique journeys. From ancient wisdom to modern-day choices, our discussions challenge you to think beyond the mainstream and embrace alternative perspectives. If you've ever felt like flying north while the world turns south, you've found your flock."},
			{"type": "link", "url": "https://podcasts.apple.com/us/podcast/flying-upstream-podcast/id1745028647", "label": "Listen Here"},
		},
		ThumbnailURL: "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/56709ace-fbe7-4f19-800b-955e0acd9344/seed.webp", SortOrder: 2, Status: models.StatusPublished,
	},
	{
		ID: "4", Slug: "future-of-the-bay-kqed-special", Title: "Future of the Bay- KQED Special", PublishedAt: "2025-09-15",
		Client: "KQED", Role: "Reporter and Audio Editor",
		Summary: "Featured on KQED Radio (343,000 average weekly listeners)",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "Curious about what young people think about the future of our region? Every year, students from San Francisco State University grab microphone kits in search of stories that matter to them. They dive deep into the heart of the Bay’s diverse communities and explore pressing issues that will remain relevant in the years to come. From a jazz-loving church, to firefighting goats, to a marine lab’s fight for survival, students share unexpected stories and amplify diverse voices in this special report, “The Future of the Bay.”"},
			{"type": "link", "url": "https://www.kqed.org/radio/5555/future-of-the-bay-july-2025-special", "label": "Listen Here"},
		},
		ThumbnailURL: "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/88cbd9b1-bd07-4b4f-8960-41989b8cfd5f/seed.jpg", SortOrder: 3, Status: models.StatusPublished,
	},
	{
		ID: "5", Slug: "holi-celebration-pyarful", Title: "Holi Celebration- Pyarful", PublishedAt: "2025-03-21",
		Client: "Pyarful", Role: "Editor & Videographer",
		Summary: "Featured on Pyarful’s Instagram (30.5K followers)",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "A showing of Pyarful’s Truck Tea Towel being used to wrap flowers. Made just in time for Holi, the Festival of Colors."},
			{"type": "link", "url": "https://www.instagram.com/reel/DHJrIjZSKTz/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", "label": "Watch Here"},
		},
		ThumbnailURL: "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/8bc8c012-8a92-4ce6-9ef1-9e1f4b573c8b/seed.webp", SortOrder: 4, Status: models.StatusPublished,
	},
	{
		ID: "6", Slug: "founder-introduction-pyarful", Title: "Founder Introduction- Pyarful", PublishedAt: "2025-03-21",
		Client: "Pyarful", Role: "Editor & Videographer",
		Summary: "Featured on Pyarful’s Instagram (30.5K followers)",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "Krisa is the founder and illustrator behind Pyarful. A mother of two, she is passionate about sharing her South Asian culture. In 2018, she left her tech career of nearly a decade to create greeting cards. What started as just eight small greeting cards has since grown into the whimsical and joyful brand seen today, offering stationery, homewares, and more."},
			{"type": "link", "url": "https://www.instagram.com/reel/DFqWgzdyrw5/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", "label": "Watch Here"},
		},
		ThumbnailURL: "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/3da19481-db82-4a47-b58e-5376356b990e/seed.jpg", SortOrder: 5, Status: models.StatusPublished,
	},
	{
		ID: "7", Slug: "biodiversitypge", Title: "Biodiversity and Climate Optimist at Heart- PG&E", PublishedAt: "2025-03-18",
		Client: "BAVC Media", Role: "Editor",
		Summary: "Featured on PG&E’s YouTube (35.8K subscribers)",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "Partnered with PG&E"},
			{"type": "paragraph", "text": "Tackling the impact of climate change is going to take all of us. Tanya Rivas is building a vision on how we can coexist with the needs of the plants and animals around us. Tanya is from American Canyon, studying Ecology, Evolution and Biodiversity at UC Davis."},
			{"type": "link", "url": "https://youtu.be/eq6bDsFdjnA", "label": "Watch Here"},
		},
		ThumbnailURL: "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/febd8ad2-946a-4453-aea8-9772171b102a/seed.jpg", SortOrder: 6, Status: models.StatusPublished,
	},
	{
		ID: "8", Slug: "techwomen-pge", Title: "TechWomen- PG&E", PublishedAt: "2025-01-15",
		Client: "BAVC Media Partnered with PG&E", Role: "Editor",
		Summary: "Featured on PG&E’s Instagram (24K followers)",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "PG&E participates in the TechWomen program, in partnership with the U.S. Department of State, so that PG&E teams and energy officials from across the world can work together and collaborate."},
			{"type": "link", "url": "https://www.instagram.com/reel/DDXsYTtzPok/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", "label": "Watch Here"},
		},
		ThumbnailURL: "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/27b93502-495f-4b8e-9f53-8cc90b5d162f/seed.jpg", SortOrder: 7, Status: models.StatusPublished,
	},
	{
		ID: "9", Slug: "salutingbranches", Title: "Saluting Branches- PG&E", PublishedAt: "2024-11-04",
		Client: "BAVC Media Partnered with PG&E", Role: "Editor",
		Summary: "Featured on PG&E’s YouTube (35.2K subscribers) and Instagram (24K followers)",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "PG&E coworker volunteers participate in Saluting Branches, a one-day annual event where volunteers visit national veteran cemeteries to care for trees and landscape."},
			{"type": "link", "url": "https://youtube.com/shorts/OhKzEKn3jOs", "label": "Watch Here"},
		},
		ThumbnailURL: "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/3d3c3c27-4c4c-47a0-8e55-af23464fcb2a/seed.jpg", SortOrder: 8, Status: models.StatusPublished,
	},
	{
		ID: "10", Slug: "beautification-pge", Title: "Beautification- PG&E", PublishedAt: "2024-11-04",
		Client: "BAVC Media Partnered with PG&E", Role: "Editor",
		Summary: "Featured on PG&E’s YouTube (35.2K subscribers) and Instagram (24K followers)",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "PG&E volunteers get their hands dirty at schools to get them ready and looking nice for the start of the school year."},
			{"type": "link", "url": "https://youtube.com/shorts/r2M18yIpaAY", "label": "Watch Here"},
		},
		ThumbnailURL: "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/1cd33d69-ded1-4771-8bd4-f083d5c9b4c6/seed.jpg", SortOrder: 9, Status: models.StatusPublished,
	},
	{
		ID: "11", Slug: "kqedanimalshelter", Title: "Inside a No-Kill Animal Shelter- KQED", PublishedAt: "2024-09-27",
		Client: "KQED", Role: "Director, Creative Collaborator",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "Join us on a wild adventure as we explore the ultimate animal rescue shelter in San Francisco! Watch contestants spin the wheel, answer quiz questions, and meet adorable furry friends. Don’t forget to subscribe for more wholesome content like this!"},
			{"type": "link", "url": "https://youtu.be/UeB-LalwVk8", "label": "Watch Here"},
		},
		ThumbnailURL: "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/8e13a7f3-9211-492e-96b9-45248d06ae76/seed.jpg", SortOrder: 10, Status: models.StatusPublished,
	},
	{
		ID: "12", Slug: "comrade-is-my-pronoun", Title: "Comrade is My Pronoun", PublishedAt: "2024-09-27",
		Client: "BAVC Media", Role: "Cinematographer, Editor",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "“Comrade Is My Pronoun” explores the legacy of The Black Panther Party up close with former chairwoman Elaine Brown. We discuss what radical liberation looks like, and what it means to be in solidarity."},
			{"type": "link", "url": "https://youtu.be/GVqtoBQuNCA", "label": "Watch Here"},
		},
		ThumbnailURL: "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/b3892e1b-241b-4b7e-a2b1-abba50467472/seed.jpg", SortOrder: 11, Status: models.StatusPublished,
	},
	{
		ID: "13", Slug: "kqed", Title: "Things to Do at Dolores Park This Summer- KQED", PublishedAt: "2024-09-27",
		Client: "KQED", Role: "Producer, Cinematographer, Editor",
		Summary: "Featured on KQED's main Instagram account (175K followers)",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "Fun times at Dolores Park! From tennis and sunshine to the playground, there's something for everyone."},
			{"type": "link", "url": "https://www.instagram.com/reel/C8u2ke1yeGX/?utm_source=ig_web_copy_link", "label": "Watch Here"},
		},
		ThumbnailURL: "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/8d2afe07-bb54-485e-b7df-3455752492be/seed.jpg", SortOrder: 12, Status: models.StatusPublished,
	},
	{
		ID: "14", Slug: "chabotfireacademy", Title: "Chabot Fire Academy", PublishedAt: "2021-08-05",
		Client:  "Chabot-Las Positas Community College",
		Role:    "Producer, Director, Cinematographer, Interviewer, and Sound Editor",
		Summary: "Best Documentary at the 2023 Chabot Film & Animation Festival",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "A look into the students of Chabot College’s Fire Tech Academy."},
			{"type": "link", "url": "https://drive.google.com/file/d/1qAlwTFvTLvIPsBsye1YFMifzzjiwauT5/view?usp=sharing", "label": "Watch Here"},
		},
		ThumbnailURL: "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/a74cc812-e212-4bc4-bef7-2796c9bb9481/seed.jpg", SortOrder: 13, Status: models.StatusPublished,
	},
	{
		ID: "15", Slug: "gorast-droll", Title: "Gorast Droll", PublishedAt: "2021-08-04",
		Client: "Chabot-Las Positas Community College", Role: "Producer, Cinematographer, Writer, and Editor",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "Jessie’s discovery uncovers a viscous monster that forces them to fight for their life."},
			{"type": "link", "url": "https://youtu.be/GrG66w4Tvyw", "label": "Watch Here"},
		},
		ThumbnailURL: "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/2b35613b-5b7d-434e-8818-1de92896c690/seed.jpg", SortOrder: 14, Status: models.StatusPublished,
	},
	{
		ID: "16", Slug: "city-surf-project", Title: "City Surf Project", PublishedAt: "2021-07-30",
		Client: "San Francisco State University", Role: "Producer, Cinematographer, Editor",
		Body: []models.RichTextBlock{
			{"type": "paragraph", "text": "City Surf Project introduces San Francisco high schoolers to surfing for free. This is the story of one of many SF high school surfers."},
			{"type": "link", "url": "https://drive.google.com/file/d/1t2ZEpeIL_ay3-qxjskiSMBNYWAR2jAWJ/view?usp=sharing", "label": "Watch Here"},
		},
		ThumbnailURL: "https://qsckqwxajgpxpzvlerdg.supabase.co/storage/v1/object/public/project-media/projects/b776016f-b7b9-4921-b79e-0bd500c00968/seed.jpg", SortOrder: 15, Status: models.StatusPublished,
	},
}
