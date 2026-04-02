# CBS Wine Website — Project Context

## Overview
Static website for **CBS Wine**, the student wine society at Copenhagen Business School.
We organize 2–3 wine tasting events per semester, regularly attended by 50–100 people, in partnership with wine shops and importers.

- **Live URL:** https://cbswine.dk
- **Hosting:** Netlify (free tier), auto-deploys from GitHub on push to main
- **Repository:** GitHub — `cbswine-website`
- **Domain registrar:** One.com (DNS pointed to Netlify)

## Audiences
1. **Students** — arriving from Instagram link-in-bio, mostly on mobile. They want to find upcoming events and buy tickets.
2. **Wine industry partners** — wine shops, importers, producers browsing on desktop. They want to understand our concept and reach out to collaborate.

## Tech Stack

### Hard rules — do NOT break these:
- **Pure HTML, CSS, and JavaScript only** — no React, no Vue, no frameworks, no npm, no build tools
- **No server-side code** — this is a static site hosted on Netlify
- **All changeable content lives in JSON files** in the `/data` folder — never hardcode event names, partner info, team members, or gallery photos into HTML
- **Single CSS file:** `css/styles.css` using CSS custom properties for all colors, spacing, and typography
- **Single JS file:** `js/main.js` handling navigation, data loading from JSON, gallery lightbox, scroll animations, and form behavior
- **Mobile-first responsive design** — breakpoints at 480px, 768px, 1024px

### Why these rules matter:
Future board members (non-developers) will maintain this site by editing JSON files and pushing to GitHub. The architecture must stay simple enough that someone with zero coding experience can update events and photos by following the README.

## File Structure
```
cbswine-website/
├── index.html          → Home page
├── events.html         → Events listing (upcoming + past)
├── gallery.html        → Photo gallery
├── partners.html       → Partnership info + contact form
├── about.html          → About us + team
├── css/
│   └── styles.css      → All styling, CSS custom properties
├── js/
│   └── main.js         → All JavaScript
├── data/
│   ├── events.json     → Event listings (upcoming + past)
│   ├── partners.json   → Partner names, logos, URLs
│   ├── gallery.json    → Gallery photos (Cloudinary IDs or local paths)
│   └── team.json       → Board members
├── images/
│   ├── hero/           → Hero background images
│   ├── events/         → Event-specific photos
│   ├── gallery/        → Gallery photos (if hosting locally)
│   ├── partners/       → Partner logos (PNG, transparent bg)
│   └── team/           → Team headshots (square crop)
├── CLAUDE.md           → This file (project context for Claude Code)
└── README.md           → Handover guide for future maintainers
```

## Brand & Design System

### Colors (CSS custom properties defined in styles.css)
| Variable | Hex | Role |
|----------|-----|------|
| `--color-primary` | #A43D3E | Wine red — buttons, nav, links, section accents |
| `--color-primary-dark` | #7A2D2E | Hover states, footer background |
| `--color-accent` | #C9A84C | Gold — decorative highlights, accents on dark backgrounds |
| `--color-accent-light` | #D4B96A | Subtle gold highlights, borders |
| `--color-bg` | #FAF8F5 | Page background (warm off-white, NOT pure white) |
| `--color-surface` | #F0ECE6 | Card backgrounds, alternating sections |
| `--color-text` | #1A1A1A | Body text, headings (near-black, softer than #000) |
| `--color-text-on-dark` | #FFFFFF | Text on wine red or dark backgrounds |

### Typography
- **Headings:** Playfair Display (serif) — loaded from Google Fonts
- **Body text:** Inter (sans-serif) — loaded from Google Fonts
- **Scale:** Use a consistent type scale. Headings should feel elegant, body text clean and readable.

### Design Tone
**Polished but approachable.** The site should feel credible to wine industry professionals while being welcoming to a 22-year-old CBS student.
- Generous whitespace — let photos and content breathe
- Large photography — event photos are a core design element
- Subtle animations — gentle fade-in on scroll, nothing flashy
- Partner logos grayscale by default, color on hover
- Navigation: transparent over hero, solid with shadow on scroll
- Footer: dark background (--color-primary-dark), white text

## Page Architecture

### Home (index.html)
1. Hero — full-viewport image, dark overlay, logo, tagline, subtitle, two CTA buttons (events + partners)
2. Upcoming events preview — first 1–2 upcoming events from events.json, "Get Tickets" links to Billetto
3. About teaser — short paragraph + "Learn More" link
4. Partner logo strip — logos from partners.json, grayscale → color hover

### Events (events.html)
1. Upcoming events — cards from events.json where status="upcoming", with Billetto ticket links
2. Past events — simpler grid of completed events, newest first
3. Custom events callout — "Want us to organize a tasting for your society?"

### Gallery (gallery.html)
- Responsive photo grid with lightbox
- Photos loaded from gallery.json
- Grouped by event, newest first

### Partners (partners.html)
1. Value proposition — why partner with CBS Wine (audience, free venue, logistics handled)
2. How it works — 3–4 step visual process
3. Current & past partner logos from partners.json
4. Contact form (uses Netlify Forms — the `netlify` attribute on the form tag)

