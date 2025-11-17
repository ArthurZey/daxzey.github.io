<!-- .github/copilot-instructions.md -->
# Guidance for AI coding agents working on this repo

This repository is a small, mostly static website for "Baby Dax". The following notes surface the concrete, discoverable patterns and workflows an AI agent should follow to be productive immediately.

1. Big picture
- Purpose: a static site (HTML/CSS/JS) with a simple gallery and milestone content. Primary pages are `index.html` and `name.html`.
- Build/deploy: GitHub Actions builds and deploys via the workflow at `.github/workflows/jekyll.yml` using `bundle exec jekyll build` and the GitHub Pages deploy action. Pushing to `main` triggers a site build + deploy.

2. Project layout and important files
- Top-level pages: `index.html`, `name.html` — edit these for content changes.
- Assets: `assets/css/styles.css`, `assets/js/main.js`, `assets/images/` — UI and media live here. Images referenced use absolute `/assets/...` paths.
- CI/CD: `.github/workflows/jekyll.yml` — do not change deployment semantics without reviewing this file.

3. Key patterns & conventions (explicit, demonstrable examples)
- Scripts: `assets/js/main.js` relies on `data-` attributes to wire behavior:
  - Gallery filters: buttons have `data-gallery-filter="..."` and cards have `data-category="..."`. The filter toggles the `active` class on buttons and sets `style.display` on `.photo-card` elements.
  - Countdown: The script appends a `li` to `.timeline` with a `dueDate` hard-coded as `new Date('2026-01-07')`. If dates change, update here.
- CSS: `assets/css/styles.css` uses CSS variables in `:root` (colors, fonts, named variables like `--serif`, `--sans`) and component classes such as `.section`, `.highlight-card`, `.gallery-grid`, `.photo-card`, and `.button-link`.
- Paths: HTML uses absolute root paths (e.g., `/assets/css/styles.css`). When previewing locally with Jekyll, be mindful of `baseurl` or serve from site root to preserve these paths.

4. Local dev and build commands (what works with repo files)
- Quick preview (no Jekyll): open `index.html` in a browser to view static HTML/CSS/JS (images may resolve relative to filesystem root; prefer a small local server).
- With Jekyll (matches CI): this workflow uses Ruby + Bundler. If you have Ruby set up, run:
  - `bundle install` (installs gems from `Gemfile`)
  - `bundle exec jekyll serve --livereload` (serves locally; the CI uses `bundle exec jekyll build`)

5. Editing guidance (safe, minimal edits)
- Content edits: change `index.html` and `name.html` for copy and structure. Keep existing class names when modifying content to preserve styling and JS behavior.
- Add images to `assets/images/` and reference them with `/assets/images/<name>` in HTML.
- JS changes: preserve `data-gallery-filter`, `data-category`, and `.button-link.active` behavior unless intentionally refactoring both CSS and JS together.
- When changing the deployment flow, update `.github/workflows/jekyll.yml` and test locally with `bundle exec jekyll build`.

6. Things not present / tests
- There are no automated tests or linters configured in the repo. Changes should be manually validated by running the site locally and checking the deployed preview after pushing.

7. PR guidance for human reviewers
- Keep commits small and focused (content vs. style vs. behavior).
- For JS or CSS behavioral changes, include screenshots or a short recording and list which pages/components are affected (e.g., gallery filters, timeline countdown).

If anything above is unclear or you want this expanded (example PR templates, or additional notes on styling patterns), tell me which area to expand and I'll iterate.
