// Runs after `astro build`. Removes original full-size photos that the build copied
// into dist/_astro/ but that no page actually uses (pages use the resized WebP
// versions). Keeps the FTP upload small — about 3 MB instead of 30 MB.
import { readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );

const text = walk('dist')
  .filter((f) => /\.(html|xml|css|js)$/.test(f))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');

let removed = 0;
let bytes = 0;
for (const name of readdirSync('dist/_astro')) {
  if (!/\.(jpe?g|png|webp|avif)$/i.test(name)) continue;
  if (text.includes(`/_astro/${name}`)) continue;
  const file = join('dist/_astro', name);
  bytes += statSync(file).size;
  rmSync(file);
  removed += 1;
}
console.log(`prune-dist: removed ${removed} unused image(s), ${(bytes / 1048576).toFixed(1)} MB`);
