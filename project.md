# Soul Flower Somatics — Project Plan

Clone / upgrade of [soulflowersomatics.com](https://www.soulflowersomatics.com/) (currently Squarespace) onto **GitHub + Cloudflare Pages**, with Astro, dual CMS (Notion + Git), Resend email, and room to grow.

Last updated: 2026-07-30 (session: stack + CMS + forms/events phasing)

---

## Locked decisions

| Topic | Decision |
|-------|----------|
| Framework | **Astro** + TypeScript + Cloudflare adapter |
| Build (Cloudflare Pages) | Command: `npm run build` · Output: `dist` |
| Design | Keep hero video + general layout; tighten UI; keep scroll-reveal imagery |
| Scope | Core pages first; site must grow dynamically (FAQ, Blog, Shop, etc. later) |
| Hosting | Cloudflare Pages (+ Functions/Workers as needed) |
| Code | GitHub (this repo) |
| Launch | Build & deploy on Cloudflare first; point production domain later |
| Editing model | **Decap CMS** (browser editor at `/admin/`) + Markdown/Git in-repo (Cursor). Notion deferred. |
| Contact form | **Resend** → `rachelinflower@gmail.com` (not Formspree) |
| Newsletter | Prefer **MailerLite** if we can wire signup from the site; otherwise Resend Audiences. Migrate existing MailerLite list if needed |
| Events (v1) | **Email to register only** — no Stripe checkout yet (see Phase 2a) |
| Payments (later) | On-site Stripe Checkout (events + products) — deferred until after email-register flow |
| Spam | Cloudflare Turnstile |
| Session booking | Contact form only (no calendar booking yet) |
| Commerce | Yes later — products/courses sellable on site |
| Phone | Do **not** publish phone number |
| Legal | Privacy Policy + Terms (boilerplate) |
| New pages (planned) | FAQ, Testimonials, Blog, Shop, legal, checkout/confirm pages |

---

## Site map

### Core (from Squarespace) — Phase 1
1. **Home** — hero video, Flower State intro, offerings teaser, upcoming gatherings, newsletter
2. **About** — Rachel’s story
3. **Offerings** — Somatic Coaching, Sohum Breathing, Sound Healing, Resonant Branding, Psychedelic Somatic Integration
4. **Gatherings** — event list + detail + **email-to-register** (v1)
5. **Sanctuary** — One Tree Cottage
6. **Contact** — message form (no phone)

### New (grow into)
7. **FAQ**
8. **Testimonials**
9. **Blog** (+ post pages)
10. **Shop / Offerings products** (digital or physical — TBD)
11. **Privacy Policy**
12. **Terms & Conditions**
13. **Checkout success / cancel** pages *(after Stripe)*
14. **Event registration confirmation** *(email confirm first; Stripe receipt later)*

### Nav (proposed)
`Home · About · Offerings · Gatherings · Sanctuary · Shop · Blog · Contact`  
Footer: FAQ, Testimonials, Privacy, Terms, newsletter.

---

## Domain & DNS (checked 2026-07-30)

| Item | Value |
|------|--------|
| Registrar | **GoDaddy.com, LLC** |
| Expiry | 2027-01-03 |
| Name servers (whois) | `CONNECT1.SQUARESPACEDNS.COM`, `CONNECT2.SQUARESPACEDNS.COM` |
| Live DNS (dig NS) | `dns*.p02.nsone.net` (Squarespace/NS1) |
| A records | Squarespace IPs (`198.49.23.*`, `198.185.159.*`) |
| MX | **None** currently |

**Meaning:** Domain is **owned at GoDaddy**, but **DNS is delegated to Squarespace**. Launch on `*.pages.dev` first. Later cutover: nameservers at GoDaddy → Cloudflare, or update A/CNAME at current DNS.

---

## Architecture

```
GitHub repo (Astro source + /content Markdown)
    ↓ push
Cloudflare Pages
    ├── SSG pages → dist/
    ├── /api/*  Pages Functions
    │     ├── contact → Resend → site.params.contactEmail
    │     ├── newsletter → MailerLite API (preferred) or Resend
    │     ├── event register (v1) → Resend email to Rachel + auto-reply
    │     └── (later) stripe checkout + webhook → Resend RSVP
    ├── Notion API (CMS: events, blog, FAQ, testimonials, settings)
    └── Markdown in repo (same content types for Cursor / local edits)
```

### Repo layout (target)

```
reference/          # Squarespace HTML dump — design reference only, not deployed
assets/             # Captured media (migrate into public/ or src/assets as we build)
src/                # Astro pages, layouts, components, styles
content/            # Git Markdown (events, posts, etc.)
public/             # Static files served as-is
dist/               # Build output (Cloudflare output directory)
project.md          # This plan
```

### CMS: Decap + Git Markdown
- **Decap CMS** at `/admin/` — browser UI that commits Markdown to GitHub.
- **Content folders:** `src/content/events/`, `src/content/offerings/` (Astro content collections).
- **Local editing:** `npm run cms` (port 8081) + `npm run dev`, then open http://localhost:4321/admin/
- **Production login:** GitHub OAuth via `/auth` + `/callback` on this site (Cloudflare secrets: `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`).
- **GitHub OAuth App:** Homepage = site URL; Authorization callback URL = `https://<your-domain>/callback`. Update `base_url` in `public/admin/config.yml` to match the live origin (pages.dev or custom domain).
- Notion sync: deferred; Decap covers non-dev dashboard edits for now.

### Why Astro + Cloudflare
- Marketing + content site; Astro ships little JS; static + islands.
- Pages Functions cover forms, later Stripe, Decap OAuth.
- Grows page-by-page without a heavy app framework.

---

## Email & forms strategy

| Flow | v1 approach | Later |
|------|-------------|--------|
| Contact | Resend → `rachelinflower@gmail.com` | Same |
| Event register | Form → Resend (notify Rachel + optional auto-reply to guest) | Stripe Checkout + confirmation email |
| Newsletter | MailerLite embed/API if credentials available | Keep MailerLite or move list to Resend |

**Accounts setup order (when we implement):**
1. Resend — account, from-address; verify domain DNS after Cloudflare cutover
2. MailerLite — API key / form for newsletter (if continuing that list)
3. Cloudflare Turnstile — site + secret keys
4. Notion — integration token + shared databases
5. Stripe — **deferred** until Phase 2b

All secrets in Cloudflare Pages env vars — never in git.

---

## Site params (config)

Central config (e.g. `src/config/site.ts`) — change here, not scattered:

```ts
export const site = {
  name: "Soul Flower Somatics",
  url: "https://www.soulflowersomatics.com",
  contactEmail: "rachelinflower@gmail.com",
  fromEmail: "hello@soulflowersomatics.com", // after Resend domain verify
  social: { /* TBD */ },
}
```

---

## Assets inventory

### Captured ✓
| Asset | Path | Notes |
|-------|------|--------|
| Logo (black horizontal) | `assets/images/SoulFlowerSomatics_HorizontalLogoBlack.webp` | |
| Favicon | `assets/images/favicon.gif` | |
| Hero video | `assets/videos/SoulFlowerSomatics_Banner1.mp4` | ~6s, muted-ready |
| Hero poster | `assets/videos/hero-poster.jpg` | |
| About portrait | `assets/images/Rachel_Flowers.webp` | |
| Home / scroll imagery | `assets/images/unsplash-image-*.jpg`, `4.gif`, etc. | |
| Sanctuary photos | `assets/images/*.jpeg` | One Tree Cottage |
| Event artwork | `assets/images/Breathwork_*.png`, `Somadance_*.png`, etc. | |
| Reference HTML | `reference/*.html` | Offline scrape |

**Totals:** ~44 images (~42MB), hero MP4 (~2MB).

### Fonts (from Squarespace — Google Fonts / self-host)
- **Libre Baskerville** (display / headings)
- **Open Sans** (body)
- **Almarai**, **Asap** (secondary — confirm if still wanted)

### Need from you ✗
| Item | Why | How |
|------|-----|-----|
| White / light logo (if any) | Dark hero | Squarespace Assets / brand kit |
| Original hero MP4 (optional) | Higher quality than CDN encode | Squarespace Asset Library |
| Brand color hexes | Tokens | Brand guide / sample from site |
| MailerLite access | Newsletter + list migrate | API key or embed; export CSV optional |
| Testimonials text | Structured content | Notion or doc |
| Product list for shop | SKUs, prices | Spreadsheet / Notion |
| GoDaddy login (later) | DNS cutover | When leaving Squarespace DNS |

### Design notes to preserve
- Full-bleed **hero video** background
- Strong brand/logo in first viewport
- Scroll-triggered image reveals
- Soft, somatic tone — avoid generic “AI wellness” purple/cream templates

---

## Feature checklist

### Phase 0 — Foundation ← current
- [x] Init Astro + TypeScript + Cloudflare adapter
- [ ] Design tokens (colors, type, spacing)
- [ ] Layout, nav, footer, scroll motion
- [x] Wire `site` params + `.env.example` / `.dev.vars.example`
- [x] Resend client + `/api/contact` + `/api/register` (forms UI later)
- [ ] Deploy shell to Cloudflare Pages (`npm run build` → `dist`)

### Phase 1 — Core pages + contact
- [ ] Home, About, Offerings, Sanctuary, Contact
- [ ] Privacy + Terms boilerplate
- [ ] FAQ + Testimonials scaffolds
- [ ] Contact form → Resend → `contactEmail`
- [ ] Turnstile
- [ ] Newsletter signup → MailerLite (preferred) or Resend

### Phase 2a — Gatherings (email register) ← no Stripe yet
- [ ] Event content model (Notion DB + Markdown)
- [ ] List + detail pages
- [ ] **Register via email** (form → Resend notify + guest auto-reply)
- [ ] ICS / Google Calendar subscribe feed (optional in this phase)

### Phase 2b — Stripe (deferred)
- [ ] Stripe Checkout for events (fixed + sliding-scale)
- [ ] Webhook → mark registration + Resend confirmation
- [ ] Checkout success / cancel pages

### Phase 3 — Blog, shop, deepen CMS
- [ ] Blog from Notion/Markdown
- [ ] Shop products + Stripe
- [ ] Notion ↔ Git sync clarity
- [ ] Migrate MailerLite list if moving providers

### Phase 4 — Domain cutover
- [ ] QA on `*.pages.dev`
- [ ] Move DNS to Cloudflare (or update records)
- [ ] Verify Resend domain
- [ ] Redirect old Squarespace URLs if needed
- [ ] Cancel/pause Squarespace when stable

---

## Progress log

| Date | Notes |
|------|--------|
| 2026-07-30 | Assets + `reference/` HTML captured from Squarespace |
| 2026-07-30 | Locked **Astro**; dual CMS (Notion + Git); **Resend** for forms; **MailerLite** preferred for newsletter; **events v1 = email register** (Stripe later) |
| 2026-07-30 | Cloudflare Pages settings for this stack: build `npm run build`, output `dist` |
| 2026-07-30 | Resend tooling: `resend` SDK, site config, `/api/contact` + `/api/register`, `.dev.vars` / `.env.example` |
| 2026-07-30 | Astro scaffolded at repo root + `@astrojs/cloudflare` adapter |

---

## Open questions

1. **Shop:** first products (course, digital download, merch, gift certificates)?
2. **Sliding scale:** keep `$77 / $87 / $97` style for ceremonies once Stripe lands?
3. **Notion:** fresh workspace structure for the site, or an existing page?
4. **Analytics:** Cloudflare Web Analytics, Plausible, or Google Analytics?
5. **From-address:** `hello@`, `rachel@`, or other once domain email is set up?
6. **MailerLite:** keep as newsletter home, or export and move to Resend later?

---

## Accounts

| Service | Purpose | Status |
|---------|---------|--------|
| GitHub | Code | This repo |
| Cloudflare | Host + Turnstile + DNS later | Needed |
| Resend | Contact + event-register emails (+ optional newsletter) | API key ready — local `.dev.vars`; Cloudflare secrets later |
| MailerLite | Newsletter list / signup | Preferred if we keep current list |
| Notion | CMS databases | Needed — integration token |
| Stripe | Checkout — **Phase 2b** | Deferred |
| GoDaddy | Domain registrar | Have (DNS still on Squarespace) |

---

## Reference

- Live site: https://www.soulflowersomatics.com/
- Local HTML snapshots: `reference/`
- Asset download manifest: `reference/download-manifest.json` (if present)
- This plan: `project.md`
