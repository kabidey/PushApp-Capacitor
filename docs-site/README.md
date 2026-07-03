# PushApp Ionic SDK — HTML documentation

Static documentation shell for the Ionic/Capacitor SDK (`pushapp-ionic`).

## Live URL (primary)

**https://docs.mehery.com/guide/pushapp/ionic-sdk/**

Hosted on the [MeherY documentation](https://docs.mehery.com/guide/pushapp/) site. Content is loaded from this repository via GitHub raw URLs — edit markdown in the repo and refresh the site.

## View locally

From the **repository root**:

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080/docs-site/](http://localhost:8080/docs-site/) — markdown is loaded from disk first, then falls back to GitHub raw.

## Deploy to MeherY docs

Copy this folder to `mehery-soccom.github.io/guide/pushapp/ionic-sdk/` (keep `.nojekyll`). Update `index.html` footer to use `../` for PushApp docs link (see the deployed copy in that repo).

## Structure

| Path | Purpose |
|------|---------|
| `index.html` | Shell, sidebar, CDN scripts |
| `css/docs.css` | PushApp theme (shared with Flutter SDK docs) |
| `js/docs.js` | Markdown fetch, routing, syntax highlight |
| `assets/pushapp-logo.png` | Brand logo |
| `.nojekyll` | Disable Jekyll on GitHub Pages |

Content sources in the SDK repo:

| File | Doc section |
|------|-------------|
| `README.md` | Quick checklist |
| `docs/Integration-Guide.md` | Setup, implementation, placements, checklist, troubleshooting |
| `docs/api-reference.md` | API reference |
| `docs/QA-Test-Plan.md` | QA test plan |
| `CHANGELOG.md` | Changelog |
