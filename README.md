# GLCTech Sec — glctechsec.com

Marketing website for **GLCTech Sec**, the UK security/operations arm of the
GLCTech Group — an IT monitoring, cybersecurity, and backup services company.
The site is static and multilingual, served by a single **Cloudflare Worker**
that also handles the contact and careers form submissions server-side.

- **Live domain:** https://glctechsec.com
- **Detailed architecture:** [`docs/SITE_ARCHITECTURE.md`](docs/SITE_ARCHITECTURE.md)
- **Forms / security / deployment audit:** [`AUDIT-REPORT.md`](AUDIT-REPORT.md)

---

## Purpose & core functionality

A lead-generation marketing site presenting GLCTech's services (Zabbix
monitoring, Kaspersky/vendor-agnostic security, Veeam backup), company and
compliance information, and two working forms:

- **Contact form** (`/api/contact`) — JSON, relayed by email to the GLCTech inbox.
- **Careers form** (`/api/careers`) — multipart with a validated PDF résumé
  attached to the notification email.

Both forms post to the **same origin** (the Worker that serves the site), so
there is no CORS preflight and no third-party form service. Other features:
client-side internationalisation (6 languages), per-locale pricing simulators,
a live "devices monitored" counter fed from Zabbix, GA4 analytics, and a Tidio
chat widget.

## Technology stack

| Area | Technology |
|---|---|
| Frontend | Hand-authored HTML5 + CSS + vanilla JavaScript (no framework, no bundler) |
| i18n | `scripts/i18n.js` — self-contained dictionary, 6 languages |
| Backend | Cloudflare Worker (`worker/index.js`) + `worker/lib/*` |
| Mail | Direct SMTP to Zoho Mail over `cloudflare:sockets` |
| Build | `scripts/build.mjs` — allowlist that assembles `dist/` |
| Tests | Node.js built-in test runner (`node --test`) |
| CI/CD | GitHub Actions (`ci.yml`) + Wrangler deploy |
| Hosting | Cloudflare Workers + Cloudflare DNS/CDN/TLS |

## Repository structure

```text
.
├── *.html                     14 published pages (index, services, legal, careers, …)
├── css/ · assets/             Styles and images (logos, team, service, OG)
├── scripts/
│   ├── build.mjs              Allowlist build → dist/
│   ├── i18n.js                Shared i18n runtime (loaded by every page)
│   └── fetch_zabbix_stats.py  CI script for the live stats counter
├── worker/
│   ├── index.js               Router: /api/contact, /api/careers, else static assets
│   └── lib/                    http, smtp, mail, validate, turnstile
├── tests/                     Node test suite (html, links, i18n, json, smtp, worker, quality)
├── docs/                      ARCHITECTURE, SITE_ARCHITECTURE, INTEGRATIONS, I18N, CI-CD, CONTENT-EDITING
├── tools/                     Python generators for brand SVG figures
├── wrangler.toml              Cloudflare Worker config
├── _headers                   Security headers for static assets
├── AUDIT-REPORT.md            Forms/security audit + all out-of-repo actions
└── package.json               Scripts: build, test, deploy, preview
```

## Prerequisites

- **Node.js ≥ 22** (see `package.json` `engines`).
- **npm** (bundled with Node).
- A **Cloudflare account** with Wrangler access (for deploying / previewing the Worker).
- Python 3 is only needed for the Zabbix stats script and the `tools/` generators.

## Local development setup

```bash
npm install                    # installs wrangler (only dev dependency)
cp .dev.vars.example .dev.vars # fill in local secrets — never commit this file
```

`.dev.vars` holds the Worker secrets used by `wrangler dev`. See
[`.dev.vars.example`](.dev.vars.example) for the full list and
[`AUDIT-REPORT.md`](AUDIT-REPORT.md) for how to obtain each value.

## Environment configuration

Runtime secrets are set in Cloudflare, never in the repo
(`npx wrangler secret put <NAME>`). Names and purposes:

