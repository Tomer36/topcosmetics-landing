// Derives the logo files the site uses from the original logo artwork:
//   src/assets/photos/Topcosmeticslogo_flat.png    → src/assets/logo-full.png      (transparent margins trimmed; footer, founder section)
//                                                  → src/assets/logo-wordmark.png  ("TOP COSMETICS" lettering only; header)
//                                                  → public/og-image.jpg           (1200×630 share image)
//   src/assets/photos/Topcosmeticslogo_circle.png  → src/assets/logo-circle.png    (original artwork, trimmed; header)
//                                                  → public/favicon.png, public/apple-touch-icon.png
// The logo is a fine line drawing, so for the tiny browser-tab icons the lines are
// thickened and drawn in the brand colour; otherwise they vanish at 16–32px.
// Run with: npm run logo   (again whenever the logo artwork changes)
import sharp from 'sharp';

const flat = 'src/assets/photos/Topcosmeticslogo_flat.png';
const circle = 'src/assets/photos/Topcosmeticslogo_circle.png';

await sharp(flat).trim().png().toFile('src/assets/logo-full.png');

// The lettering sits in this band of the 1563×1563 artwork, left of the face drawing.
const band = await sharp(flat).extract({ left: 0, top: 780, width: 1000, height: 180 }).png().toBuffer();
await sharp(band).trim().png().toFile('src/assets/logo-wordmark.png');

const ogLogo = await sharp(flat).trim().resize({ height: 520 }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#FFFFFF' } })
  .composite([{ input: ogLogo, gravity: 'centre' }])
  .jpeg({ quality: 88 })
  .toFile('public/og-image.jpg');

// The round logo redrawn with thicker lines on a transparent background — used only
// for the browser-tab icons, where the original hairlines all but disappear.
async function lineArt(thicken, colour) {
  const inner = 480;
  // sharp runs the operations of one pipeline in its own fixed order, so each step is a separate pipeline.
  // 1. the artwork has an opaque white background, so the lines are found by colour
  const lines = await sharp(circle)
    .trim()
    .resize({ width: inner, height: inner, fit: 'contain', background: '#FFFFFF' })
    .flatten({ background: '#FFFFFF' })
    .greyscale()
    .negate({ alpha: false })
    .png()
    .toBuffer();
  const solid = await sharp(lines).threshold(40).png().toBuffer();
  // 2. thicken them
  const blurred = await sharp(solid).blur(thicken).png().toBuffer();
  const mask = await sharp(blurred).threshold(28).extractChannel(0).png().toBuffer();
  // 3. colour them
  return sharp({ create: { width: inner, height: inner, channels: 3, background: colour } })
    .joinChannel(mask)
    .png()
    .toBuffer();
}

// Header logo: the original round artwork, untouched (only the empty margin is trimmed).
await sharp(circle).trim().png().toFile('src/assets/logo-circle.png');

// Browser-tab / home-screen icons: brand colour on white.
async function icon(size, thicken, file) {
  const canvas = await sharp({ create: { width: 512, height: 512, channels: 3, background: '#FFFFFF' } })
    .composite([{ input: await lineArt(thicken, '#9C3D72'), gravity: 'centre' }])
    .png()
    .toBuffer();
  await sharp(canvas).resize(size, size).png().toFile(file);
}
await icon(96, 5, 'public/favicon.png');
await icon(180, 2.5, 'public/apple-touch-icon.png');

console.log('Logo files written.');