### About (about.html)
1. Our story — mission and background
2. Team grid — from team.json (photo, name, role)
3. Contact — email + Instagram

## JSON Data Schemas

### events.json
```json
[
  {
    "id": "unique-slug",
    "name": "Event Name",
    "status": "upcoming",
    "date": "2026-04-24",
    "time": "18:00",
    "location": "CBS Solbjerg Plads, Auditorium SP112",
    "partner": {
      "name": "Partner Name",
      "logo": "images/partners/partner.png",
      "url": "https://partner-website.dk"
    },
    "price": "100 kr",
    "wines": 4,
    "description": "Short event description, 2–3 sentences.",
    "ticketUrl": "https://billetto.dk/e/event-id",
    "soldOut": false,
    "image": "images/events/event-photo.jpg"
  }
]
```
- `status` must be either `"upcoming"` or `"past"`
- `ticketUrl` should be `null` for past events
- Events are displayed sorted by date (upcoming: soonest first, past: newest first)

### partners.json
```json
[
  {
    "name": "Partner Name",
    "logo": "images/partners/partner-logo.png",
    "url": "https://partner-website.dk",
    "type": "wine-partner",
    "active": true
  }
]
```

### gallery.json
```json
[
  {
    "event": "Event Name",
    "date": "2026-04-24",
    "photos": [
      {
        "image": "images/gallery/photo.jpg",
        "thumbnail": "images/gallery/thumbs/photo.jpg",
        "caption": "Optional caption text"
      }
    ]
  }
]
```
- Photos grouped by event, events ordered newest first
- Captions are optional — empty string `""` is fine

### team.json
```json
[
  {
    "name": "Full Name",
    "role": "Role Title",
    "photo": "images/team/name.jpg",
    "linkedin": "https://linkedin.com/in/profile"
  }
]
```
- LinkedIn is optional — use `null` if not provided

## Ticketing
- Tickets are sold via **Billetto** (billetto.dk)
- The website links OUT to Billetto — we do NOT embed or process tickets on our site
- Each event card has a "Get Tickets" button linking to the Billetto event URL

## Contact Form
- The partners page has a contact form using **Netlify Forms**
- The `<form>` tag must include the `netlify` attribute (or `data-netlify="true"`)
- Submissions go to the Netlify dashboard and are forwarded to the CBS Wine email
- Fields: Name, Organization, Email, Message

## Social & Contact
- **Instagram:** primary social channel (link with icon in footer + about page)
- **Email:** general inquiries address (in footer + about page + partners contact form)
- No Facebook, LinkedIn, or other social platforms on the site

## Deployment
- Push to `main` branch on GitHub → Netlify auto-deploys within ~60 seconds
- No build step needed — Netlify serves the files directly
- HTTPS is handled automatically by Netlify (Let's Encrypt)
- Test locally by opening HTML files directly in a browser (most features work, but fetch() for JSON requires a local server: `python -m http.server 8000` or VS Code Live Server extension)

## When Making Changes

### For content updates (events, partners, team, gallery):
→ Edit the relevant JSON file in `/data`. Do NOT edit HTML.

### For text changes on pages (headings, paragraphs, taglines):
→ Edit the HTML file directly. Keep structure intact.

### For styling changes (colors, spacing, fonts, layout):
→ Edit `css/styles.css`. Prefer changing CSS custom properties over hardcoding values.

### For behavior changes (animations, data loading, lightbox):
→ Edit `js/main.js`.

### For structural changes (new sections, new pages, redesigns):
→ This is where Claude Code earns its keep. Describe what you want in natural language.

## Common Tasks — Example Prompts

### Add a new upcoming event:
"Add a new event to events.json: Italian Wine Night on May 15 2026 at 18:00, CBS Solbjerg Plads SP112, partner is Laudrup Vin, 100 kr for 4 wines, tickets at [billetto URL]. Write a short enticing description."

### Move an event to past:
"Change the status of the Italian Wine Night event in events.json from upcoming to past and set ticketUrl to null"

### Add photos to the gallery:
"Add a new gallery entry for the Italian Wine Night (2026-05-15) with these 5 photos: [list filenames]. Write short captions for each."

### Update the team:
"Remove [name] from team.json and add [new name] as [role] with photo at images/team/[filename].jpg"

### Styling tweaks:
"Increase the padding inside event cards and add more space between the cards on mobile"
"Make the section headings slightly larger on desktop"

### Bigger changes:
"Add a new 'Student Discounts' page that loads discount offers from a new data/discounts.json file. Follow the same design patterns as the events page."

## Future Enhancements (not yet built)
- Student discounts page (partner wine shops offering CBS Wine member discounts)
- Cloudinary integration for gallery (mass upload photos, auto-generate thumbnails)
- Instagram feed embed on home page
- Newsletter signup (Mailchimp or Buttondown)
- Event archive with filters (by year, partner, wine region)
- Multi-language support (Danish)
