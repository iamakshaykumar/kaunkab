// Usage: node scripts/optimize-images.mjs
// 1. Creates responsive variants used by srcset:
//      lekh/<slug>-md.webp (960x540)  — from lekh/<slug>.webp
//      series|kaal/<id>-sm.webp (640w) — page-hero mobile variant
//      hero-sm.webp (800w)            — homepage hero mobile variant
// 2. Re-encodes full-size WebP files over 300 KB at a lower quality,
//    keeping the result only when it is actually smaller.
// Safe to re-run: existing variants are skipped.
import sharp from 'sharp';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

sharp.cache(false);
const ROOT = 'public/images';
const LIMIT = 300 * 1024;
const log = [];
const kb = (p) => `${(statSync(p).size / 1024).toFixed(0)} KB`;

async function variant(src, out, width) {
  if (existsSync(out)) return;
  await sharp(readFileSync(src)).resize({ width, withoutEnlargement: true }).webp({ quality: 72, effort: 6 }).toFile(out);
  log.push(`+ ${out} (${kb(out)})`);
}

async function shrink(path) {
  const input = readFileSync(path);
  if (input.length <= LIMIT) return;
  const out = await sharp(input).webp({ quality: 70, effort: 6 }).toBuffer();
  if (out.length < input.length) {
    writeFileSync(path, out);
    log.push(`~ ${path} ${(input.length / 1024).toFixed(0)} KB -> ${kb(path)}`);
  }
}

const isBase = (f) => f.endsWith('.webp') && !/-(sm|md)\.webp$/.test(f);

for (const f of readdirSync(join(ROOT, 'lekh')).filter(isBase)) {
  const p = join(ROOT, 'lekh', f);
  await shrink(p);
  await variant(p, p.replace(/\.webp$/, '-md.webp'), 960);
}
for (const dir of ['series', 'kaal']) {
  for (const f of readdirSync(join(ROOT, dir)).filter(isBase)) {
    const p = join(ROOT, dir, f);
    await shrink(p);
    await variant(p, p.replace(/\.webp$/, '-sm.webp'), 640);
  }
}
if (existsSync(join(ROOT, 'hero.webp'))) await variant(join(ROOT, 'hero.webp'), join(ROOT, 'hero-sm.webp'), 800);

console.log(log.join('\n') || 'Nothing to do.');
console.log(`${log.length} change(s).`);
