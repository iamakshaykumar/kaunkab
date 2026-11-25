import { describe, expect, it } from 'vitest';
import { relatedArticles } from '../src/lib/related';

const A = (id: string, era: string, tags: string[] = [], series?: string, kaun: string[] = [], kahan: string[] = []) =>
  ({ id, era, tags, series: series ? { id: series } : undefined, kaun, kahan });

describe('relatedArticles', () => {
  const cur = A('cur', 'prachin', ['maurya', 'bauddh-dharm'], 's1', ['अशोक'], ['पाटलिपुत्र']);
  const all = [
    cur,
    A('sameEra', 'prachin'),
    A('sameTag', 'adhunik', ['bauddh-dharm']),
    A('sameSeries', 'prachin', ['maurya'], 's1'),
    A('samePerson', 'adhunik', [], undefined, ['अशोक']),
    A('samePlace', 'adhunik', [], undefined, [], ['पाटलिपुत्र']),
    A('unrelated', 'adhunik', ['x']),
  ];
  it('ranks shared tags/people above places and era, and leaves out series siblings', () => {
    expect(relatedArticles(cur, all, 6).map((a) => a.id)).toEqual(['samePerson', 'sameTag', 'sameEra', 'samePlace']);
  });
  it('respects n', () => {
    expect(relatedArticles(cur, all, 2)).toHaveLength(2);
  });
  it('keeps same-series items when the current article has no series', () => {
    const r = relatedArticles(A('c', 'prachin', ['t']), [A('x', 'adhunik', ['t'], 's1')], 3);
    expect(r.map((a) => a.id)).toEqual(['x']);
  });
  it('breaks ties by id', () => {
    const r = relatedArticles(A('c', 'prachin'), [A('z', 'prachin'), A('b', 'prachin')], 3);
    expect(r.map((a) => a.id)).toEqual(['b', 'z']);
  });
});
