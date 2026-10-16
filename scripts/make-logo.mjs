// Derives the logo files the site uses from the original logo artwork:
//   src/assets/photos/TopCosmetics-logo-horizontal.png   → src/assets/logo-full.png         (transparent margins trimmed; header, footer)
//                                                        → public/og-image.jpg              (1200×630 share image)
//   src/assets/photos/TopCosmetics-logo-circle-bold.png  → public/favicon.png, public/apple-touch-icon.png
// The round logo is already drawn with bold lines, so the tab icons are a plain resize.
// Run with: npm run logo   (again whenever the logo artwork changes)
import sharp from 'sharp';

const horizontal = 'src/assets/photos/TopCosmetics-logo-horizontal.png';
const circle = 'src/assets/photos/TopCosmetics-logo-circle-bold.png';

await sharp(horizontal).trim().png().toFile('src/assets/logo-full.png');

const ogLogo = await sharp(horizontal).trim().resize({ width: 1000 }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#FFFFFF' } })
  .composite([{ input: ogLogo, gravity: 'centre' }])
  .jpeg({ quality: 88 })
  .toFile('public/og-image.jpg');

// Browser-tab / home-screen icons: the round logo on its white disc, transparent corners.
async function icon(size, file) {
  await sharp(circle)
    .trim()
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(file);
}
await icon(96, 'public/favicon.png');
// iOS fills transparent areas with black, so the home-screen icon gets a white background.
await sharp(circle)
  .trim()
  .resize(160, 160)
  .extend({ top: 10, bottom: 10, left: 10, right: 10, background: '#FFFFFF' })
  .flatten({ background: '#FFFFFF' })
  .png()
  .toFile('public/apple-touch-icon.png');

console.log('Logo files written.');
