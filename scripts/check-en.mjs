// Checks English article/series translations against the Hindi originals.
// Usage: node scripts/check-en.mjs [slug ...]   (no args = every file in src/content/articles/en)
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const HI = 'src/content/articles/hi';
const EN = 'src/content/articles/en';
const DEV = /[ऀ-ॿ]/;

function parse(path) {
  const txt = readFileSync(path, 'utf8');
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error('no frontmatter');
  return { fm: yaml.load(m[1]), body: m[2] };
}

const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : existsSync(EN) ? readdirSync(EN).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)) : [];
let bad = 0;
for (const slug of slugs) {
  const errs = [];
  const enPath = `${EN}/${slug}.md`;
  if (!existsSync(enPath)) { console.log(`MISSING ${slug}`); bad++; continue; }
  let hi, en;
  try { hi = parse(`${HI}/${slug}.md`); } catch (e) { errs.push('hi: ' + e.message); }
  try { en = parse(enPath); } catch (e) { errs.push('YAML/frontmatter error: ' + e.message); }
  if (hi && en) {
    const h = hi.fm, f = en.fm;
    const same = (k) => JSON.stringify(h[k] ?? null) === JSON.stringify(f[k] ?? null);
    for (const k of ['era', 'series', 'wikidata', 'autolink']) if (!same(k)) errs.push(`${k} must be identical to Hindi`);
    for (const k of ['start', 'end', 'month', 'day', 'circa']) if ((h.kab?.[k] ?? null) !== (f.kab?.[k] ?? null)) errs.push(`kab.${k} must be identical`);
    if (h.kab?.label && !f.kab?.label) errs.push('kab.label missing (translate it)');
    for (const k of ['published', 'updated']) if (String(h[k] ?? '') !== String(f[k] ?? '')) errs.push(`${k} must be identical`);
    for (const k of Object.keys(h)) if (!(k in f)) errs.push(`missing key: ${k}`);
    for (const k of Object.keys(f)) if (!(k in h)) errs.push(`extra key not in Hindi: ${k}`);
    if (!f.title || !f.saar || String(f.saar).length < 10) errs.push('title/saar missing or too short');
    if (f.description && String(f.description).length > 170) errs.push(`description is ${String(f.description).length} chars, max 170`);
    if ((h.sources?.length ?? 0) !== (f.sources?.length ?? 0)) errs.push('sources count differs');
    h.sources?.forEach((s, i) => { if ((s.url ?? null) !== (f.sources?.[i]?.url ?? null)) errs.push(`sources[${i}].url must be identical`); });
    if ((h.quiz?.length ?? 0) !== (f.quiz?.length ?? 0)) errs.push('quiz count differs');
    h.quiz?.forEach((q, i) => {
      const e = f.quiz?.[i];
      if (!e) return;
      if (e.answer !== q.answer) errs.push(`quiz[${i}].answer must be identical`);
      if (e.options?.length !== q.options.length) errs.push(`quiz[${i}].options count differs`);
    });
    if ((h.didYouKnow?.length ?? 0) !== (f.didYouKnow?.length ?? 0)) errs.push('didYouKnow count differs');
    if ((h.kaun?.length ?? 0) !== (f.kaun?.length ?? 0)) errs.push('kaun count differs');
    if ((h.kahan?.length ?? 0) !== (f.kahan?.length ?? 0)) errs.push('kahan count differs');
    if (h.image && (f.image?.src !== h.image.src)) errs.push('image.src must be identical');
    if (h.tags && !Array.isArray(f.tags)) errs.push('tags must be a list');
    if (f.tags?.some((t) => typeof t !== 'string')) errs.push('tags must all be strings');
    const hHeads = (hi.body.match(/^#{2,4} /gm) || []).length;
    const fHeads = (en.body.match(/^#{2,4} /gm) || []).length;
    if (hHeads !== fHeads) errs.push(`heading count ${fHeads} != Hindi ${hHeads}`);
    if (en.body.trim().length < hi.body.trim().length * 0.35) errs.push('body looks too short / incomplete');
    // Devanagari leftovers (sources titles may legitimately keep a Hindi book name)
    const { sources, ...rest } = f;
    if (DEV.test(JSON.stringify(rest)) || DEV.test(en.body)) errs.push('Devanagari text left untranslated');
  }
  if (errs.length) { bad++; console.log(`FAIL ${slug}\n  - ${errs.join('\n  - ')}`); }
}
console.log(`${slugs.length - bad}/${slugs.length} OK`);
process.exit(bad ? 1 : 0);
