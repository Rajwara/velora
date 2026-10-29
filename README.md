# Velora

Homepage for an automotive / premium car rental website. Plain HTML, CSS and JavaScript; no build step.

## Run

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Structure

- `index.html`: page markup (hero, about, featured models, why choose us, testimonials, process, blog, footer)
- `css/style.css`: styles. Brand colours and fonts are CSS variables at the top of the file:
  - `--primary: #d4d414`, `--white: #ffffff`, `--dark: #080904`
  - Headings (and body text) use `Figtree, sans-serif`
- `js/main.js`: slide-out menu, Models dropdown, scroll reveals (word-by-word headings, staggered cards), stat counters, hero parallax, stacked model cards, auto-scrolling testimonials, timeline progress, scroll progress bar, back-to-top

Layout is capped at `--max-width: 1440px`. All animations are disabled for visitors who set "reduce motion" in their OS.

Images are loaded from Unsplash as placeholders. Replace the `src` attributes with your own photos before going live.
