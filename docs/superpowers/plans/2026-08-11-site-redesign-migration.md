# Site Redesign Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate every page of `aryabhatta-labs.github.io` to the new-design visual
system on one shared CSS file, remove leftover Hugo build artifacts, and ship a real
favicon — while keeping GitHub Pages publishing (serves `main` branch root directly,
`build_type: "legacy"`) working exactly as it does today.

**Architecture:** Plain static HTML/CSS/JS, no build step. One shared stylesheet
(`/css/site.css`) and two small shared scripts (`/js/hero.js`, `/js/contact-form.js`)
are loaded by every page; nav/footer markup is duplicated per page (no templating
engine). Each page keeps its existing URL (`/`, `/about/`, `/contact/`, `/news/`,
`/privacy/`, `/security/`, `/terms/`, `/contact-us/`, `/404.html`).

**Tech Stack:** Static HTML5, CSS3 (custom properties), vanilla JS. Google Fonts CDN
(Jost, Roboto, Material Symbols Outlined). Forms POST to existing Formspree
endpoints — no backend changes.

## Global Constraints

- Preserve legal/news copy verbatim — no wording changes, only re-skinning.
- Contact form keeps action `https://formspree.io/f/xpzgrqqg`, field names `name`,
  `email`, `company`, `message`.
- Security form keeps action `https://formspree.io/f/xwleozep`, field names `name`,
  `email`, `affected`, `message`, and its exact prefilled Markdown template text.
- `contact-us/index.html`, `CNAME`, `robots.txt` are not modified.
- Every page links `/css/site.css` and gets the favicon `<link>` set (see Task 2).
- Every internal link uses root-relative paths (`/about/`, `/css/site.css`, etc.), not
  relative paths — this repo is served from domain root.
- Do not touch GitHub Pages settings; publishing must keep working via "push to
  `main`, served from `/`" with no GitHub Actions build.

---

### Task 1: Extract shared CSS and JS from the design handoff

**Files:**
- Create: `css/site.css`
- Create: `js/hero.js`
- Create: `js/contact-form.js`
- Read (source, do not modify): `new-design.zip` (already unzipped once at
  `/tmp/claude-1000/-home-prateek-PROJECTS-AryabhattaLabs-aryabhatta-labs-github-io/752580dc-272c-4988-b528-497923e0cbe9/scratchpad/new-design/design_handoff_website/index.html`
  and `contact.html` — if that scratch copy is gone, re-run
  `unzip -o new-design.zip -d /tmp/new-design-extract` from the repo root first)

**Interfaces:**
- Produces: CSS custom properties `--fg`, `--body`, `--muted`, `--line`, `--yellow`,
  `--dark`; utility classes `.wrap`, `.ms`, `.eyebrow`, `.label`, `.h1`, `.h2`, `.btn`,
  `.btn--filled`, `.btn--outline`, `.pill`, `.linkarrow`; layout classes `nav.top`,
  `.brand`, `.navlinks`, `.facts`, `.prodgrid`, `.card`, `.about`, `.aboutgrid`,
  `.lead`, `.pillars`, `.cta`, `footer`, `.fcols`, `.fcol-links`, `.fbottom`; form
  classes `.field`, `.two`, `.note`, `.ok`; new components `.hero-band`,
  `.hero-label`, `.legalprose`, `.article-list`, `.article`.
- Produces: `window`-scoped auto-invoked hero builder in `js/hero.js` (IIFE, same as
  handoff — no exported function, it just runs on load and expects an element
  `#board` to exist in the DOM).
