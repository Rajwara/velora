# Velora

Website for Velora, a Munich-based specialist in German performance cars: a rental fleet (Porsche, BMW M, Mercedes-AMG, Audi Sport) and a care studio (servicing, diagnostics, HU/AU, tyres, detailing). Plain HTML, CSS and JavaScript; no build step.

## Run

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `about.html` | About: story, values, milestones, team |
| `fleet.html` | Fleet with marque filter and search (`?marque=bmw`, `?q=m4`), rental requirements |
| `services.html` | Care services gallery and price list |
| `blog.html` | Journal index with topic filter |
| `post-*.html` | Articles (Autobahn, winter tyres, HU/AU, warranty-safe servicing) |
| `contact.html` | Enquiry form (prefill with `?car=`, `?service=`, `?topic=`), hours, consent-based map |
| `faq.html` | FAQ accordion |
| `impressum.html`, `privacy.html`, `terms.html` | Legal pages (placeholders) |
| `404.html` | Not found page |
| `test.html` | Redirects to `fleet.html` |

Homepage service tabs can be opened directly with `index.html#service-pane-N` (1–5).

## Styling

- `css/style.css`: brand colours and fonts are CSS variables at the top of the file:
  - `--primary: #d4d414`, `--white: #ffffff`, `--dark: #080904`
  - Headings and body text use `Figtree, sans-serif`
  - Layout is capped at `--max-width: 1440px`
- `js/main.js`: menus, page transitions, magnetic buttons, scroll reveals, counters, parallax, stacked cards, tabs, before/after slider, filters, forms, FAQ accordion. Each feature checks its elements exist, so one file serves every page. All animations are disabled for visitors who set "reduce motion" in their OS.

## Before launch

- **Replace placeholder content**: company details in the Impressum (register number, VAT ID, managing director), the address, phone and email are dummy data.
- **Legal review**: Impressum, privacy policy and rental terms are drafts and must be reviewed by a lawyer.
- **Photos**: car, team and service photos are stand-ins loaded from Unsplash and Pexels. Replace them with your own, self-hosted images (each fleet photo should show the actual model).
- **Fonts**: Figtree is loaded from Google Fonts. Self-host it to avoid sending visitors' IP addresses to Google (a GDPR issue in Germany).
- **Forms**: the contact and VIP forms are demos and do not send data anywhere yet. Connect them to your booking system or a form service.
- **Prices and specs** are indicative placeholders.