| Variable | Purpose |
|---|---|
| `ZOHO_USER` / `ZOHO_PASS` | Zoho mailbox + app-specific password for outgoing SMTP |
| `CONTACT_TO_EMAIL` | Contact-form recipient (falls back to `ZOHO_USER`) |
| `CAREERS_TO_EMAIL` | Careers-form recipient (falls back to `ZOHO_USER`) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret (optional; verification skipped if unset) |
| `RATE_LIMIT` (KV binding) | Per-IP rate limiting (optional; commented in `wrangler.toml`) |
| `ZABBIX_URL` / `ZABBIX_USER` / `ZABBIX_PASS` | GitHub Actions secrets for the live stats pipeline |

Full detail: [`docs/SITE_ARCHITECTURE.md`](docs/SITE_ARCHITECTURE.md) §9.

## Running the project

```bash
npm run preview     # build + wrangler dev — full site + working /api/* locally
```

For a quick static-only preview without the Worker, any static server works
(e.g. `python3 -m http.server 8080`), but the form endpoints will not respond.

## Build process

```bash
npm run build       # scripts/build.mjs → dist/
```

`build.mjs` is an **allowlist**: only explicitly named files/directories are
copied into `dist/`, and it fails if any listed file is missing or any asset
exceeds Cloudflare's 25 MiB limit. This is deliberate — nothing (secrets,
tests, docs, `node_modules`) can be published by accident.

## Testing

```bash
npm test            # node --test over tests/*.test.js and tests/*.test.mjs
```

The suite covers HTML integrity, internal links, i18n key completeness, JSON
data files, the SMTP client, the Worker form contract, and site-quality
invariants. CI runs it on every PR and push to `main` (`.github/workflows/ci.yml`).

## Deployment overview

```bash
npm run deploy      # npm run build && wrangler deploy
```

Deploying requires the Worker secrets above and Cloudflare account access.
After the first deploy, the custom domain (`glctechsec.com`) is attached in the
Cloudflare dashboard (Workers & Pages → glctechsec → Domains & Routes). The
**authoritative deployment runbook — secrets, Turnstile, DNS/SPF/DKIM/DMARC,
testing, rollback — is [`AUDIT-REPORT.md`](AUDIT-REPORT.md).**

> Note: `DEPLOYMENT_GUIDE.md` predates the Worker architecture and is retained
> only for historical i18n/content notes. Use `AUDIT-REPORT.md` for deployment.

## Architecture overview

Single Cloudflare Worker → serves static `dist/` assets for all non-API routes
and processes `/api/contact` + `/api/careers` in-process, relaying to Zoho Mail
over SMTP. No database; the site is stateless apart from a committed
`stats.json`, an optional rate-limit KV, and browser `localStorage`. See
[`docs/SITE_ARCHITECTURE.md`](docs/SITE_ARCHITECTURE.md) for diagrams and the
full breakdown, and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for
page/JS-subsystem internals.

## Security considerations

- HTTPS at the Cloudflare edge; security headers on static assets (`_headers`)
  and API responses (`worker/lib/http.js`).
- Form endpoints: same-origin check, honeypot, optional Turnstile
  (server-verified), per-IP rate limiting, and résumé validation by extension +
  MIME + magic bytes.
- All credentials live in Worker/CI secrets — never in the repository.
- **Open items** (require account/DNS access): deploy the Worker, add a DMARC
  record for `glctechsec.com`, and configure Turnstile + rate-limit KV for
  production. See [`AUDIT-REPORT.md`](AUDIT-REPORT.md).

## Contribution / development workflow

1. Branch from `main`.
2. Make changes; preview locally (`npm run preview`).
3. `npm test` — keep the suite green.
4. Open a PR to `main`; CI runs the test suite.
5. After merge, publish with `npm run deploy` (there is no staging environment).

