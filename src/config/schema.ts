// schema.org JSON-LD builders. The business node is built from src/config/site.ts
// only, so name / address / phone / hours / geo are byte-identical on every page
// and in every language.
import { site } from './site';

const businessId = `${site.url}/#business`;

export function businessSchema() {
  const sameAs = [...Object.values(site.social), site.googleProfile].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    '@id': businessId,
    name: site.legalName,
    alternateName: site.alternateNames,
    url: `${site.url}/`,
    image: `${site.url}${site.ogImage}`,
    telephone: site.phone.e164,
    foundingDate: String(site.foundingYear),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    hasMap: site.maps.google,
    openingHoursSpecification: site.hours
      .filter((h) => h.open)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${h.schema}`,
        opens: h.open,
        closes: h.close,
      })),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function serviceSchema(opts: { name: string; description: string; url: string; lang: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    serviceType: opts.name,
    description: opts.description,
    url: opts.url,
    inLanguage: opts.lang,
    provider: { '@id': businessId },
    areaServed: { '@type': 'City', name: site.address.city },
  };
}

export function personSchema(opts: { name: string; jobTitle: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: opts.name,
    jobTitle: opts.jobTitle,
    url: opts.url,
    worksFor: { '@id': businessId },
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
