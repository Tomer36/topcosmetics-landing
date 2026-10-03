import he from './he.json';
import ar from './ar.json';

// To add English later:
//   1. copy he.json to en.json and translate it,
//   2. import it here and add it to `dictionaries`,
//   3. add `en: { dir: 'ltr', prefix: 'en', ... }` to `locales`.
// Pages, hreflang tags, the sitemap and the language switcher pick it up automatically.
// All CSS uses logical properties, so LTR needs no extra styles.
export const locales = {
  // The language with prefix '' is the one served at "/" — currently Arabic.
  // To make another language the default: give it prefix '', give the old default a
  // prefix, change `defaultLocale` below, and update LOCALES in scripts/check-site.mjs.
  he: { dir: 'rtl', prefix: 'he', label: 'עב', name: 'עברית', og: 'he_IL', font: 'heebo' },
  ar: { dir: 'rtl', prefix: '', label: 'عر', name: 'العربية', og: 'ar_IL', font: 'noto-arabic' },
} as const;

export type Locale = keyof typeof locales;
export type Dictionary = typeof he;

export const defaultLocale: Locale = 'ar';
export const localeCodes = Object.keys(locales) as Locale[];

const dictionaries: Record<Locale, Dictionary> = { he, ar: ar as Dictionary };

export function useTranslations(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export interface ServiceText {
  name: string;
  short: string;
  seo: { title: string; description: string };
  intro: string[];
  types?: { title: string; items: string[] };
  forWho: string[];
  expect: { title: string; text: string }[];
  faq: { q: string; a: string }[];
}

export function serviceText(locale: Locale, slug: string): ServiceText {
  const all = dictionaries[locale].services as Record<string, ServiceText>;
  const entry = all[slug];
  if (!entry) throw new Error(`Missing "${slug}" in src/i18n/${locale}.json → services`);
  return entry;
}

export interface MemberText {
  eyebrow: string;
  name: string;
  role: string;
  paragraphs: string[];
  points: string[];
  photoAlt: string;
}

export function memberText(locale: Locale, key: string): MemberText {
  const all = dictionaries[locale].therapists as Record<string, MemberText>;
  const entry = all[key];
  if (!entry) throw new Error(`Missing "${key}" in src/i18n/${locale}.json → therapists`);
  return entry;
}

/** Locale-aware path with a trailing slash: localePath('he', '/about/') → '/he/about/'. */
export function localePath(locale: Locale, path = '/'): string {
  const prefix = locales[locale].prefix;
  const clean = `/${path}/`.replace(/\/{2,}/g, '/');
  return prefix ? `/${prefix}${clean}` : clean;
}

/** getStaticPaths() entries for pages under src/pages/[...lang]/. */
export function localeStaticPaths() {
  return localeCodes.map((locale) => ({
    params: { lang: locales[locale].prefix || undefined },
    props: { locale },
  }));
}

/** Replace {placeholders} in a translation string. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
}
