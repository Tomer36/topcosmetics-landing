// Built-output regression checks. No server, accounts, payment API or network.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const read = (path) => readFileSync(path, 'utf8');
const sitemap = read('dist/sitemap.xml');
for (const [locale, prefix] of [['ar', ''], ['he', '/he']]) {
  const path = `${prefix}/deposit-terms/`;
  const doc = JSON.parse(read(`src/i18n/${locale}.json`)).legal['deposit-terms'];
  const html = read(join('dist', path, 'index.html'));
  assert.ok(html.includes(`<h1>${doc.title}</h1>`), `${path}: translated title`);
  assert.ok(html.includes(`https://topcosmeticsclinic.com${path}`), `${path}: canonical URL`);
  assert.ok(sitemap.includes(`<loc>https://topcosmeticsclinic.com${path}</loc>`), `${path}: sitemap entry`);
  assert.ok(html.includes(doc.updated), `${path}: policy version date`);
  for (const section of doc.sections) assert.ok(html.includes(`<h2>${section.title}</h2>`), `${path}: ${section.title}`);
  const cancellation = doc.sections[2].paragraphs.join(' ');
  assert.match(cancellation, locale === 'he' ? /לפחות 24 שעות לפני תחילת התור/ : /قبل موعد بدء العلاج بـ24 ساعة على الأقل/, `${path}: inclusive 24-hour cancellation rule`);
  assert.match(cancellation, locale === 'he' ? /זכאית להחזר הערבון/ : /يحقّ لك استرداد العربون/, `${path}: refund eligibility`);
  assert.ok(html.includes(`https://wa.me/972527320207?text=${encodeURIComponent(doc.contactMessage)}`), `${path}: cancellation/refund contact`);
  assert.ok(html.includes('href="tel:+972527320207"'), `${path}: phone contact`);
  assert.ok(!html.includes('{phone}'), `${path}: no unfilled phone placeholders`);
  assert.ok(!html.includes('noindex'), `${path}: publicly discoverable`);
}

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
  entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
for (const file of walk('dist').filter((path) => path.endsWith('.html') && !path.includes('404'))) {
  const html = read(file);
  const locale = html.includes('<html lang="he"') ? 'he' : 'ar';
  const path = locale === 'he' ? '/he/deposit-terms/' : '/deposit-terms/';
  const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] || '';
  assert.ok(footer.includes(`href="${path}"`), `${file}: localized deposit-terms footer link`);
}
console.log('Deposit terms: both languages, sections, version date, contact links, footer and sitemap OK.');