- Produces: auto-invoked listener in `js/contact-form.js` that, on page load,
  attaches a `submit` handler to every `form[data-inline-success]` on the page: on
  submit it does **not** call `preventDefault()` (the browser still POSTs to
  Formspree/redirects per the form's own `action`), it only sets
  `#<form id>Note` (an element with id `<form-id>Note`, e.g. `contactFormNote`) to
  class `ok` and success text, keyed off a `data-success-text` attribute on the
  form. Wait — forms currently rely on `preventDefault` per the handoff. Keep that
  behavior exactly: copy the handoff's inline `<script>` submit handler logic
  verbatim into this shared file, generalized to work for any form with
  `id="$FORM_ID"` and a sibling note element `id="$FORM_IDNote"`, driven by a
  `data-success-text` attribute for the message.

- [ ] **Step 1: Create `css/site.css` from the homepage `<style>` block**

Copy the entire `<style>...</style>` block from
`design_handoff_website/index.html` (lines 12–87 in the zip) into `css/site.css`
as raw CSS (strip the `<style>` and `</style>` tags). This gives you the full token
set and every homepage component.

- [ ] **Step 2: Merge in the contact page's few extra rules**

`design_handoff_website/contact.html`'s `<style>` block (lines 12–50) is ~90%
identical to the homepage's. Diff it against what you just copied and append any
rules not already present — specifically: `.contact`, `.cgrid`, `.info`, `.info .row`,
`.info .row.top`, `.social`, `form` (background card), `.field`, `.field label`,
`.field input,.field textarea`, `.field input:focus,.field textarea:focus`, `.two`.
Do not duplicate rules that exist in both files with the same selector (e.g.
`nav.top`, `.brand`, `.navlinks`, `footer`, `.fcols`, `.fbottom`) — keep one copy.

- [ ] **Step 3: Add the `.hero-band` component (for About/News/Privacy/Security/Terms/404)**

Append to `css/site.css`:

```css
.hero-band{padding:64px 56px 40px;border-bottom:1px solid var(--line);background:#fff}
.hero-band .h1{font-size:44px;margin-top:16px}
.hero-band p.sub{font:400 18px/1.6 'Roboto',sans-serif;color:var(--body);max-width:640px;margin:20px 0 0}
.hero-band .meta{font:400 13px 'Roboto',sans-serif;color:var(--muted);margin-top:10px}
@media(max-width:900px){.hero-band .h1{font-size:34px}}
```

- [ ] **Step 4: Add the `.legalprose` component (for Privacy/Terms/Security)**

Append to `css/site.css`:

```css
.legalprose{padding:56px 56px 96px}
.legalprose .inner{max-width:720px;margin:0 auto}
.legalprose h2{font-family:'Jost',sans-serif;font-weight:800;font-size:22px;color:var(--fg);margin:40px 0 14px}
.legalprose .inner>h2:first-child{margin-top:0}
.legalprose p{font:400 16px/1.7 'Roboto',sans-serif;color:var(--body);margin:0 0 16px}
.legalprose ol{padding-left:20px;margin:0 0 16px}
.legalprose li{font:400 16px/1.7 'Roboto',sans-serif;color:var(--body);margin-bottom:6px}
.legalprose a{text-decoration:underline;text-decoration-color:#ccc}
.legalprose a:hover{text-decoration-color:#000}
```

- [ ] **Step 5: Add the `.article-list` component (for News)**

Append to `css/site.css`:

```css
.article-list{padding:16px 56px 96px}
.article-list .inner{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:40px}
.article-list .article{padding-bottom:32px;border-bottom:1px solid var(--line)}
.article-list .article:last-child{border-bottom:none}
.article-list .date{font:600 12px/1 'Roboto',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:10px;display:block}
.article-list .article h3{font-family:'Jost',sans-serif;font-weight:800;font-size:22px;color:var(--fg);margin:0 0 10px}
.article-list .article p{font:400 16px/1.7 'Roboto',sans-serif;color:var(--body);margin:0}
```

- [ ] **Step 6: Add form-field polish for the security report form**

The security form has a `textarea[rows=12]` with a long prefilled template — append:

```css
.legalprose form{background:#fafafa;border:1px solid var(--line);border-radius:8px;padding:32px;margin-top:28px;display:flex;flex-direction:column;gap:16px}
.legalprose form textarea{min-height:260px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px}
```

- [ ] **Step 7: Create `js/hero.js`**

Copy the IIFE from `design_handoff_website/index.html`'s inline `<script>` (the
whole `(function(){ ... })();` block, lines ~191–234 in the zip file, i.e.
everything from `var COLS=8, ROWS=4...` through the closing `})();`) verbatim into
`js/hero.js`. Do not copy the `document.getElementById('yr').textContent = ...`
line — that goes in a separate small inline script per-page (Task 3), since every
page needs it, not just the homepage.

- [ ] **Step 8: Create `js/contact-form.js`**

```javascript
document.querySelectorAll('form[data-inline-success]').forEach(function(form){
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var note = document.getElementById(form.id + 'Note');
    if (note) {
      note.className = 'ok';
      note.textContent = form.getAttribute('data-success-text');
    }
  });
});
```

- [ ] **Step 9: Commit**

```bash
git add css/site.css js/hero.js js/contact-form.js
git commit -m "Add shared site.css and hero/contact-form scripts for redesign"
```

---

### Task 2: Generate favicon assets and the web manifest

**Files:**
- Create: `images/ABLabs-logo.jpeg` (moved from repo root — see Task 10 for removing
  the old root copy once all pages reference the new path)
- Create: `favicon.ico`, `favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png`
- Create: `site.webmanifest`

**Interfaces:**
- Produces: `/favicon.ico`, `/favicon-32.png`, `/favicon-192.png`,
  `/apple-touch-icon.png`, `/site.webmanifest`, `/images/ABLabs-logo.jpeg` — every
  later task's `<head>` snippet (Task 3 onward) references these exact paths.

- [ ] **Step 1: Copy the logo into `/images/`**

```bash
mkdir -p images
git mv ABLabs-logo.jpeg images/ABLabs-logo.jpeg
```

- [ ] **Step 2: Generate a square, cropped source image**

The logo is 972×858 (not square). Crop to a centered square using ImageMagick
(install with `sudo dnf install ImageMagick` if `convert`/`magick` is missing):

```bash
magick images/ABLabs-logo.jpeg -gravity center -extent 858x858 /tmp/logo-square.png
```

- [ ] **Step 3: Generate the PNG favicons and apple touch icon**

