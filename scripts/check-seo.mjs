// Validate the actual deploy artifact: sitemap coverage, indexability, JSON-LD,
// and local link/asset targets. No external services or extra dependencies.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
const root = 'dist';
const origin = 'https://topcosmeticsclinic.com';
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
  entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
const files = walk(root).filter((file) => file.endsWith('.html'));
const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
assert.equal(new Set(urls).size, urls.length, 'sitemap URLs must be unique');
const publicUrls = [];
let checkedLinks = 0;
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const path = '/' + relative(root, file).replaceAll('\\', '/').replace(/index\.html$/, '');
  if (path === '/404.html') {
    assert.match(html, /name="robots" content="noindex, follow"/, '404 must be noindex');
    assert.ok(!html.includes('rel="canonical"'), '404 must not canonicalize to the home page');
  } else {
    publicUrls.push(origin + path);
    assert.ok(!/name="robots"[^>]*noindex/.test(html), `${path}: indexable`);
    assert.equal([...html.matchAll(/rel="canonical"/g)].length, 1, `${path}: one canonical`);
    assert.match(html, /<meta name="description" content="[^"]+"/, `${path}: description`);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${path}: one H1`);
  }
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => JSON.parse(m[1]));
  assert.ok(schemas.some((s) => s['@type'] === 'BeautySalon'), `${path}: clinic schema`);
  for (const schema of schemas) {
    assert.equal(schema['@context'], 'https://schema.org', `${path}: schema context`);
    if (schema['@type'] === 'BeautySalon') {
      assert.equal(schema.url, origin + '/', `${path}: business URL`);
      assert.ok(!schema.geo && !schema.foundingDate && !schema.aggregateRating, `${path}: no unverified location, founding date or rating`);
    }
  }
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    assert.ok(!/^(?:javascript:|http:\/\/)/i.test(value), `${path}: insecure or script URL ${value}`);
    if (/^(?:data:|tel:|mailto:)/i.test(value)) continue;
    const target = new URL(value, origin + path);
    if (target.origin !== origin) continue;
    const local = join(root, decodeURIComponent(target.pathname));
    assert.ok(existsSync(local), `${path}: missing local target ${target.pathname}`);
    if (statSync(local).isDirectory()) assert.ok(existsSync(join(local, 'index.html')), `${path}: missing page ${target.pathname}`);
    checkedLinks++;
  }
}
assert.deepEqual([...urls].sort(), publicUrls.sort(), 'sitemap must contain exactly the indexable built pages');
assert.match(readFileSync(join(root, 'robots.txt'), 'utf8'), /User-agent: \*\nAllow: \/\n\nSitemap: https:\/\/topcosmeticsclinic\.com\/sitemap\.xml/);
console.log(`SEO: ${publicUrls.length} indexable pages, ${urls.length} sitemap URLs, ${checkedLinks} local links/assets, JSON-LD and 404 metadata OK.`);
