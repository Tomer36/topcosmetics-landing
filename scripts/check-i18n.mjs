// Verifies that every translation file has exactly the same keys as he.json.
// Run with: npm run check:i18n
import { readFile, readdir } from 'node:fs/promises';

const dir = new URL('../src/i18n/', import.meta.url);
const load = async (name) => JSON.parse(await readFile(new URL(name, dir), 'utf8'));

function keys(value, prefix = '') {
  if (Array.isArray(value)) return value.flatMap((v, i) => keys(v, `${prefix}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

const base = new Set(keys(await load('he.json')).filter((k) => !k.startsWith('_meta')));
const files = (await readdir(dir)).filter((f) => f.endsWith('.json') && f !== 'he.json');
let failed = false;

for (const file of files) {
  const other = new Set(keys(await load(file)).filter((k) => !k.startsWith('_meta')));
  const missing = [...base].filter((k) => !other.has(k));
  const extra = [...other].filter((k) => !base.has(k));
  if (missing.length || extra.length) {
    failed = true;
    console.error(`\n${file}`);
    missing.forEach((k) => console.error(`  missing: ${k}`));
    extra.forEach((k) => console.error(`  extra:   ${k}`));
  } else {
    console.log(`${file}: OK (${other.size} strings)`);
  }
}

process.exit(failed ? 1 : 0);
