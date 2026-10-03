# Top Cosmetics Clinic — landing site

Bilingual static website for **Top Cosmetics Clinic** (topcosmeticsclinic.com), Shefa-'Amr.

- **Astro**, static output only. Plain CSS with CSS variables, about 30 lines of JavaScript.
- **Hebrew** at `/` (default) and **Arabic** at `/ar/`, both RTL. English can be added later.
- Deployed to **Hostinger** shared hosting: every push to `main` builds the site and uploads `dist/` by FTP.
- No cookies, no trackers, no third-party requests by default.

## Run it locally

Requires Node 22 or newer.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # writes the static site to dist/
npm run preview    # serves dist/ locally
npm run check:i18n # checks that ar.json has the same keys as he.json
```

## Where things live

| What | Where |
| --- | --- |
| Phone, WhatsApp, address, geo, hours, social links, list of services | `src/config/site.ts` |
| All Hebrew text | `src/i18n/he.json` |
| All Arabic text | `src/i18n/ar.json` |
| Languages (codes, direction, switcher labels) | `src/i18n/index.ts` |
| Design tokens and all styles | `src/styles/global.css` |
| `<head>`: SEO tags, hreflang, JSON-LD, fonts, optional GA4 | `src/layouts/Base.astro` |
| schema.org builders (BeautySalon, Service, FAQPage, BreadcrumbList) | `src/config/schema.ts` |
| Pages (one file serves every language) | `src/pages/[...lang]/` |
| `sitemap.xml`, `robots.txt` | `src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts` |
| Gallery photos | `src/assets/photos/clinic-1.jpg` … `clinic-3.jpg` |
| Share image, favicons, `.htaccess` | `public/` |
| Deploy workflow | `.github/workflows/deploy.yml` |

Pages built (each in Hebrew and Arabic):

- `/` — home
- `/about/`
- `/contact/`
- `/services/laser-hair-removal/`
- `/services/facial-treatments/`
- `/services/hydrafacial/`
- `/services/mesotherapy/`
- `/services/massage/`
- `/services/eyebrow-shaping/`
- `/services/botox/`
- `/services/dermal-fillers/`

URLs end with a slash (`/services/massage/`). That is the form Hostinger serves static folders in without a redirect, and it is the form used in canonical tags, hreflang tags and the sitemap.

## Before launch — content checklist

The copy is **draft placeholder text**. Both translation files start with a `_meta` block that says so.

1. **Hebrew (`he.json`)** — the clinic description, service names, laser bullet points, owner names, "4000+", "15+" and the opening hours come from the previous landing page. Everything else (service descriptions, "who it is for", "what to expect", FAQ answers, team bios, equipment, SEO titles) was written for this build and needs review by the clinic.
2. **Arabic (`ar.json`)** — only the opening hours were supplied in Arabic. Every other string is a draft translation and needs a native Arabic speaker. Check in particular the spelling of the owners' names, the clinic name (توب كوزمتيكس) and the street name.
3. **Treatment claims** — sessions needed, pain, results, and who performs Botox and filler treatments must be confirmed by the clinic. The Botox and filler pages are deliberately cautious.
4. **`src/config/site.ts`**
   - `geo` is the map centre of the street, not the exact door. Replace it with the clinic's pin (right-click the building in Google Maps → click the coordinates).
   - There is no house number or postal code yet. Add them when known, and keep them identical to the Google Business Profile.
5. **Parking and arrival notes** — `contact.arrival.items` in both JSON files is generic. Add the real details.
6. **Equipment** — `about.equipment` does not name device models. Add them.
7. **Photos** — the gallery is every image in `src/assets/gallery/`. To add a photo, drop a JPG, PNG or WebP file into that folder; file-name order is display order, so start names with a number (`13-new-room.jpg`). The home page shows the first six and `/gallery/` shows all. Descriptions are under `gallery.alts` in both JSON files, keyed by the file name without number and extension (`new-room`); without one a general description is used. The hero photo is set at the top of `src/pages/[...lang]/index.astro`.
8. **Header logo and browser tab icon** — both are generated from the round logo with thickened lines (`npm run logo`), because the original hairline drawing all but disappears at those sizes. A version of the logo drawn for small sizes by the designer would look sharper.

## Logo and team photos

- **Logo** — the original artwork is `src/assets/photos/Topcosmeticslogo_flat.png` and `Topcosmeticslogo_circle.png`. `npm run logo` derives the files the site uses: the header lettering (`src/assets/logo-wordmark.png`), the full logo for the footer (`src/assets/logo-full.png`), the share image (`public/og-image.jpg`) and `public/apple-touch-icon.png`. Run it again if the artwork changes.
- **Team** — the team section (home and About pages) shows a small card per person, and each person has their own page at `/team/<key>/`. To add someone: add a line to `team` in `src/config/site.ts` (key, photo file name, and the treatments they perform), add a block with the same key under `therapists` in both JSON files, and put their photo in `src/assets/team/`. Without a photo a placeholder icon is shown. A person who lists a treatment is shown on that treatment page under "who performs the treatment".

## Legal pages and cookie consent

- `/accessibility/`, `/privacy/` and `/terms/` exist in both languages and are linked from the footer. Texts: `legal` in both JSON files. Update `legal.updated` whenever they change.
- These texts are **drafts and not legal advice**. Have a lawyer review them before launch. The accessibility statement still needs the real physical-access details of the clinic (parking, entrance, restroom) and, if the clinic has one, an email address for accessibility requests.
- **Cookie banner** — by default the site sets no cookies, so no banner is shown. When `PUBLIC_GA4_ID` is set, a consent banner appears on the first visit, Google Analytics loads only after the visitor accepts, and a "cookie settings" link in the footer lets them change the choice.

After editing a JSON file run `npm run check:i18n`.

## Setup, step by step

### 1. Create the GitHub repository

1. On GitHub: **New repository** → name `topcosmetics-landing` → Private → do not add a README.
2. In this folder:

   ```bash
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<your-account>/topcosmetics-landing.git
   ```

   Do **not** push yet. The first push to `main` triggers a deploy, so finish steps 2–4 first.

### 2. Connect the domain on Hostinger

1. hPanel → **Websites** → **Add website** → choose **Empty PHP/HTML website** → enter `topcosmeticsclinic.com`.
2. If the domain is registered elsewhere, point it to Hostinger: either change the nameservers to the ones hPanel shows, or set the `A` record for `@` (and a `CNAME` for `www` → `topcosmeticsclinic.com`) to the IP hPanel shows.
3. Wait until the domain opens Hostinger's default page. DNS changes can take up to 24 hours.

### 3. Enable SSL

1. hPanel → the website → **Security** → **SSL** → install the free SSL certificate for `topcosmeticsclinic.com` (include `www`).
2. Wait until its status is **Active**.

Do this before the first deploy. The site's `.htaccess` redirects every visitor to `https://` and from `www` to the bare domain, which fails without a certificate.

