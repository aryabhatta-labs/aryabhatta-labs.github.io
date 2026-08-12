# Site redesign migration — design spec

Date: 2026-08-11

## Goal

Migrate `aryabhatta-labs.github.io` from its current leftover-Hugo state to a pure
static site using the new visual design supplied in `new-design.zip`
(`design_handoff_website/index.html`, `contact.html`), applied consistently across
every existing page, with a shared CSS file instead of per-page embedded styles, and
a working favicon.

## Current state (as found)

- The repo is nominally a Hugo project (`.gitmodules` referencing the `ananke` theme
  submodule, `.hugo_build.lock`) but has **no** `content/`, `layouts/`, or Hugo config
  file — it is only committed *generated output*.
- Two different generated-output "eras" coexist:
  - `index.html`, `home/index.html`, `about/`, `news/`, `contact/` use a
    Bootstrap-based "Tulip" theme (`tpl-assets/css/*`, jQuery/owl-carousel/slick JS).
  - `privacy/`, `security/`, `terms/`, `404.html` use the Hugo Ananke theme
    (`ananke/css/main.min.css`, Tachyons utility classes).
- `.github/workflows/hugo.yml` was just added and runs `hugo --minify` against a repo
  with no Hugo source — it would fail if it ever ran, and per
  `gh api repos/aryabhatta-labs/aryabhatta-labs.github.io/pages` it never has (zero
  workflow runs). GitHub Pages is configured with `build_type: "legacy"`,
  `source: {branch: "main", path: "/"}` — it serves committed static files from
  `main` directly and does **not** use GitHub Actions builds. So deleting the
  workflow is safe and does not affect publishing; publishing remains "push HTML to
  `main`," which the target file layout satisfies as-is.
- Favicon: `tpl-assets/img/favicon.ico` exists but `site.webmanifest` is referenced
  (`<link rel="manifest" href="/site.webmanifest">`) and does not exist — a dead link
  on every page.
- Unused leftover images: `aurora.jpg/png`, `esmeralda.jpg`, `notebook.jpg`,
  `app-img.jpg`, `gohugo-default-sample-hero-image.jpg` — not referenced by any page.
- `contact-us/index.html` is a working meta-refresh redirect to `/contact/` — keep as is.
- Contact form (`contact/index.html`) posts to Formspree `https://formspree.io/f/xpzgrqqg`.
- Security page's vulnerability report form posts to Formspree
  `https://formspree.io/f/xwleozep`, with a prefilled Markdown template in the textarea.
  Both are real, working backends — must be preserved exactly (same field names, same
  endpoints).
- News, Privacy, Terms content is real copy (legal text, changelog entries) that must
  carry over verbatim, only re-skinned.

## Target state

### File layout

```
/css/site.css              shared theme: CSS custom properties, typography, nav,
                            footer, buttons, cards, form fields, legal-prose,
                            article-list components
/js/hero.js                homepage flip-board hero script (extracted from
                            new-design's inline <script>)
/js/contact-form.js         shared "prevent default -> show inline success note"
                            behavior for the contact form and the security report
                            form (cosmetic only; forms still POST to Formspree)
/images/ABLabs-logo.jpeg    (moved from repo root)
/favicon.ico
/favicon-32.png
/favicon-192.png
/apple-touch-icon.png
/site.webmanifest
index.html                 homepage
about/index.html
contact/index.html
contact-us/index.html      unchanged (redirect)
news/index.html
privacy/index.html
security/index.html
terms/index.html
404.html
CNAME, robots.txt          unchanged
sitemap.xml                regenerated to list only real pages
```

Removed entirely: `ananke/`, `tpl-assets/`, `.gitmodules`, `.hugo_build.lock`,
`home/`, `index.xml`, `.github/workflows/hugo.yml`, the unused sample images listed
above, and `ABLabs-logo.jpeg` at repo root (moved to `/images/`, all references
updated).

### Shared CSS (`/css/site.css`)

