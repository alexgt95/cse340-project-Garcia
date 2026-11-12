# WDD-231 — Group Project

Portfolio site for **Jhovanna's Hair Salon** (demo), built for WDD-231.

## Authors

- Jorge Gonzales
- Alejandro Garcia Trujillo

## Hair Salon site

The live demo lives in the [`hair-salon/`](hair-salon/) folder.

### Run locally

Static assets and JSON data must be served over **HTTP** (not `file://`) so `fetch()` can load `data/services.json`.

```bash
npx serve hair-salon
```

Then open the URL shown in the terminal (usually `http://localhost:3000`).

### Tech stack

- Semantic HTML5
- CSS (custom properties, responsive layout, partials)
- Vanilla JavaScript (ES modules)
- [Flatpickr](https://flatpickr.js.org/) for appointment date/time (booking page)
- `localStorage` for demo booking drafts and confirmed appointments

### GitHub Pages

If published from this repo, the site URL is typically:

`https://adwords711-commits.github.io/WDD-231---Group-Project/hair-salon/`

Confirm the exact URL in your repository **Settings → Pages** if your branch or folder differs (this repo’s remote is `adwords711-commits/WDD-231---Group-Project`).
