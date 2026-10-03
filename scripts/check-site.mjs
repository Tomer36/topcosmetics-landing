// Language checks on the BUILT site (run `npm run build` first, then `npm run check:site`).
// For every page: html lang/dir, canonical, hreflang pairs + x-default, the page exists
// in every language, the language switcher points at the same page, internal links stay
// in the page's language, no text in the other language's script, unique titles, and
// WhatsApp messages written in the page's language.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ORIGIN = 'https://topcosmeticsclinic.com';
// URL prefix of each language — keep in sync with `locales` in src/i18n/index.ts.
const LOCALES = { ar: '', he: '/he' };
const DEFAULT = 'ar';
// Letters that must NOT appear on a page of that language.
const OTHER_SCRIPT = { ar: '[\\u0590-\\u05FF]+', he: '[\\u0600-\\u06FF]+' };

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );

/** Language of a site path: the prefixed language whose prefix matches, otherwise the default. */
const langOf = (path) =>
  Object.keys(LOCALES).find((code) => LOCALES[code] && `${path}/`.startsWith(`${LOCALES[code]}/`)) ?? DEFAULT;

const pages = walk('dist').filter((f) => f.endsWith('.html'));
const titles = new Map();
let bad = 0;

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const rel = file.split('\\').join('/').replace(/^dist/, '').replace(/index\.html$/, '');
  if (rel.includes('404')) continue;

  const lang = langOf(rel);
  const otherLang = Object.keys(LOCALES).find((code) => code !== lang);
  const bare = rel.slice(LOCALES[lang].length); // the path without the language prefix
  const other = LOCALES[otherLang] + bare;
  const defaultPath = LOCALES[DEFAULT] + bare;
  const errs = [];

  const root = html.match(/<html lang="(\w+)" dir="(\w+)"/) ?? [];
  if (root[1] !== lang || root[2] !== 'rtl') errs.push(`html lang/dir is ${root[1]}/${root[2]}`);

  const canonical = (html.match(/rel="canonical" href="([^"]+)"/) ?? [])[1];
  if (canonical !== ORIGIN + rel) errs.push(`canonical is ${canonical}`);

  for (const [code, path] of [[lang, rel], [otherLang, other]]) {
    if (!html.includes(`hreflang="${code}" href="${ORIGIN}${path}"`)) errs.push(`missing hreflang ${code}`);
  }
  if (!html.includes(`hreflang="x-default" href="${ORIGIN}${defaultPath}"`)) errs.push('x-default wrong');
  if (!existsSync(join('dist', other, 'index.html'))) errs.push(`no ${otherLang} version`);
  if (!html.includes(`href="${other}" lang="${otherLang}"`)) errs.push('language switcher target wrong');

  const internal = [...html.matchAll(/<a\b[^>]*href="(\/[^"#]*)[^"]*"[^>]*>/g)].filter(
    (m) => !m[0].includes('hreflang=') && !m[1].startsWith('/_astro'),
  );
  const crossing = internal.filter((m) => langOf(m[1]) !== lang);
  if (crossing.length) errs.push(`links to the other language: ${[...new Set(crossing.map((m) => m[1]))].join(', ')}`);

  const visible = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<a\b[^>]*hreflang[\s\S]*?<\/a>/g, '')
    .replace(/<[^>]+>/g, ' ');
  const foreign = visible.match(new RegExp(OTHER_SCRIPT[lang], 'g'));
  if (foreign) errs.push(`text in the other script: ${[...new Set(foreign)].slice(0, 6).join(' ')}`);
  if (/\bundefined\b|\{\w+\}/.test(visible)) errs.push('unfilled placeholder or "undefined" in text');

  const title = (html.match(/<title>([^<]*)/) ?? [])[1];
  if (titles.has(title)) errs.push(`same title as ${titles.get(title)}`);
  titles.set(title, rel);

  const messages = [...html.matchAll(/wa\.me\/\d+\?text=([^"]+)/g)].map((m) => decodeURIComponent(m[1]));
  if (!messages.length) errs.push('no WhatsApp link');
  if (messages.some((m) => new RegExp(OTHER_SCRIPT[lang]).test(m))) errs.push('WhatsApp message in the wrong language');
  if (messages.some((m) => /\{\w+\}/.test(m))) errs.push('WhatsApp message has an unfilled placeholder');

  if (errs.length) {
    bad += 1;
    console.error(`${rel}\n  - ${errs.join('\n  - ')}`);
  }
}

console.log(`${pages.length} pages checked, ${bad} with problems.`);
process.exit(bad ? 1 : 0);