Content-editing recipes (copy, translations, stats): see
[`docs/CONTENT-EDITING.md`](docs/CONTENT-EDITING.md) and
[`docs/I18N.md`](docs/I18N.md).

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `POST /api/contact` returns 405 on the live site | The Worker isn't deployed / domain not attached — see `AUDIT-REPORT.md`. |
| Forms return 500 | `ZOHO_USER`/`ZOHO_PASS` not set (fails closed by design). |
| Turnstile "verification failed" | Site key in HTML and `TURNSTILE_SECRET_KEY` mismatch, or widget not created. |
| Rate-limit not enforced | `RATE_LIMIT` KV namespace not bound (optional; site still works). |
| Stats counter shows the fallback number | `ZABBIX_*` CI secrets not set, or the last fetch failed. |
| Translations not applying | All pages load `scripts/i18n.js`; check the `data-i18n*` attributes and `docs/I18N.md`. |

## Documentation index

| Doc | Contents |
|---|---|
| [`docs/SITE_ARCHITECTURE.md`](docs/SITE_ARCHITECTURE.md) | Full system architecture, diagrams, data flow, security, risks |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Page + JavaScript-subsystem internals |
| [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md) | Third-party integration setup (Zoho, Turnstile, GA4, Tidio, Zabbix) |
| [`docs/I18N.md`](docs/I18N.md) | Internationalisation engine and translation keys |
| [`docs/CONTENT-EDITING.md`](docs/CONTENT-EDITING.md) | Task-oriented content-editing recipes |
| [`docs/CI-CD.md`](docs/CI-CD.md) | CI pipeline details |
| [`AUDIT-REPORT.md`](AUDIT-REPORT.md) | Forms/security audit + deployment runbook + out-of-repo actions |

---

## Change history

The project has gone through several documented revisions. Summaries below;
the linked changelogs hold the full detail.

### Revision 1 — Internationalisation
Full translation of the original Portuguese site to English with a 6-language
i18n engine (EN default), international pricing, and updated contact details.
Detail: [`TRANSLATION_CHANGELOG.md`](TRANSLATION_CHANGELOG.md).

### Revision 2 — Strategic audit fixes (Aug 2026)
- **Dual-office transparency.** Every page discloses both São Paulo (GLCTech
  Group HQ, est. 2016) and Salford, Greater Manchester (GLCTech Sec UK).
- **Two new pages:** `about-the-group.html` and `trust-compliance.html`.
- **Kaspersky repositioned as vendor-agnostic** (one option among Defender,
  Bitdefender, Sophos).
- **Pricing converted to GBP** for the `en` locale on the service pages.
- **Testimonials disclosed as Brazil-based**; UK client base noted as new.
- **Removed clutter:** the hidden Portuguese blog/RSS block and orphaned pages,
  and the legacy unused i18n systems.
- **Fixed a cross-domain bug:** assets now load locally (`./assets/…`) instead
  of from `glctech.com.br`.

*Still needs a human decision:* Cyber Essentials target date; confirming the
DPA/insurance/breach commitments on `trust-compliance.html`; DE/ES/FR/IT copy
for the new pages.

### Revision 3 — Full audit, image replacement and rebuild
See [`REVISION-3-CHANGELOG.md`](REVISION-3-CHANGELOG.md). Headlines: all
AI-generated imagery replaced with brand-native SVGs; bundle cut from 24 MB to
1.4 MB; SEO metadata added to six pages; accessibility baseline (skip links,
focus rings, reduced-motion, real `<form>`); iconography unified on Font
Awesome; contact form repointed to `contact@glctechsec.com`; Cloudflare deploy
fixed with the allowlist build; test count raised to 168.

### Revision 4 — Full site audit and functional, secure forms (Aug 2026)
See [`AUDIT-REPORT.md`](AUDIT-REPORT.md). Headlines: contact form was broken in
production (Worker never deployed); careers form moved off FormSubmit.co onto
`/api/careers`; three duplicate mail implementations consolidated into
`worker/lib/`; résumé uploads validated by magic bytes; Cloudflare Turnstile
added (server-verified); security headers added everywhere; recipient addresses
moved to Worker secrets; 242 tests passing.

⚠ Several items need a human decision or an action outside this repository —
deploying the Worker, rotating/creating the Zoho app password, creating the
Turnstile widget, and adding a DMARC record for `glctechsec.com`. All are
listed at the end of [`AUDIT-REPORT.md`](AUDIT-REPORT.md).
