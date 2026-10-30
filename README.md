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
| `index.html` | Home: intro (about, why Velora), then three chapters: 01 Rent (how renting works, road trips, delivery), 02 Care (services, how care works, before/after), 03 Choose (plans, testimonials, journal, call to action) |
| `about.html` | About: story, values, milestones, team |
| `fleet.html` | Rental catalogue of 19 popular German cars with filters for brand, category, max daily price, fuel and seats, plus search and sorting. Filters are kept in the URL (`?marque=porsche,bmw&category=suv&fuel=electric&seats=5&max=500&q=gti&sort=price-asc`). Also rental requirements and delivery |
| `rent.html` | Short address that forwards to the fleet catalogue (keeps any filters) |
| `services.html` | Care services gallery and price list |
| `service-inspection.html`, `service-diagnostics.html`, `service-hu-au.html`, `service-tyres.html`, `service-detailing.html` | One page per care service: overview with quick facts, what's included, step-by-step process, prices, FAQs, related services and booking |
| `trip-german-alpine-road.html`, `trip-kesselberg-walchensee.html`, `trip-romantic-road.html`, `trip-grossglockner.html`, `trip-lake-garda.html` | One page per road trip (opened from the homepage carousel): overview with distance, time, season and tolls, stop-by-stop route, suggested car with Reserve, driving tips, more trips |
| `blog.html` | Journal with category, tag and search filters (`?category=care`, `?tag=winter`, `?q=tüv`) |
| `post-*.html` | Articles with a glass sidebar (search, categories, tags, recent posts), tags and copy-link |
| `contact.html` | Enquiry form (prefill with `?car=`, `?service=`, `?topic=`), hours, consent-based map |
| `faq.html` | FAQ accordion |
| `impressum.html`, `privacy.html`, `terms.html` | Legal pages (placeholders) |
| `404.html` | Not found page |
| `test.html` | Redirects to `fleet.html` |

Homepage service tabs can be opened directly with `index.html#service-pane-N` (1–5).

## Styling

- **One header and banner on every page**: each page opens with the same banner as the homepage (header inside the card, breadcrumb and intro along the top, eyebrow and headline, two-button action bar). The header has About, Fleet and Services (with dropdowns), Blog, Contact, fleet search and the menu button; the same header floats at the top once the banner scrolls away.
- **One footer on every page**: closing call to action (Rent a Car / Book a Service), priority-booking sign-up, page, support and contact links, social icons and the large wordmark. It is identical on all pages apart from the highlighted current link.

- **Favicon**: `favicon.ico`, `images/icons/favicon.svg` (yellow V on the dark brand colour), `apple-touch-icon.png` and 192/512 px icons for `site.webmanifest`. Replace `favicon.svg` with your logo and regenerate the PNGs if you have one.
- `css/style.css`: brand colours and fonts are CSS variables at the top of the file:
  - **Light theme**: a floating switch (bottom right, every page) toggles `data-theme="light"` on `<html>`: warm cream background with slowly drifting warm light, frosted-glass cards, header, chips, icons and footer, and an orange `#f26a1b` accent. The choice is saved in the visitor's browser. The homepage banner turns light (cream fade over the photo, white-glass header controls); the other photo banners stay dark in both themes so text over photos stays readable.
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
