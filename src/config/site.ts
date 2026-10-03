// Single source of truth for business details (name, address, phone, hours, geo).
// These values feed the visible pages AND the schema.org JSON-LD, so they stay
// identical everywhere. Keep them in sync with the Google Business Profile.

export const site = {
  url: 'https://topcosmeticsclinic.com',
  // Canonical business name used in structured data on every page.
  legalName: 'Top Cosmetics Clinic',
  alternateNames: ['טופ קוסמטיקס', 'Top Cosmetics'],
  foundingYear: 2009,

  phone: {
    display: '052-732-0207',
    e164: '+972527320207',
  },
  // wa.me expects the international number without "+" and without the leading 0.
  whatsapp: '972527320207',

  // Canonical postal address (used in JSON-LD on all language versions).
  address: {
    street: 'יוחנן פאולוס השני',
    city: 'שפרעם',
    region: 'מחוז הצפון',
    country: 'IL',
  },
  // TODO: replace with the exact pin of the clinic (currently the street's map centre).
  geo: { lat: 32.7986586, lng: 35.1770181 },

  maps: {
    query: 'יוחנן פאולוס השני, שפרעם',
    google:
      'https://www.google.com/maps/search/?api=1&query=%D7%99%D7%95%D7%97%D7%A0%D7%9F+%D7%A4%D7%90%D7%95%D7%9C%D7%95%D7%A1+%D7%94%D7%A9%D7%A0%D7%99%2C+%D7%A9%D7%A4%D7%A8%D7%A2%D7%9D',
    waze: 'https://waze.com/ul/hsvc48d24g',
  },

  // The clinic's Google Business Profile page (reviews, photos, directions).
  googleProfile: 'https://share.google/hfwirWEPWsSqrOS1o',

  // Leave a value empty to hide it.
  social: {
    instagram: 'https://www.instagram.com/topcosmetics09',
    facebook: 'https://www.facebook.com/topcosmetics.abirshehab',
  },
  instagramHandle: '@topcosmetics09',

  // Sunday-first week. `null` = closed.
  hours: [
    { day: 'su', schema: 'Sunday', open: null, close: null },
    { day: 'mo', schema: 'Monday', open: '09:30', close: '19:00' },
    { day: 'tu', schema: 'Tuesday', open: '09:30', close: '19:00' },
    { day: 'we', schema: 'Wednesday', open: '09:30', close: '13:30' },
    { day: 'th', schema: 'Thursday', open: '09:30', close: '19:00' },
    { day: 'fr', schema: 'Friday', open: '09:30', close: '19:00' },
    { day: 'sa', schema: 'Saturday', open: '09:30', close: '13:30' },
  ],

  ogImage: '/og-image.jpg',

  // "Powered by" credit at the bottom of the footer.
  credit: { name: 'Web Reflect', url: 'https://web-reflect.com' },
} as const;

// Order here = order on the home page, footer and sitemap.
// Texts for each slug live in src/i18n/*.json under "services".
export const services = [
  { slug: 'laser-hair-removal', icon: 'laser' },
  { slug: 'facial-treatments', icon: 'face' },
  { slug: 'hydrafacial', icon: 'hydra' },
  { slug: 'mesotherapy', icon: 'vial' },
  { slug: 'massage', icon: 'stones' },
  { slug: 'eyebrow-shaping', icon: 'brow' },
  { slug: 'botox', icon: 'syringe' },
  { slug: 'dermal-fillers', icon: 'lips' },
] as const;

// The team, in display order. Each member gets a card in the team section and
// their own page at /team/<key>/.
//   key      = entry under "therapists" in src/i18n/*.json (and the page address)
//   photo    = file name in src/assets/team/ (without extension, case-insensitive);
//              until a photo exists, a placeholder icon is shown
//   services = slugs of the treatments this person performs; they are listed on the
//              person's page, and the person is shown on those treatment pages
// To add someone: add a line here and a matching block in both JSON files.
export const team = [
  { key: 'abir', photo: 'Abir', services: ['facial-treatments', 'laser-hair-removal'] },
  { key: 'lara', photo: 'Lara', services: ['facial-treatments', 'massage'] },
  { key: 'basel', photo: 'Basel', services: ['botox', 'dermal-fillers'] },
] as const;

// Legal pages (/accessibility/, /privacy/, /terms/). Texts: "legal" in src/i18n/*.json.
export const legalPages = ['accessibility', 'privacy', 'terms'] as const;

export type ServiceSlug = (typeof services)[number]['slug'];

export function whatsappLink(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const telLink = `tel:${site.phone.e164}`;