```bash
magick /tmp/logo-square.png -resize 32x32 favicon-32.png
magick /tmp/logo-square.png -resize 192x192 favicon-192.png
magick /tmp/logo-square.png -resize 180x180 apple-touch-icon.png
```

- [ ] **Step 4: Generate the multi-size `.ico`**

```bash
magick /tmp/logo-square.png -define icon:auto-resize=16,32,48 favicon.ico
```

- [ ] **Step 5: Verify the generated files look correct**

```bash
file favicon.ico favicon-32.png favicon-192.png apple-touch-icon.png
```

Expected: `favicon.ico` reports "MS Windows icon resource" with sizes 16x16, 32x32,
48x48; the PNGs report their respective square dimensions. Open
`favicon-192.png` with an image viewer (or `Read` tool) to confirm the logo isn't
distorted/cropped oddly — recrop with a different `-gravity`/`-extent` value in
Step 2 if the logo's subject is off-center.

- [ ] **Step 6: Create `site.webmanifest`**

```json
{
  "name": "Aryabhatta Labs",
  "short_name": "Aryabhatta Labs",
  "icons": [
    { "src": "/favicon-32.png", "sizes": "32x32", "type": "image/png" },
    { "src": "/favicon-192.png", "sizes": "192x192", "type": "image/png" }
  ],
  "theme_color": "#1c1c1c",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

- [ ] **Step 7: Commit**

```bash
git add images/ABLabs-logo.jpeg favicon.ico favicon-32.png favicon-192.png apple-touch-icon.png site.webmanifest
git status
git commit -m "Add real favicon set and web manifest, move logo into /images/"
```

---

### Task 3: Migrate the homepage (`index.html`)

**Files:**
- Modify: `index.html` (full rewrite)
- Read (source): `design_handoff_website/index.html` (from the unzipped scratch
  copy, or re-unzip `new-design.zip` per Task 1)

**Interfaces:**
- Consumes: `css/site.css`, `js/hero.js` (Task 1), favicon files (Task 2).
- Produces: the canonical nav/footer markup that Tasks 4–9 copy verbatim into their
  own pages (same brand block, same `.navlinks`, same `.fcols` footer).

- [ ] **Step 1: Rewrite `index.html`**

Take `design_handoff_website/index.html` verbatim and apply these changes:
1. Replace the `<style>...</style>` block (lines 12–87) with:
   ```html
   <link rel="stylesheet" href="/css/site.css">
   ```
2. In `<head>`, after the manifest/font links, add the favicon block:
   ```html
   <link rel="icon" href="/favicon.ico" sizes="any">
   <link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32">
   <link rel="apple-touch-icon" href="/apple-touch-icon.png">
   <link rel="manifest" href="/site.webmanifest">
   ```
3. Replace every `src="/ABLabs-logo.jpeg"` with `src="/images/ABLabs-logo.jpeg"`
   (2 occurrences: nav brand, footer brand).
4. Replace the closing `<script>...</script>` block (lines 186–235): keep the
   `document.getElementById('yr').textContent = new Date().getFullYear();` line
   inline, but move the flip-board IIFE out to a script tag:
   ```html
   <script>
     document.getElementById('yr').textContent = new Date().getFullYear();
   </script>
   <script src="/js/hero.js"></script>
   ```

- [ ] **Step 2: Verify no leftover references**

```bash
grep -n "ABLabs-logo.jpeg\"" index.html   # expect 0 matches without /images/ prefix
grep -n "<style>" index.html               # expect 0 matches
```

- [ ] **Step 3: Serve locally and check in a browser**

```bash
python3 -m http.server 8000 --directory .
```

Open `http://localhost:8000/` — confirm: logo loads, favicon shows in the browser
tab, the flip-board hero animates/cycles, nav links scroll to `#products`/`#about`
and go to `/contact/`, footer links resolve. Stop the server (`Ctrl-C`) when done.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Migrate homepage to new design with shared CSS/JS and real favicon"
```

---

### Task 4: Migrate the contact page (`contact/index.html`)

**Files:**
- Modify: `contact/index.html` (full rewrite)
- Read (source): `design_handoff_website/contact.html`

**Interfaces:**
- Consumes: `css/site.css`, `js/contact-form.js` (Task 1), favicon files (Task 2),
  nav/footer pattern established in Task 3.
- Produces: none consumed by later tasks (contact is a leaf page).

- [ ] **Step 1: Rewrite `contact/index.html`**

Take `design_handoff_website/contact.html` verbatim and apply:
1. Replace the `<style>...</style>` block with `<link rel="stylesheet" href="/css/site.css">`.
2. Add the same favicon `<link>` block as Task 3 Step 1.2.
3. Replace `/ABLabs-logo.jpeg` with `/images/ABLabs-logo.jpeg` (2 occurrences).
4. Confirm the form tag reads exactly:
   ```html
   <form id="contactForm" action="https://formspree.io/f/xpzgrqqg" method="POST" data-inline-success data-success-text="Thanks — we'll respond within one business day.">
   ```
   (the handoff's form has no `action`/`method` — add them; keep field names
   `name`, `email`, `company`, `message` unchanged.)
5. Rename the note element from `<div class="note" id="formNote">...` to
   `<div class="note" id="contactFormNote">...` — `js/contact-form.js` (Task 1)
   looks up the note element as `document.getElementById(form.id + 'Note')`, so it
   must be `<form id>` + `Note`, i.e. `contactFormNote`.
6. Replace the closing `<script>` block:
   ```html
   <script>
     document.getElementById('yr').textContent = new Date().getFullYear();
   </script>
   <script src="/js/contact-form.js"></script>
   ```
   (remove the handoff's inline submit-handler `<script>` — `contact-form.js` now
   does that job generically.)

- [ ] **Step 2: Verify**

```bash
grep -n "ABLabs-logo.jpeg\"" contact/index.html   # expect 0 without /images/ prefix
grep -n "formspree.io/f/xpzgrqqg" contact/index.html   # expect 1 match
grep -n 'id="contactFormNote"' contact/index.html   # expect 1 match
```

- [ ] **Step 3: Serve locally and check in a browser**

```bash
python3 -m http.server 8000 --directory .
```

Open `http://localhost:8000/contact/` — confirm layout matches the handoff, favicon
shows, and submitting the form (with the network tab open) shows the note flip to
the green success message while a real POST fires to formspree.io. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add contact/index.html
git commit -m "Migrate contact page to new design with shared CSS and Formspree wiring"
```

---

### Task 5: Migrate the About page (`about/index.html`)

**Files:**
- Modify: `about/index.html` (full rewrite)
- Read (source content, do not modify): current `about/index.html` (existing copy:
  mission statement + 3 pillars — "Who We Are" / "What We Do" / "Our Values")

**Interfaces:**
- Consumes: `css/site.css`, favicon files, `.hero-band`/`.pillars` components
  (Task 1), nav/footer pattern (Task 3).

- [ ] **Step 1: Write `about/index.html`**

```html
<!doctype html>
<html lang="en-us">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>About Us | Aryabhatta Labs</title>
<meta name="description" content="Learn more about Aryabhatta Labs, our mission, and the team building AI-powered workflow products.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800;900&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0">
<link rel="stylesheet" href="/css/site.css">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
</head>
<body>

