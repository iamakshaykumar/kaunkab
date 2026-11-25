// Remark plugin: links the first in-body mention of another article's subject.
//
// Link terms come from each article's title: the part before " — " or ":",
// without a trailing "(…)" date, plus the part before " और " (so
// "अशोक और कलिंग युद्ध" yields both the full phrase and "अशोक").
// Only the first mention of each target is linked, at most MAX_LINKS per
// article, never inside headings, existing links or code.
// An article can opt out with `autolink: false` in its frontmatter.
import { readdirSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';

const DIR = './src/content/articles/hi';
const MAX_LINKS = 8;
const MIN_LEN = 3;
/** Terms too generic (or too ambiguous) to link to a single article. */
const STOP = new Set([
  'स्वतंत्रता', 'उपनिषद', 'भारत', 'पंचतंत्र', 'बौद्ध', 'पुरी', 'मदुरै', 'मैसूर', 'जहाँगीर', 'लाल क़िले',
  'देशी रियासतों', 'भाषाई राज्यों', 'स्त्री शिक्षा', 'जोधपुर-मेहरानगढ़', 'शून्य', 'लंदन', 'दीवानी', 'पंजाब',
  'मालवा', 'गोंडवाना', 'महाजनपदों', 'संस्कृत साहित्य', 'अर्थशास्त्र', 'उनके प्रशासनिक सुधार',
]);
/** Hand-added names that the titles do not yield on their own: term -> article slug. */
const ALIASES = {
  'शिवाजी': 'shivaji-ka-rajyabhishek',
  'शिवाजी महाराज': 'shivaji-ka-rajyabhishek',
  'प्लासी के युद्ध': 'plassey-ki-ladai',
  'प्लासी का युद्ध': 'plassey-ki-ladai',
  'बक्सर के युद्ध': 'buxar-ki-ladai',
  'बक्सर का युद्ध': 'buxar-ki-ladai',
  'सिराजुद्दौला': 'plassey-ki-ladai',
};
/** Honorifics stripped to give a bare-name alias ("संत कबीर" -> "कबीर"). */
const HONORIFIC = /^(डॉ\.|लॉर्ड|महात्मा|सम्राट|महाराजा|महारानी|पेशवा|संत|स्वामी|छत्रपति|सुल्तान|रानी|राजा|बाबू|सवाई|श्रीमंत|पंडिता|ख़्वाजा|सर|गुरु)\s+/;
const SKIP = new Set(['heading', 'link', 'linkReference', 'code', 'inlineCode', 'html', 'definition']);

const clean = (s) =>
  s
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim();

/** Exported for tests. */
export function termsForTitle(title) {
  const main = clean(title.split(/\s+—\s+|:\s/)[0]);
  const out = [main];
  const add = (t) => {
    t = clean(t);
    if (t && !out.includes(t)) out.push(t);
  };
  for (const seg of main.split(/\s+और\s+/)) {
    add(seg);
    // "प्लासी का युद्ध" is usually written in the oblique case: "प्लासी के युद्ध"
    const obl = seg.match(/^(.+) का (\S+)$/);
    if (obl && !obl[2].endsWith('ा')) add(`${obl[1]} के ${obl[2]}`);
    // subject of "X का/की/के Y": "तैमूर का आक्रमण" -> "तैमूर"
    const subj = seg.match(/^(.+?) (?:का|की|के) \S/);
    if (subj && [...subj[1]].length >= 4) add(subj[1]);
  }
  for (const t of [...out]) {
    const bare = t.replace(HONORIFIC, '');
    if (bare !== t && [...bare].length >= 4) add(bare);
  }
  return out.filter((t) => [...t].length >= MIN_LEN && !STOP.has(t));
}

/** Entries are [slug, title, firstPerson?]. term -> slug. A term claimed by several articles goes to the one whose whole title it is, else it is dropped. */
export function buildTermMap(titles) {
  const claims = new Map();
  const claim = (t, slug, exact) => {
    if (!claims.has(t)) claims.set(t, []);
    claims.get(t).push({ slug, exact });
  };
  for (const [slug, title, person] of titles) {
    const terms = termsForTitle(title);
    terms.forEach((t, i) => claim(t, slug, i === 0));
    // the first person in `kaun`, when the title names them, is the article's subject
    // (gives spelling variants such as "सम्राट अशोक" for a title that says "अशोक")
    if (person) {
      const bare = person.replace(HONORIFIC, '');
      if (title.includes(bare.split(/\s+/)[0])) {
        for (const t of [person, bare]) {
          if ([...t].length >= 4 && !STOP.has(t) && !terms.includes(t)) claim(t, slug, false);
        }
      }
    }
  }
  for (const [t, slug] of Object.entries(ALIASES)) if (titles.some(([s]) => s === slug)) claim(t, slug, true);
  const map = new Map();
  for (const [term, list] of claims) {
    const slugs = new Set(list.map((c) => c.slug));
    if (slugs.size === 1) map.set(term, list[0].slug);
    else {
      const exact = list.filter((c) => c.exact);
      if (exact.length === 1) map.set(term, exact[0].slug);
    }
  }
  return map;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function readTitles() {
  const titles = [];
  try {
    for (const f of readdirSync(DIR).filter((x) => x.endsWith('.md'))) {
      const fm = readFileSync(`${DIR}/${f}`, 'utf8').split(/^---\s*$/m)[1] ?? '';
      const m = fm.match(/^title:\s*(.+)$/m);
      const person = fm.match(/^kaun:\s*\[([^,\]]+)/m)?.[1].trim().replace(/^["']|["']$/g, '');
      if (m) titles.push([f.slice(0, -3), m[1].trim(), person]);
    }
  } catch {}
  return titles;
}

let cache;
function getIndex() {
  if (cache) return cache;
  const map = buildTermMap(readTitles());
  const terms = [...map.keys()].sort((a, b) => b.length - a.length);
  const re = terms.length
    ? new RegExp(`(?<![\\p{L}\\p{M}])(${terms.map(escapeRe).join('|')})(?![\\p{L}\\p{M}])`, 'gu')
    : null;
  return (cache = { map, re });
}

export function linkTree(tree, selfSlug, index = getIndex()) {
  const { map, re } = index;
  if (!re) return;
  const used = new Set([selfSlug]);
  let count = 0;

  const walk = (node) => {
    if (count >= MAX_LINKS || !node.children) return;
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (SKIP.has(child.type)) continue;
      if (child.type !== 'text') {
        walk(child);
        continue;
      }
      const parts = [];
      let last = 0;
      re.lastIndex = 0;
      let m;
      while (count < MAX_LINKS && (m = re.exec(child.value))) {
        const slug = map.get(m[1]);
        if (!slug || used.has(slug)) continue;
        used.add(slug);
        count++;
        if (m.index > last) parts.push({ type: 'text', value: child.value.slice(last, m.index) });
        parts.push({ type: 'link', url: `/lekh/${slug}/`, children: [{ type: 'text', value: m[1] }] });
        last = m.index + m[1].length;
      }
      if (!parts.length) continue;
      if (last < child.value.length) parts.push({ type: 'text', value: child.value.slice(last) });
      node.children.splice(i, 1, ...parts);
      i += parts.length - 1;
    }
  };
  walk(tree);
}

export function remarkAutolink() {
  return (tree, file) => {
    const path = file.history?.[0] ?? file.path ?? '';
    if (!/[\\/]articles[\\/]/.test(path)) return;
    if (file.data?.astro?.frontmatter?.autolink === false) return;
    linkTree(tree, basename(path).replace(/\.md$/, ''));
  };
}
