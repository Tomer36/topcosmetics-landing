// /sitemap.xml — every page in every language, with hreflang alternates.
import type { APIRoute } from 'astro';
import { legalPages, services, site, team } from '../config/site';
import { defaultLocale, localeCodes, localePath } from '../i18n';

const paths = [
  '/',
  '/about/',
  '/gallery/',
  '/contact/',
  ...services.map((s) => `/services/${s.slug}/`),
  ...team.map((m) => `/team/${m.key}/`),
  ...legalPages.map((p) => `/${p}/`),
];
const abs = (p: string) => new URL(p, site.url).href;

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = paths.flatMap((path) =>
    localeCodes.map((locale) => {
      const alternates = [
        ...localeCodes.map(
          (code) => `    <xhtml:link rel="alternate" hreflang="${code}" href="${abs(localePath(code, path))}"/>`,
        ),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(localePath(defaultLocale, path))}"/>`,
      ].join('\n');
      return `  <url>\n    <loc>${abs(localePath(locale, path))}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternates}\n  </url>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