<nav class="top">
  <a class="brand" href="/"><img src="/images/ABLabs-logo.jpeg" alt="Aryabhatta Labs"><span>Aryabhatta Labs</span></a>
  <div class="navlinks">
    <a href="/#products">Products</a>
    <a href="/about/" style="color:var(--fg)">About</a>
    <a href="/contact/">Contact</a>
    <a href="/contact/" class="btn btn--filled">Request a demo</a>
  </div>
</nav>

<div class="hero-band">
  <div class="label">About us</div>
  <h1 class="h1">Leave the boring stuff to the machines<span style="color:var(--yellow)">.</span></h1>
  <p class="sub">Aryabhatta Labs is a technology startup focused on building AI-powered workflow applications that help professionals and companies succeed. We believe the boring, repetitive work should be handled by software and AI, freeing people to focus on more creative and meaningful endeavours.</p>
</div>

<section>
  <div class="pillars" style="border-top:none;padding-top:0">
    <div><span class="ms">groups</span><b>Who We Are</b><p>A small, focused team of engineers and product builders based in Oakville, Ontario, working with clients and building our own products across AI, automation, and enterprise software.</p></div>
    <div><span class="ms">insights</span><b>What We Do</b><p>We consult on and build AI-enabled products &mdash; from expense and mileage tracking to LLM experimentation platforms &mdash; for teams that want to move fast without compromising on quality.</p></div>
    <div><span class="ms">handshake</span><b>Our Values</b><p>Velocity without sacrificing quality, transparency with our customers, and a genuine curiosity about how AI can make everyday work simpler.</p></div>
  </div>
</section>

<footer>
  <div class="fcols">
    <div>
      <div class="brand" style="margin-bottom:16px"><img src="/images/ABLabs-logo.jpeg" alt="" style="width:30px;height:30px"><span style="font-size:15px">Aryabhatta Labs</span></div>
      <p>AI-powered workflow applications. Making our world smarter, everyday.</p>
    </div>
    <div><h4>Products</h4><div class="fcol-links"><a href="https://expenseflow.github.io">ExpenseFlow</a><a href="https://podiumpage.io">Podium</a></div></div>
    <div><h4>Company</h4><div class="fcol-links"><a href="/about/">About</a><a href="/news/">News</a><a href="/contact/">Contact</a><a href="https://aryabhattalabs.com/">aryabhattalabs.com</a></div></div>
    <div><h4>Legal</h4><div class="fcol-links"><a href="/privacy/">Privacy Policy</a><a href="/terms/">Terms of Use</a><a href="/security/">Security</a></div></div>
  </div>
  <div class="fbottom">
    <span>&copy; <span id="yr"></span> Aryabhatta Labs. All rights reserved.</span>
    <span>Made with <span style="color:#e0245e">&#10084;&#65039;</span> in Canada.</span>
  </div>