### 4. Add the GitHub Secrets

1. hPanel → the website → **Files** → **FTP Accounts**. Note the **FTP hostname** (or IP), the **username**, and set a password.
2. GitHub → the repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Add three secrets:

   | Secret | Value |
   | --- | --- |
   | `FTP_HOST` | the FTP hostname or IP from hPanel, without `ftp://` |
   | `FTP_USERNAME` | the FTP username, e.g. `u123456789` |
   | `FTP_PASSWORD` | the FTP password |

3. Optional, on the **Variables** tab of the same page:

   | Variable | Default | When to set it |
   | --- | --- | --- |
   | `FTP_SERVER_DIR` | `public_html/` | if the FTP account opens somewhere else — see below |
   | `FTP_PROTOCOL` | `ftp` | set to `ftps` if your Hostinger plan accepts FTP over TLS |
   | `PUBLIC_GA4_ID` | empty | a GA4 measurement ID (`G-XXXXXXXXXX`) to turn analytics on |

#### Which folder does FTP upload to?

Log in once with an FTP program (FileZilla) using the same account and look at the folder you land in:

- You see a `public_html` folder → keep the default `public_html/`.
- You are already inside `public_html` (you see its files) → set `FTP_SERVER_DIR` to `./`.
- You see `domains/` → set it to `domains/topcosmeticsclinic.com/public_html/`.

