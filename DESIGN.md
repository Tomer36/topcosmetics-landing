# Site structure and design rules

These are the rules the site follows today. Read this before adding a page, a section or a style, and keep new work consistent with it. If a rule has to change, change it here too.

## 1. Structure

### Pages

One Astro file serves every language. Files live in `src/pages/[...lang]/`.

| Page | File | URL (Arabic / Hebrew) |
| --- | --- | --- |
| Home | `index.astro` | `/` · `/he/` |
| About | `about.astro` | `/about/` · `/he/about/` |
| Treatments list | `services/index.astro` | `/services/` · `/he/services/` |
| Treatment page (×8) | `services/[slug].astro` | `/services/<slug>/` |
| Team member | `team/[member].astro` | `/team/<key>/` |
| Gallery | `gallery.astro` | `/gallery/` |
| Contact | `contact.astro` | `/contact/` |
| Legal (accessibility, privacy, terms, deposit-terms) | `[legal].astro` | `/<page>/` |
| 404 | `src/pages/404.astro` | — |

- **Arabic is the default language** and is served at `/`. Hebrew is served at `/he/`. Both are RTL.
- URLs always end with `/`.
- Every page is built in **both** languages. A page that exists in only one language fails `npm run check:site`.

### Home page order

1. Hero: title, lead, WhatsApp button, photo, stats
2. Treatments (`ServiceCards`)
3. Team (`Therapists`)
4. Why us
5. Gallery (first 6 photos and a "all photos" button)
6. Google review (`Review`)
7. Opening hours and contact

### Where things go

| Change | Put it in |
| --- | --- |
| Any visible text | `src/i18n/he.json` **and** `src/i18n/ar.json`, with the same keys |
| Business facts (phone, address, hours, links, services, team) | `src/config/site.ts` (the only place they are written) |
| A block used on more than one page | a component in `src/components/` |
| Styles | `src/styles/global.css`, in a section with a `/* ---------- Name ---------- */` heading |
| `<head>`, SEO, JSON-LD | `src/layouts/Base.astro`, `src/config/schema.ts` |
| Images | `src/assets/` (optimised by Astro); only favicons, the share image and `.htaccess` go in `public/` |
| Logo files | `src/assets/photos/` originals, then run `npm run logo` |

### Rules

- **No hard-coded text in components or pages.** Every string comes from `useTranslations(locale)`.
- **No hard-coded business facts.** Phone numbers, links and hours come from `site.ts`.
- A component takes `locale` as a prop and nothing language-specific beyond that.
- If an optional value (a social link, the review link) is empty in `site.ts`, the block that uses it disappears.
- Static output only. No server code, no client framework. JavaScript is kept to a few small inline scripts.
- No third-party requests, cookies or trackers by default. Fonts are self-hosted. Don't embed Google widgets or other third-party scripts; link out instead.

## 2. Design language

The style matches the clinic's CRM (Hostinger hPanel style): a soft pink background, white rounded cards, light headings and a single plum accent colour. It is calm and spacious, with few decorations.

### Colours

Use the CSS variables only. Never write a new hex value in a component.

| Token | Value | Use |
| --- | --- | --- |
| `--brand` | `#9c3d72` | primary buttons, links, icons, accents |
| `--brand-dark` | `#7c2c5a` | hover state of brand elements |
| `--brand-light` | `#c0789f` | the short line under section titles, light accents |
| `--brand-soft` | `#f7edf2` | icon badges, chips, tonal buttons |
| `--canvas` | `#faf5f6` | page background |
| `--surface` | `#ffffff` | cards |
| `--surface-muted` | `#fbf1f4` | quieter cards (`.card-muted`, e.g. the CTA) |
| `--border` / `--border-strong` | `#f0dde3` / `#e2c9d3` | card borders / outlined buttons and chips |
| `--text` / `--text-muted` / `--text-faint` | `#1d1e20` / `#5f6272` / `#8a8d9a` | body text / leads and descriptions / small print |

- One accent colour. Don't add new colours, gradients or gold or yellow accents. Stars, icons and highlights use `--brand`.
- The only exceptions are status colours that already exist (for example the green "open now" dot).

### Typography

- **Hebrew:** Heebo. **Arabic:** Noto Sans Arabic. Both are self-hosted variable fonts, and each page loads only the one its language needs.
- Body text is 15px (`0.9375rem`). Line height is 1.7, or 1.85 for Arabic.
- `h1`, `h2`: weight **300** (light) and line height 1.3. `h1` uses `clamp(1.75rem, 6vw, 2.625rem)` and `h2` uses `clamp(1.375rem, 4vw, 1.75rem)`.
- `h3`: 16px, weight 500.
- Buttons are weight 600, and that is the boldest text on the site. Don't use bold headings.
- Use one `h1` per page. Section titles are `h2` and titles inside cards are `h3`.