</footer>

<script>
  document.getElementById('yr').textContent = new Date().getFullYear();
</script>
</body>
</html>
```

- [ ] **Step 2: Verify copy matches the original exactly**

```bash
git show HEAD:about/index.html | grep -oE "Aryabhatta Labs is a technology startup[^<]*"
```

Compare the output text against the paragraph you wrote in Step 1 — they must be
character-for-character identical (the mission paragraph in the current live page).

- [ ] **Step 3: Serve locally and check in a browser**

```bash
python3 -m http.server 8000 --directory .
```

Open `http://localhost:8000/about/` — confirm hero band, three pillars with icons,
nav, and footer all render correctly and match the site's visual language.

- [ ] **Step 4: Commit**

```bash
git add about/index.html
git commit -m "Migrate About page to new design"
```

---

### Task 6: Migrate the News page (`news/index.html`)

**Files:**
- Modify: `news/index.html` (full rewrite)
- Read (source content): current `news/index.html` (3 articles: "ExpenseFlow
  launches" Aug 11 2026, "Introducing Lang Flair" Jun 2 2026, "Aryabhatta Labs
  welcomes new consulting clients" Mar 14 2026)

**Interfaces:**
- Consumes: `css/site.css`, favicon files, `.hero-band`/`.article-list` components
  (Task 1), nav/footer pattern (Task 3).

- [ ] **Step 1: Write `news/index.html`**

Use the same `<head>`/nav/footer/script structure as Task 5 Step 1, with
`<title>News & Articles | Aryabhatta Labs</title>`,
`<meta name="description" content="Product updates, announcements, and articles from Aryabhatta Labs.">`,
and the nav's About link reverted to plain (`<a href="/about/">About</a>`) since
News is the active page (no `style="color:var(--fg)"` override needed there — that
belongs on `/about/`'s own About link only). Body:

```html
<div class="hero-band">
  <div class="label">News</div>
  <h1 class="h1">News &amp; Articles<span style="color:var(--yellow)">.</span></h1>
  <p class="sub">Product updates and announcements from Aryabhatta Labs.</p>
</div>

<div class="article-list">
  <div class="inner">
    <article class="article">
      <span class="date">August 11, 2026</span>
      <h3>ExpenseFlow launches</h3>
      <p>We shipped ExpenseFlow, our CRA-compliant mileage &amp; expense tracking app &mdash; every trip auto-logged by GPS, every receipt captured by camera. Read more about it on the <a href="https://expenseflow.github.io" class="linkarrow">ExpenseFlow site</a>.</p>
    </article>
    <article class="article">
      <span class="date">June 2, 2026</span>
      <h3>Introducing Lang Flair</h3>
      <p>Lang Flair, our LLM experimentation platform for product and engineering teams, is now in early access. It helps teams iterate on prompts and evaluate model behaviour without slowing down shipping.</p>
    </article>
    <article class="article">
      <span class="date">March 14, 2026</span>
      <h3>Aryabhatta Labs welcomes new consulting clients</h3>
      <p>We&rsquo;re growing our consulting practice, helping companies integrate AI and automation into their existing workflows. Get in touch via our <a href="/contact/" class="linkarrow">contact page</a> if you&rsquo;d like to work with us.</p>
    </article>
  </div>
</div>
```

- [ ] **Step 2: Verify all three articles carried over verbatim**

```bash
git show HEAD:news/index.html | grep -oE "<h3>[^<]*"
```

Expected output: `<h3>ExpenseFlow launches`, `<h3>Introducing Lang Flair`,
`<h3>Aryabhatta Labs welcomes new consulting clients` — confirm your new file has
the same three headings in the same order.

- [ ] **Step 3: Serve locally and check in a browser**

```bash
python3 -m http.server 8000 --directory .
```

Open `http://localhost:8000/news/` — confirm all 3 articles render with dates,
titles, and body copy, and the two inline links (`ExpenseFlow site`,
`contact page`) work.

- [ ] **Step 4: Commit**

```bash
git add news/index.html
git commit -m "Migrate News page to new design"
```

---

### Task 7: Migrate the Privacy Policy page (`privacy/index.html`)

**Files:**
- Modify: `privacy/index.html` (full rewrite)
- Read (source content, do not modify): current `privacy/index.html` body content
  between `<div class="nested-copy-line-height...">` and the closing `</div>`
  before `</article>` — this is the full policy text that must carry over verbatim.

**Interfaces:**
- Consumes: `css/site.css`, favicon files, `.hero-band`/`.legalprose` components
  (Task 1), nav/footer pattern (Task 3).

- [ ] **Step 1: Extract the existing policy body verbatim**

```bash
python3 - <<'EOF'
import re
html = open('privacy/index.html').read()
start = html.index('<div class="nested-copy-line-height')
start = html.index('>', start) + 1
end = html.index('</div>\n    </article>')
print(html[start:end])
EOF
```

Save this output — it's the exact HTML (headings as `<ol><li>Section Name</li></ol>`
followed by `<p>` paragraphs) you'll drop into the new `.legalprose` wrapper. Do not
alter a single word of it.

- [ ] **Step 2: Write `privacy/index.html`**

Use the same `<head>`/nav/footer/script structure as Task 5 Step 1, with
`<title>Privacy Policy | Aryabhatta Labs</title>` and the original page's
`<meta name="description">` (copy it from the current file, it's the CSA/PIPEDA
description). Body:

```html
<div class="hero-band">
  <div class="label">Legal</div>
  <h1 class="h1">Privacy Policy</h1>
  <p class="meta">Last Updated: 2025-08-13</p>
</div>

<div class="legalprose">
  <div class="inner">
    <!-- paste the exact HTML captured in Step 1 here, unmodified -->
  </div>
</div>
```

Convert each `<ol start="N"><li>Section Name</li></ol>` pair from the captured
content into `<h2>Section Name</h2>` (drop the numbered-list wrapper — the
`.legalprose h2` styling already gives it visual weight; the section order is
unchanged so numbering is still implicit) — the `<p>` paragraphs underneath are
pasted through unchanged.

- [ ] **Step 3: Verify word-for-word fidelity**

```bash
git show HEAD:privacy/index.html | sed -n '/nested-copy-line-height/,/<\/article>/p' | sed -E 's/<[^>]+>//g' | tr -s ' \n' ' ' > /tmp/privacy-old.txt
sed -n '/legalprose/,/<\/body>/p' privacy/index.html | sed -E 's/<[^>]+>//g' | tr -s ' \n' ' ' > /tmp/privacy-new.txt
diff /tmp/privacy-old.txt /tmp/privacy-new.txt
```

Expected: no output (or only whitespace-driven differences from the heading
markup change in Step 2 — read the diff and confirm every difference is a heading
label reformat, not a wording change).

- [ ] **Step 4: Serve locally and check in a browser**

```bash
python3 -m http.server 8000 --directory .
```

Open `http://localhost:8000/privacy/` — confirm the policy reads cleanly with
proper heading hierarchy and reading-width column.

- [ ] **Step 5: Commit**

```bash
git add privacy/index.html
git commit -m "Migrate Privacy Policy page to new design"
```

---

### Task 8: Migrate the Terms of Use page (`terms/index.html`)

**Files:**
- Modify: `terms/index.html` (full rewrite)
- Read (source content, do not modify): current `terms/index.html` body content,
  same extraction shape as Task 7.

**Interfaces:**
- Consumes: same as Task 7.

- [ ] **Step 1: Extract the existing terms body verbatim**

```bash
python3 - <<'EOF'
import re
html = open('terms/index.html').read()
start = html.index('<div class="nested-copy-line-height')
start = html.index('>', start) + 1
end = html.index('</div>\n    </article>')
print(html[start:end])
EOF
```

- [ ] **Step 2: Write `terms/index.html`**

Same structure as Task 7 Step 2, with `<title>Terms of Use | Aryabhatta Labs</title>`,
hero band `<h1 class="h1">Terms of Use for Aryabhatta Labs Products</h1>` /
`<p class="meta">Last Updated: 2025-08-14</p>`, and the extracted body converted the
same way (`<ol start="N"><li>Section</li></ol>` → `<h2>Section</h2>`, paragraphs
unchanged).

- [ ] **Step 3: Verify word-for-word fidelity**

```bash
git show HEAD:terms/index.html | sed -n '/nested-copy-line-height/,/<\/article>/p' | sed -E 's/<[^>]+>//g' | tr -s ' \n' ' ' > /tmp/terms-old.txt
sed -n '/legalprose/,/<\/body>/p' terms/index.html | sed -E 's/<[^>]+>//g' | tr -s ' \n' ' ' > /tmp/terms-new.txt
diff /tmp/terms-old.txt /tmp/terms-new.txt
```

Expected: only heading-format differences, no wording changes.

- [ ] **Step 4: Serve locally and check in a browser**

```bash
python3 -m http.server 8000 --directory .
```

Open `http://localhost:8000/terms/` and read through it.

- [ ] **Step 5: Commit**

```bash
git add terms/index.html
git commit -m "Migrate Terms of Use page to new design"
```

---

### Task 9: Migrate the Security & Responsible Disclosure page (`security/index.html`)

**Files:**
- Modify: `security/index.html` (full rewrite)
- Read (source content, do not modify): current `security/index.html` policy body
  AND the `<form id="report-form">...</form>` block (fields, Formspree action,
  prefilled textarea template) — both must carry over exactly.

**Interfaces:**
- Consumes: `css/site.css`, favicon files, `.hero-band`/`.legalprose` components
  (Task 1), nav/footer pattern (Task 3). Form does **not** use
  `js/contact-form.js`/`data-inline-success` — it's a real cross-origin POST to
  Formspree with the browser doing a normal navigation/redirect on submit, matching
  today's behavior exactly (today's security form has no JS handler at all).

