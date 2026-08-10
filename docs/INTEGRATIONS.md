# Third-party integrations

Every external service the site talks to, where its key/ID lives, whether that
value is safe to be public, and how to change it.

> **Golden rule:** this is a static site — **everything in the HTML/JS ships to
> the browser and is publicly visible.** So the only keys that belong here are
> ones designed to be public (submission keys, widget IDs, measurement IDs).
> The **only** genuinely secret credentials (Zabbix login) must live in CI
> secrets, never in the repo.

- [At a glance](#at-a-glance)
- [Google Analytics 4](#google-analytics-4)
- [Cloudflare Worker + Zoho Mail (contact and careers forms)](#cloudflare-worker--zoho-mail-contact-and-careers-forms)
- [JotForm (e-book capture)](#jotform-e-book-capture)
- [RSS2JSON + CORS proxies (blog feed)](#rss2json--cors-proxies-blog-feed)
- [Tidio AI chatbot](#tidio-ai-chatbot)
- [Zabbix API (stats pipeline)](#zabbix-api-stats-pipeline)
- [Google Fonts & Font Awesome](#google-fonts--font-awesome)
- [`landing.html` form (legacy — not migrated)](#landinghtml-form-legacy--not-migrated)

---

## At a glance

| Service | Purpose | Identifier lives in | Public? |
|---------|---------|---------------------|:---:|
| Google Analytics 4 | Traffic analytics | `G-YDBB1PYYCM` in each page `<head>` | ✅ public by design |
| Cloudflare Worker + Zoho Mail | Contact form → e-mail (`/api/contact`) | `worker/index.js` + `worker/lib/`; credentials in Worker secrets | 🔒 credentials secret, endpoint path is public |
| Cloudflare Worker + Zoho Mail | Careers form → e-mail (`/api/careers`) | same Worker, `CAREERS_TO_EMAIL` secret | 🔒 credentials secret, endpoint path is public |
| Cloudflare Turnstile | Bot protection on both forms | site key in HTML (public), secret key in `TURNSTILE_SECRET_KEY` | ✅ site key public / 🔒 secret key secret |
| JotForm | E-book lead capture | iframe `src` in `ebook.html` | ✅ public embed |
| RSS2JSON | Blog feed JSON | `RSS2JSON_KEY` in `index.html` blog IIFE | ✅ public API key |
| Tidio | AI chatbot | script URL id in `index.html` | ✅ public widget id |
| Zabbix API | Live device stats | **env vars**, not in repo | 🔒 **secret** |

---

## Google Analytics 4

- **What:** page/traffic analytics via `gtag.js`.
- **Measurement ID:** `G-YDBB1PYYCM`.
- **Where:** the `<!-- Google tag (gtag.js) -->` block at the top of every main
  page's `<head>` (index, service pages, legal pages, mailmkt…).
- **To change/replace:** swap the ID in the `src=…?id=` URL **and** the
  `gtag('config', 'G-…')` call — in **every** page (no shared include).
- **Public?** Yes — measurement IDs are meant to be in client code.

---

## Cloudflare Worker + Zoho Mail (contact and careers forms)

- **What:** both forms POST same-origin to the Worker that also serves the
  site (`/api/contact`, `/api/careers`), which relays the message over SMTP to
  Zoho Mail. No third-party form service is involved. Full flow, secrets,
  deployment and testing steps: **`AUDIT-REPORT.md`** at the repo root, and
  [`ARCHITECTURE.md`](ARCHITECTURE.md#4-contact-and-careers-forms--cloudflare-worker--zoho-mail).
- **Destination:** `CONTACT_TO_EMAIL` and `CAREERS_TO_EMAIL` Worker secrets —
  never in the HTML/JS. They default to the authenticating mailbox
  (`ZOHO_USER`) if unset.
- **Public?** No credential is public. The site key for Cloudflare Turnstile
  is the only client-visible identifier related to these forms, and it is
  meant to be public.
- **Gotcha:** the contact form's inline error strings are localized through
  `window._i18n_errors` (populated by i18n). New error messages need keys in
  `scripts/i18n.js` (`form.err.*`). The Worker's own JSON error `message` is
  intentionally not shown verbatim to the visitor (it is Portuguese, an
  internal API contract) — the frontend shows its own localized fallback text.

---

## JotForm (e-book capture)

- **What:** the lead-capture form on `ebook.html` that gates the Zabbix e-book
  download.
- **Where:** an `<iframe id="JotFormIFrame-…" src="https://form.jotform.com/…">`
  in `ebook.html`, plus JotForm's embed-handler script.
- **To change:** replace the form id in both the iframe `src` and the
  `jotformEmbedHandler(...)` call. Manage fields/notifications in the JotForm
  dashboard.
- **History:** `ebook.html` used to have a hand-rolled form with a custom JS
  submit handler. That was replaced by the JotForm embed; the old dead handler
  was removed. Don't re-add client-side form logic here — JotForm owns it.

---

## RSS2JSON + CORS proxies (blog feed)

- **What:** the (currently hidden) `#blog` section fetches news from TechTudo
  and TecMundo. Full logic in
  [`ARCHITECTURE.md`](ARCHITECTURE.md#5-blog-rss-feed-hidden).
- **Primary API:** `api.rss2json.com` with `RSS2JSON_KEY` (in the blog IIFE).
- **Fallback proxies:** `api.allorigins.win`, then `corsproxy.io` (parse raw
  XML) — used only if RSS2JSON fails.
- **Public?** Yes — free-tier RSS2JSON keys are client-side by design.
- **To enable the section:** remove `hidden` from `<section id="blog">`.

---

## Tidio AI chatbot

- **What:** the floating AI chat widget.
- **Where:** two `<script>` blocks just before `</body>` in `index.html`:
  1. a small companion script that sets `document.tidioChatLang` (from
     `localStorage['glctech_lang']`) and exposes `window.glcOpenChat()`;
  2. the loader: `<script src="//code.tidio.co/<id>.js" async></script>`.
- **To change the account/widget:** replace the `<id>` in the loader URL with
  the one from your Tidio project's install snippet.
- **Branding lives in the Tidio dashboard**, not in code — set colors (brand
  red **`#e6262c`**), avatar, greeting, and automation there so it matches the
  site.
- **Make it site-wide:** copy the same two `<script>` blocks before `</body>`
  on the other pages (service/legal pages). Today it's on `index.html` only.
- **Open the chat from a site button:**
  ```html
  <button onclick="window.glcOpenChat && window.glcOpenChat()">Fale com a IA</button>
  ```

---

## Zabbix API (stats pipeline)

- **What:** `scripts/fetch_zabbix_stats.py` logs into a **Zabbix 7.x** server
  and writes `assets/data/stats.json` (device + problem counts). Full picture
  in [`ARCHITECTURE.md`](ARCHITECTURE.md#stats-pipeline-zabbix--json).
- **Credentials — 🔒 SECRET:** read from environment variables, never hard-coded:
  - `ZABBIX_URL` — base URL of the Zabbix server
  - `ZABBIX_USER` — API user
  - `ZABBIX_PASS` — password
- **Where they must live:** if/when you schedule this in **GitHub Actions**, put
  them in **repository secrets** (`Settings → Secrets and variables → Actions`)
  and pass them into the job's env. **Do not** commit them or put them in any
  `.html`/`.js` file — those are public.
- **Zabbix 7.x specifics** (already handled in the script): login field is
  `username` (not `user`); auth is an `Authorization: Bearer <token>` header
  (not an `auth` body field).

---

## Google Fonts & Font Awesome

- **Fonts:** Syne + DM Sans via `fonts.googleapis.com` `<link>` in each page.
- **Icons:** Font Awesome 6 via `cdnjs.cloudflare.com` `<link>`.
- Purely presentational CDNs; no keys. If you need offline/self-hosted assets
  later, download and reference locally, but that's not the current setup.

---

## `landing.html` form (legacy — not migrated)

The "Free Diagnostic" form on `landing.html` still submits directly to
**FormSubmit.co**, delivering to `hr@glctechsec.com`. Unlike the contact and
careers forms, it was **not** migrated to the Worker — `landing.html` is an
orphaned page (nothing links to it) and was out of scope for the forms audit
in `AUDIT-REPORT.md`. Treat it as legacy: either wire it to `/api/contact`
(with `subject: 'Free Diagnostic'`) or remove the page, as a follow-up
decision.

> Previously this form POSTed to an unrelated `automationanywhere.com` URL
> (a placeholder), so its leads went nowhere — that's now fixed.
