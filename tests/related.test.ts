import { describe, expect, it } from 'vitest';
import { relatedArticles } from '../src/lib/related';

const A = (id: string, era: string, tags: string[] = [], series?: string) =>
  ({ id, era, tags, series: series ? { id: series } : undefined });

describe('relatedArticles', () => {
  const cur = A('cur', 'prachin', ['maurya', 'bauddh'], 's1');
  const all = [
    cur,
    A('sameEra', 'prachin'),
    A('sameTag', 'adhunik', ['bauddh']),
    A('sameSeries', 'adhunik', [], 's1'),
    A('unrelated', 'adhunik', ['x']),
  ];
  it('ranks series > tag > era and excludes current and unrelated', () => {
    expect(relatedArticles(cur, all, 5).map((a) => a.id)).toEqual(['sameSeries', 'sameTag', 'sameEra']);
  });
  it('respects n', () => {
    expect(relatedArticles(cur, all, 2)).toHaveLength(2);
  });
  it('breaks ties by id', () => {
    const r = relatedArticles(A('c', 'prachin'), [A('z', 'prachin'), A('b', 'prachin')], 3);
    expect(r.map((a) => a.id)).toEqual(['b', 'z']);
  });
});
