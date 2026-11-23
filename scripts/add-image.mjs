// Usage: npm run image -- "<source image>" <slot>
//   slot examples: lekh/vijaynagar-samrajya | kaal/prachin | series/azadi-ki-raah | hero | og-default
// Resizes + converts to the right size/format under public/images/.
import sharp from 'sharp';
import { mkdirSync, statSync } from 'node:fs';
import { dirname } from 'node:path';

const [src, slot] = process.argv.slice(2);
if (!src || !slot) {
  console.error('Usage: npm run image -- "<source image>" <slot>   (e.g. lekh/maurya-samrajya)');
  process.exit(1);
}

const kind = slot.split('/')[0];
const SIZES = {
  lekh: [1600, 900],
  kaal: [1200, 800],
  series: [1200, 675],
  hero: [1672, 941],
  'og-default': [1200, 630],
};
const size = SIZES[kind];
if (!size) {
  console.error(`Unknown slot "${slot}". Use one of: ${Object.keys(SIZES).join(', ')}`);
  process.exit(1);
}

const outputs = [];
const write = async (path, w, h, jpeg = false) => {
  mkdirSync(dirname(path), { recursive: true });
  const img = sharp(src).resize(w, h, { fit: 'cover', position: 'attention' });
  await (jpeg ? img.jpeg({ quality: 80, mozjpeg: true }) : img.webp({ quality: 78, effort: 6 })).toFile(path);
  outputs.push(`${(statSync(path).size / 1024).toFixed(0)} KB  ${path}`);
};

if (kind === 'og-default') {
  await write('public/images/og-default.jpg', ...size, true);
} else {
  await write(`public/images/${slot}.webp`, ...size);
  if (kind === 'lekh') await write(`public/images/${slot}-sm.webp`, 640, 360);
}
console.log(outputs.join('\n'));