Single stylesheet, loaded by every page. Built by:
1. Taking the `<style>` block from `design_handoff_website/index.html` and
   `contact.html` (near-identical) as the base — tokens (`--fg`, `--body`, `--muted`,
   `--line`, `--yellow`, `--dark`), Jost/Roboto type scale, `.btn`, `.pill`,
   `.linkarrow`, `nav.top`, `.facts`, `.prodgrid`/`.card`, `.about`/`.pillars`,
   `.cta`, `footer`/`.fcols`, form `.field` styles.
2. Adding new components needed for pages the handoff didn't cover, using the same
   tokens:
   - `.hero-band` / `.hero-label` — generic page-header band (label + H1 + optional
     sub-line), used by About, News, Privacy, Security, Terms, 404 in place of the
     homepage's flip-board hero.
   - `.legalprose` — reading-column typography for numbered legal sections
     (headings, ordered lists, paragraphs), max-width ~720px, Roboto body copy.
   - `.article-list` / `.article` — News page entries (date label, title, body),
     reusing `.label`/`.h2`/body-copy sizes.
3. Fonts stay on the Google Fonts CDN (Jost, Roboto, Material Symbols Outlined),
   matching the handoff and the current site's existing approach.

### Shared JS

- `/js/hero.js`: the homepage flip-board builder/cycler, verbatim logic from the
  handoff's inline `<script>`, loaded only by `index.html`.
- `/js/contact-form.js`: attaches to any `<form data-inline-success>` on the page,
  intercepts submit only to swap in the "thanks" message the same way the handoff's
  contact form does today — does **not** prevent the actual POST to Formspree.

### Page-by-page migration

- **Home** (`index.html`) — handoff `index.html` verbatim, CSS/JS externalized,
  paths updated to `/css/site.css`, `/js/hero.js`, `/images/ABLabs-logo.jpeg`.
- **Contact** (`contact/index.html`) — handoff `contact.html` verbatim, same
  externalization, form action unchanged (`xpzgrqqg`).
- **About** (`about/index.html`) — nav + `.hero-band` ("About Us" / "Making our
  world smarter, everyday.") + the existing three pillars (Who we are / What we do /
  Our values) ported into the homepage's `.pillars` component, copy unchanged +
  footer.
- **News** (`news/index.html`) — nav + `.hero-band` ("News & Articles" / existing
  sub-line) + `.article-list` with the three existing entries (dates, titles, bodies,
  links) unchanged + footer.
- **Privacy** (`privacy/index.html`) — nav + `.hero-band` ("Privacy Policy",
  "Last Updated: 2025-08-13") + `.legalprose` containing the existing policy text
  verbatim + footer.
- **Terms** (`terms/index.html`) — same pattern, "Terms of Use for Aryabhatta Labs
  Products", "Last Updated: 2025-08-14", existing text verbatim.
- **Security** (`security/index.html`) — same pattern, "Security & Responsible
  Disclosure Policy", "Last Updated: 2026-08-11", existing policy text verbatim,
  plus the vulnerability report form restyled with the shared `.field`/`.btn`
  components — same field names (`name`, `email`, `affected`, `message`), same
  Formspree action (`xwleozep`), same prefilled Markdown template.
- **404** (`404.html`) — nav (no sticky, no products/about anchors since it's an
  error page) + centered "Page not found" message + link to `/`, in the shared
  visual language.
- **contact-us/index.html** — unchanged.

### Favicon

Generate from `/images/ABLabs-logo.jpeg`: crop to square, produce:
- `favicon.ico` (multi-size 16/32/48)
- `favicon-32.png`, `favicon-192.png`
- `apple-touch-icon.png` (180×180)
- `site.webmanifest` referencing the real PNG icons (fixes today's dead
  `/site.webmanifest` link)

Every page's `<head>` gets:
```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

### Out of scope

- No CMS/templating engine introduced — nav/footer markup is duplicated per page
  (consistent with "pure static site" direction; a future pass could add a tiny
  include step if drift becomes painful).
- No content changes to legal text, news entries, or contact info beyond what's
  needed to fit the new markup.
- Product screenshots for the homepage cards remain placeholder `.shot` boxes (no
  real screenshots supplied).
