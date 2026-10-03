// Looks up a photo in src/assets/team/ by file name (without extension, case-insensitive).
// Returns undefined when the file does not exist, so pages can fall back to an icon.
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/team/*.{jpg,jpeg,png,webp}', { eager: true });

export function teamPhoto(name: string | undefined): ImageMetadata | undefined {
  if (!name) return undefined;
  const wanted = name.toLowerCase();
  return Object.entries(files).find(([file]) => file.split('/').pop()?.split('.')[0].toLowerCase() === wanted)?.[1]
    .default;
}
