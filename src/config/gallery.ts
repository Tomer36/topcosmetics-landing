// The photo gallery is simply every image in src/assets/gallery/.
//
// To add a photo: drop a JPG / PNG / WebP file into that folder. That is all.
//   - Order = file name order, so start names with a number: "13-new-room.jpg".
//   - The home page shows the first six; the gallery page shows all of them.
//   - Description (alt text): add an entry under "gallery" → "alts" in
//     src/i18n/he.json and ar.json, keyed by the file name without the number and
//     extension ("13-new-room.jpg" → "new-room"). Without one, a general
//     description is used.
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/gallery/*.{jpg,jpeg,png,webp}', {
  eager: true,
});

export const galleryPhotos = Object.entries(files)
  .map(([path, mod]) => {
    const file = path.split('/').pop() ?? '';
    return {
      file,
      key: file.replace(/\.\w+$/, '').replace(/^\d+[-_ ]*/, ''),
      image: mod.default,
    };
  })
  .sort((a, b) => a.file.localeCompare(b.file, 'en', { numeric: true }));