- [ ] **Step 1: Extract the existing security body and form verbatim**

```bash
python3 - <<'EOF'
html = open('security/index.html').read()
start = html.index('<div class="nested-copy-line-height')
start = html.index('>', start) + 1
end = html.index('</div>\n    </article>')
print(html[start:end])
EOF
```

This capture includes both the numbered-policy prose AND the `<form
method="post" ... id="report-form">` block at the end — keep the `<form>` exactly
as captured (same `action`, `name` attributes, `id` attributes, and the full
prefilled Markdown template inside the `<textarea>`).

- [ ] **Step 2: Write `security/index.html`**

Same structure as Task 7 Step 2, with
`<title>Security | Aryabhatta Labs</title>`, the original page's
`<meta name="description">` (vulnerability-reporting description from the current
file), hero band `<h1 class="h1">Security &amp; Responsible Disclosure Policy</h1>`
/ `<p class="meta">Last Updated: 2026-08-11</p>`. Body:

```html
<div class="legalprose">
  <div class="inner">
    <!-- paste the exact HTML captured in Step 1 here, unmodified, including the
         numbered sections converted to <h2> exactly as in Tasks 7/8, AND the
         <form id="report-form" ...>...</form> block unchanged -->
    <!-- add a class to the button so it uses the shared button styling: -->
    <!-- change: <button class="tulip-btn tulip-btn--filled" type="submit"> -->
    <!-- to:     <button class="btn btn--filled" type="submit"> -->
    <!-- also replace each field's classes: -->
    <!-- change: <input class="pa2 input-reset ba bg-transparent w-100" ...> -->
    <!-- to:     <input ...> (drop the class attribute entirely — .legalprose form input/textarea are styled by tag selector, see Task 1 Step 6) -->
  </div>
</div>
```