### Layout and spacing

- Content sits inside `.container`, which is at most 1120px wide with a 16px gutter (24px from 900px).
- Each block is a `<section class="section" aria-labelledby="…">`. The vertical spacing comes from `--section-gap`, which is 64px on phones and 104px on desktop. Don't add extra margins between sections.
- **Section pattern.** Every home and inner section starts like this:

  ```html
  <section class="section" aria-labelledby="x-title">
    <div class="container">
      <div class="section-head">
        <h2 id="x-title">…</h2>
        <p>…</p>                <!-- optional lead -->
      </div>
      … cards / grid …
    </div>
  </section>
  ```

  The heading is aligned to the start (the right side in RTL), never centred, and `.section-head h2` gets a 40px line underneath it automatically.
- Inner pages start with `.page-head` (an `h1` and a `.lead`).
- Grids: `.grid` with `.grid-2`, `.grid-3` or `.grid-4`. Breakpoints are **600px** (2 columns), **700px** for a few components, and **900px** (desktop: 3–4 columns, larger gutters, header and spacing).
- Every design must work at 360px wide with no horizontal scrolling.

### Components

| Element | Class | Rules |
| --- | --- | --- |
| Card | `.card` | white, 1px `--border`, 16px radius, soft pink shadow, 20px padding (24px on desktop) |
| Quiet card | `.card .card-muted` | `--surface-muted` and no shadow. For CTAs and asides |
| Icon badge | `.icon-badge` | 44px circle, `--brand-soft` background, `--brand` icon |
| Primary button | `.btn .btn-primary` | one per block, for the main action (booking, review) |
| Secondary button | `.btn .btn-secondary` | outlined. For "more" links ("all photos", "more about the clinic"), with an arrow icon |
| Tonal button | `.btn .btn-tonal` | `--brand-soft` fill, for minor actions |
| Small button | `.btn-sm` | inside dense cards |
| Chip | `.chip`, `.chip-outline` | pills for times, tags and short facts |
| Button group | `.btn-row` | wraps on small screens |

- Buttons are 40px tall (32px for `.btn-sm`) with an 8px radius. An invisible `::after` keeps the touch target at least 44px. Don't make buttons taller.
- Put an icon before the button text. Use `Icon name="arrow" class="icon-dir"` for "go to" links; it flips automatically for direction.
- On phones, booking buttons inside the page get `.desktop-only`, because the sticky bottom bar handles booking.

### Icons

- Use only `src/components/Icon.astro`: outlined line icons on a 24×24 grid, 1.5 stroke, `currentColor`.
- To add an icon, draw it in the same style and add it to the `icons` map. Don't use icon fonts, emoji or coloured brand logos.
- Icons are decorative (`aria-hidden`) unless you pass `label`.

### Images

- Use Astro `<Image>` with `format="webp"` and explicit `width`, `height` and `sizes`. Only the hero image is `loading="eager"`; everything else is lazy.
- Photos have rounded corners like the cards. Every photo needs an alt text in both JSON files.

### Writing tone

- **Hebrew:** plural address (עקבו, דרגו).
- **Arabic:** feminine singular address (احجزي, تابعينا, قيّمينا).
- Keep it short, warm and factual. Don't promise medical results.
- Brand names stay in Latin script: Google, WhatsApp, Waze. Wrap Latin handles and phone numbers in `<bdi dir="ltr">` inside RTL text.

### RTL and accessibility

- Use **logical CSS properties only** (`margin-inline-start`, `padding-block`, `inset-inline-end`). Never use `left`, `right`, `margin-left` and so on, so a future English (LTR) version works without new CSS.
- Text contrast must meet WCAG AA. Body text on cards uses `--text` or `--text-muted`, never `--text-faint`.
- Every section has a heading that `aria-labelledby` points to. Links that open another site use `target="_blank" rel="noopener"`.
- Respect `prefers-reduced-motion`. Animation is limited to short colour transitions (0.15s).
- The accessibility menu (`A11yMenu`) must keep working, so don't fix font sizes in `px` on text that should scale.

## 3. Before you push

```bash
npm run check:i18n   # same keys in he.json and ar.json
npm run build
npm run check:site   # language, links, hreflang and legal-page checks on dist/
```

A push to `main` deploys to Hostinger automatically (see `README.md`).
