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
  - Headings use `Figtree, sans-serif`
- `js/main.js`: mobile menu, dropdown, scroll reveal, stat counters, stacked model cards, timeline progress

Images are loaded from Unsplash as placeholders. Replace the `src` attributes with your own photos before going live.