- [ ] **Step 3: Verify the form fields and Formspree endpoint are unchanged**

```bash
grep -oE 'action="[^"]*"|name="[^"]*"|id="report-form"' security/index.html
```

Expected: `action="https://formspree.io/f/xwleozep"`, and `name="name"`,
`name="_subject"`, `name="email"`, `name="affected"`, `name="message"` (exact set,
same order is fine to differ but every name must be present).

- [ ] **Step 4: Verify the policy prose is word-for-word unchanged**

```bash
git show HEAD:security/index.html | sed -n '/nested-copy-line-height/,/<form/p' | sed -E 's/<[^>]+>//g' | tr -s ' \n' ' ' > /tmp/security-old.txt
sed -n '/legalprose/,/<form/p' security/index.html | sed -E 's/<[^>]+>//g' | tr -s ' \n' ' ' > /tmp/security-new.txt
diff /tmp/security-old.txt /tmp/security-new.txt
```

Expected: only heading-format differences.

- [ ] **Step 5: Serve locally and check in a browser**

```bash
python3 -m http.server 8000 --directory .
```

Open `http://localhost:8000/security/` — confirm the policy prose reads correctly,
the form renders with the prefilled Markdown template intact in the textarea, and
all fields are styled consistently with the rest of the site (do **not** actually
submit it against the live Formspree endpoint during local testing).

- [ ] **Step 6: Commit**

```bash
git add security/index.html
git commit -m "Migrate Security & Responsible Disclosure page to new design"
```

---

### Task 10: Migrate the 404 page and add favicon links to it

**Files:**
- Modify: `404.html` (full rewrite)

**Interfaces:**
- Consumes: `css/site.css`, favicon files (Task 2), nav pattern (Task 3, minus the
  sticky/anchor links since this is an error page with no in-page sections).

- [ ] **Step 1: Write `404.html`**

```html
<!doctype html>
<html lang="en-us">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page Not Found | Aryabhatta Labs</title>
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800;900&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/site.css">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
</head>
<body>

<nav class="top">
  <a class="brand" href="/"><img src="/images/ABLabs-logo.jpeg" alt="Aryabhatta Labs"><span>Aryabhatta Labs</span></a>
</nav>

<div style="padding:120px 56px;text-align:center">
  <div class="label" style="margin-bottom:16px">404</div>
  <h1 class="h1" style="font-size:44px">Page not found<span style="color:var(--yellow)">.</span></h1>
  <p style="font:400 18px/1.6 'Roboto',sans-serif;color:var(--body);margin:20px auto 34px;max-width:440px">
    The page you're looking for doesn't exist or has moved.
  </p>
  <a href="/" class="btn btn--filled">Back to homepage</a>
</div>

</body>
</html>
```

- [ ] **Step 2: Serve locally and check in a browser**

```bash
python3 -m http.server 8000 --directory .
```

Open `http://localhost:8000/404.html` directly — confirm it renders with the shared
theme and the "Back to homepage" button works.

- [ ] **Step 3: Commit**

```bash
git add 404.html
git commit -m "Migrate 404 page to new design"
```

---

### Task 11: Remove Hugo leftovers and unused assets

**Files:**
- Delete: `ananke/`, `tpl-assets/`, `.gitmodules`, `.hugo_build.lock`, `home/`,
  `index.xml`, `.github/workflows/hugo.yml`