The value must end with `/`. Delete Hostinger's `default.php` from `public_html` if it is there.

### 5. First deploy

```bash
git push -u origin main
```

GitHub → **Actions** shows the run. The first upload sends every file and takes a few minutes; later pushes only upload what changed. When it is green, open `https://topcosmeticsclinic.com/` and `https://topcosmeticsclinic.com/ar/`.

The workflow can also be started by hand: **Actions** → **Build and deploy to Hostinger** → **Run workflow**.

### 6. Google Search Console

1. Open <https://search.google.com/search-console> → **Add property** → **Domain** → `topcosmeticsclinic.com`.
2. Google shows a `TXT` record. Add it in hPanel → **Domains** → **DNS / Nameservers** → **Add record** (type `TXT`, name `@`), then press **Verify**. Verification can take a few minutes up to a day.
3. **Sitemaps** → enter `https://topcosmeticsclinic.com/sitemap.xml` → **Submit**.
4. **URL inspection** → paste the home page URL → **Request indexing**. Repeat for `/ar/`.
5. Test the structured data at <https://search.google.com/test/rich-results> with the home page and one service page.

### 7. Google Business Profile

1. Open <https://business.google.com> → **Add your business** (or claim the existing listing if the clinic already appears on Google Maps).
2. Use exactly the same details as `src/config/site.ts`:
   - Name: **Top Cosmetics Clinic** (Google also lets you add the Hebrew and Arabic names per language)
   - Category: **Beauty salon**; additional: Laser hair removal service, Facial spa, Massage spa
   - Address: יוחנן פאולוס השני, שפרעם — drag the pin onto the building
   - Phone: **052-732-0207**
   - Website: `https://topcosmeticsclinic.com/`
   - Hours: Mon, Tue, Thu, Fri 09:30–19:00 · Wed, Sat 09:30–13:30 · Sun closed
3. Verify the profile by the method Google offers (phone, video or postcard).
4. Add photos, the list of services and the WhatsApp link.
5. If Google ends up with a different spelling of the name or address, change `src/config/site.ts` to match it. Name, address and phone should be identical on the site, in the profile and in every directory listing.

## Turning on Google Analytics 4 (optional)

Off by default: with no ID, the built pages contain no analytics code and set no cookies.

To turn it on, add the repository variable `PUBLIC_GA4_ID` (step 4.3) and re-run the deploy. Locally, copy `.env.example` to `.env` and set the value. Once it is on, visitors see a consent banner and analytics runs only for those who accept.

There is no embedded map. The address links to Google Maps, with Waze and Google Maps buttons next to it, so nothing is loaded from Google unless the visitor clicks.

## Adding English later

1. Copy `src/i18n/he.json` to `src/i18n/en.json` and translate it.
2. In `src/i18n/index.ts`: import it, add it to `dictionaries`, and add
   `en: { dir: 'ltr', prefix: 'en', label: 'EN', name: 'English', og: 'en_US', font: 'heebo' }` to `locales`.

Pages under `/en/`, hreflang tags, the sitemap and the language switcher follow automatically. The CSS uses logical properties only, so the layout mirrors itself for LTR.

## Adding or removing a service

1. Add `{ slug, icon }` to `services` in `src/config/site.ts` (icons are listed in `src/components/Icon.astro`).
2. Add a block with the same slug under `"services"` in **both** JSON files.
3. Run `npm run check:i18n`.
