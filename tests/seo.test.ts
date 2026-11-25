import { describe, expect, it } from 'vitest';
import { metaDescription } from '../src/lib/seo';
import { buildTermMap, linkTree, termsForTitle } from '../src/lib/remark-autolink.mjs';

describe('metaDescription', () => {
  it('keeps short text as is', () => {
    expect(metaDescription('छोटा सारांश।')).toBe('छोटा सारांश।');
  });
  it('keeps whole sentences that fit in 160 characters', () => {
    const a = 'क'.repeat(90) + '।';
    const b = ' ' + 'ख'.repeat(90) + '।';
    expect(metaDescription(a + b)).toBe(a);
  });
  it('cuts long single sentences at a word boundary with an ellipsis', () => {
    const s = Array.from({ length: 60 }, () => 'शब्द').join(' ');
    const out = metaDescription(s);
    expect([...out].length).toBeLessThanOrEqual(160);
    expect(out.endsWith('शब्द…')).toBe(true);
  });
});

describe('remark autolink', () => {
  it('derives link terms from titles', () => {
    expect(termsForTitle('अशोक और कलिंग युद्ध')).toEqual(['अशोक और कलिंग युद्ध', 'अशोक', 'कलिंग युद्ध']);
    expect(termsForTitle('औरंगज़ेब का शासन (1658–1707)')).toEqual(['औरंगज़ेब का शासन', 'औरंगज़ेब के शासन', 'औरंगज़ेब']);
    expect(termsForTitle('संत कबीर')).toEqual(['संत कबीर', 'कबीर']);
    expect(termsForTitle('अबुल फ़ज़ल — अकबरनामा के रचयिता')).toEqual(['अबुल फ़ज़ल']);
  });

  it('gives a shared term to the article whose whole title it is, else drops it', () => {
    const map = buildTermMap([
      ['pratap', 'महाराणा प्रताप'],
      ['haldighati', 'हल्दीघाटी का युद्ध और महाराणा प्रताप'],
      ['a1', 'क ख और साझा'],
      ['a2', 'क ख और साझा नहीं'],
    ]);
    expect(map.get('महाराणा प्रताप')).toBe('pratap');
  });

  const index = () => {
    const map = new Map([
      ['अशोक', 'ashok'],
      ['मौर्य साम्राज्य', 'maurya'],
    ]);
    const re = /(?<![\p{L}\p{M}])(मौर्य साम्राज्य|अशोक)(?![\p{L}\p{M}])/gu;
    return { map, re };
  };
  const para = (...children: object[]) => ({ type: 'root', children: [{ type: 'paragraph', children }] });

  it('links only the first mention, never the article itself, and skips headings', () => {
    const tree: any = {
      type: 'root',
      children: [
        { type: 'heading', depth: 2, children: [{ type: 'text', value: 'अशोक' }] },
        { type: 'paragraph', children: [{ type: 'text', value: 'अशोक ने मौर्य साम्राज्य बढ़ाया। फिर अशोक ने…' }] },
      ],
    };
    linkTree(tree, 'maurya', index());
    expect(tree.children[0].children).toEqual([{ type: 'text', value: 'अशोक' }]);
    const p = tree.children[1].children;
    expect(p.filter((n: any) => n.type === 'link')).toEqual([
      { type: 'link', url: '/lekh/ashok/', children: [{ type: 'text', value: 'अशोक' }] },
    ]);
    expect(p.map((n: any) => (n.type === 'link' ? n.children[0].value : n.value)).join('')).toBe(
      'अशोक ने मौर्य साम्राज्य बढ़ाया। फिर अशोक ने…',
    );
  });

  it('does not match inside a longer word', () => {
    const tree: any = para({ type: 'text', value: 'अशोकवाटिका' });
    linkTree(tree, 'x', index());
    expect(tree.children[0].children).toEqual([{ type: 'text', value: 'अशोकवाटिका' }]);
  });
});