- Delete: `images/aurora.jpg`, `images/aurora.png`, `images/esmeralda.jpg`,
  `images/notebook.jpg`, `images/app-img.jpg`,
  `images/gohugo-default-sample-hero-image.jpg`
- Modify: `sitemap.xml`

**Interfaces:**
- Consumes: nothing (cleanup-only task). Run this **after** Tasks 3–10 so grepping
  for lingering references to deleted assets has something meaningful to check
  against.

- [ ] **Step 1: Confirm nothing still references what you're about to delete**

```bash
grep -rl "tpl-assets\|/ananke/\|aurora\|esmeralda\|notebook.jpg\|app-img\|gohugo-default" --include=*.html --include=*.css --include=*.js . 2>/dev/null
```

Expected: no output. If anything prints, fix that file before deleting (you missed
a reference in an earlier task).

- [ ] **Step 2: Delete the Hugo artifacts**

```bash
git rm -r ananke tpl-assets home .hugo_build.lock .gitmodules index.xml
git rm .github/workflows/hugo.yml
```

- [ ] **Step 3: Delete the unused sample images**

```bash
git rm images/aurora.jpg images/aurora.png images/esmeralda.jpg images/notebook.jpg images/app-img.jpg images/gohugo-default-sample-hero-image.jpg
```

- [ ] **Step 4: Update `sitemap.xml` to list only real pages**

Replace the contents of `sitemap.xml` with:

```xml
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://aryabhatta.ca/</loc></url>
  <url><loc>https://aryabhatta.ca/about/</loc></url>
  <url><loc>https://aryabhatta.ca/contact/</loc></url>
  <url><loc>https://aryabhatta.ca/news/</loc></url>
  <url><loc>https://aryabhatta.ca/privacy/</loc></url>
  <url><loc>https://aryabhatta.ca/security/</loc></url>
  <url><loc>https://aryabhatta.ca/terms/</loc></url>
</urlset>
```

- [ ] **Step 5: Verify the working tree is clean of Hugo artifacts**

```bash
git status
find . -iname "*.hugo*" -o -iname "ananke" -o -iname "tpl-assets" -not -path "./.git/*"
```

Expected: `find` prints nothing.

- [ ] **Step 6: Commit**

```bash
git add sitemap.xml
git commit -m "Remove leftover Hugo build artifacts and unused sample images"
```

---

### Task 12: Full-site verification and Pages publishing sanity check

**Files:** none created/modified — verification only.

**Interfaces:** none.

- [ ] **Step 1: Check every internal link resolves to a real file**

```bash
python3 - <<'EOF'
import re, os, glob

pages = glob.glob('**/*.html', recursive=True)
pages = [p for p in pages if not p.startswith('.git')]
missing = []
for page in pages:
    html = open(page, encoding='utf-8').read()
    for m in re.finditer(r'(?:href|src)="(/[^"]+)"', html):
        path = m.group(1).split('#')[0]
        if not path or path.startswith('//') or path.startswith('/http'):
            continue
        local = path.lstrip('/')
        if local.endswith('/'):
            local += 'index.html'
        if local and not os.path.exists(local):
            missing.append((page, path))

if missing:
    for page, path in missing:
        print(f"{page}: broken reference to {path}")
else:
    print("All internal references resolve.")
EOF
```

Expected: `All internal references resolve.` Fix any reported broken paths by
correcting the offending task's file before moving on.

- [ ] **Step 2: Confirm every page links the shared stylesheet and favicon**

```bash
for f in index.html about/index.html contact/index.html news/index.html privacy/index.html security/index.html terms/index.html 404.html; do
  echo "== $f =="
  grep -c 'css/site.css' "$f"
  grep -c 'favicon.ico' "$f"
done
```

Expected: every file reports `1` for both greps.

- [ ] **Step 3: Serve the whole site locally and click through it end-to-end**

```bash
python3 -m http.server 8000 --directory .
```

Visit `http://localhost:8000/` and click through: Home → Products anchor → About
anchor → Contact (nav + footer + CTA) → News → Privacy → Terms → Security →
back Home. Confirm the favicon appears in the browser tab on every page and no
page shows a broken image icon (logo) anywhere. Stop the server when done.

- [ ] **Step 4: Re-confirm GitHub Pages publishing is untouched**

```bash
gh api repos/aryabhatta-labs/aryabhatta-labs.github.io/pages
```

Expected: same as before this migration — `"build_type":"legacy"`,
`"source":{"branch":"main","path":"/"}`. This confirms deleting
`.github/workflows/hugo.yml` in Task 11 did not change how the site is published;
Pages still serves whatever is committed to `main` at `/` directly, and every file
this plan produces sits in that same tree.

- [ ] **Step 5: Push and watch Pages redeploy (only if the user asks you to push)**

Do not push automatically. Once the user confirms they want this live, run:

```bash
git push origin main
```

Then, a minute or two later, confirm `https://aryabhatta.ca/` serves the new
homepage (e.g. via `curl -s https://aryabhatta.ca/ | grep -o '<title>[^<]*'`).
